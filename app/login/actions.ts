'use server';

import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/auth/adminEmails';
import { logAuthEvent } from '@/lib/auth/authLog';
import { withTimeout } from '@/lib/withTimeout';
import {
  LIMITS,
  maskPhone,
  type Channel,
  type ChannelQuota,
  type SignInOptions,
} from '@/lib/auth/quota';

/**
 * Sign-in actions.
 *
 * These are the only server actions in the app that run **unauthenticated** -
 * by definition, since the caller is trying to sign in. Three rules follow:
 *
 *  1. Never reveal whether an address or phone exists. Every path returns the
 *     same shape whether or not the account is real, so the form cannot be
 *     used to enumerate accounts.
 *  2. Never send anything to an address outside the ADMIN_EMAIL allowlist.
 *     The allowlist check happens here, server-side, before Supabase is asked
 *     to send anything.
 *  3. Never throw. A thrown server action serialises to `{}` on the client and
 *     leaves the button spinning - which is exactly the "it timed out with no
 *     error" symptom this file was rewritten to fix. Every path returns an
 *     ActionState, and every provider call is wrapped in a timeout so a hung
 *     dependency becomes a clean message instead of a dead request.
 */

export interface ActionState {
  ok: boolean;
  error?: string;
}

/**
 * How long to wait on any single Supabase/GoTrue call before giving up. Well
 * under Netlify's ~10s function ceiling, so we return a real message rather
 * than letting the platform kill the request with an empty body.
 */
const PROVIDER_TIMEOUT_MS = 8000;

/** Shown whenever a provider call throws or times out. Deliberately generic. */
const GENERIC_ERROR = 'Something went wrong on our end. Please try again.';
const SLOW_ERROR = 'This is taking longer than expected. Please try again.';

/** Turns a thrown value into the message shown to the user + logged. */
function describe(cause: unknown): { message: string; code: string } {
  if (cause && typeof cause === 'object' && 'name' in cause && cause.name === 'TimeoutError') {
    return { message: SLOW_ERROR, code: 'timeout' };
  }
  const message = cause instanceof Error ? cause.message : String(cause);
  return { message, code: 'exception' };
}

/* -------------------------------------------------------------------------- */
/* Quota                                                                       */
/* -------------------------------------------------------------------------- */

/** Counts sends inside the channel's window and derives the reset time. */
async function quotaFor(channel: Channel): Promise<ChannelQuota> {
  const { max, windowMinutes } = LIMITS[channel];
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  const db = createAdminClient();
  const { data, error } = await db
    .from('henry_auth_sends')
    .select('created_at')
    .eq('channel', channel)
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  // If the log is unreadable, fail *open* on counting but let Supabase's own
  // 429 be the real guard - better than locking the owner out of their site.
  const rows = error ? [] : (data ?? []);
  const used = rows.length;
  const remaining = Math.max(0, max - used);

  return {
    channel,
    used,
    remaining,
    max,
    resetsAt:
      remaining === 0 && rows[0]
        ? new Date(
            new Date(rows[0].created_at).getTime() + windowMinutes * 60_000
          ).toISOString()
        : null,
    available: true,
  };
}

async function recordSend(channel: Channel): Promise<void> {
  await createAdminClient().from('henry_auth_sends').insert({ channel });
}

/* -------------------------------------------------------------------------- */
/* User lookup                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Finds the account for an email.
 *
 * `listUsers()` returns only the first page (50 users), so on a Supabase
 * project shared with other apps the admin could sit past that page and never
 * be found - which would silently break SMS sign-in. Page through until the
 * address turns up or a sane cap is reached.
 */
async function findUserByEmail(email: string): Promise<User | null> {
  const target = email.trim().toLowerCase();
  const db = createAdminClient();
  const perPage = 200;
  const maxPages = 20; // up to 4000 users before we give up

  for (let page = 1; page <= maxPages; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users ?? [];
    const match = users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match;

    if (users.length < perPage) break; // last page reached
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Step one: the user has typed an address. Returns which channels they can
 * use, without confirming whether the account exists.
 */
export async function getSignInOptions(email: string): Promise<SignInOptions> {
  const [emailQuota, smsQuota] = await Promise.all([
    quotaFor('email'),
    quotaFor('sms'),
  ]);

  const generic: SignInOptions = { emailQuota, smsQuota, maskedPhone: null };

  // Not an admin address: return the neutral shape. No lookup, no send.
  if (!isAdminEmail(email)) {
    await logAuthEvent({ event: 'lookup', outcome: 'fail', email, code: 'not_admin' });
    return {
      ...generic,
      smsQuota: { ...smsQuota, available: false, reason: 'Not available' },
    };
  }

  // Is phone sign-in usable? Needs a confirmed number on this account. A lookup
  // failure here must not break email sign-in, so degrade to email-only.
  try {
    const user = await withTimeout(
      findUserByEmail(email),
      PROVIDER_TIMEOUT_MS,
      'listUsers'
    );

    const phone = user?.phone;
    const phoneConfirmed = Boolean(user?.phone_confirmed_at);

    if (!phone || !phoneConfirmed) {
      await logAuthEvent({ event: 'lookup', outcome: 'ok', email, code: 'no_phone' });
      return {
        ...generic,
        smsQuota: {
          ...smsQuota,
          available: false,
          reason: 'No verified phone on this account',
        },
      };
    }

    await logAuthEvent({ event: 'lookup', outcome: 'ok', email });
    return { emailQuota, smsQuota, maskedPhone: maskPhone(phone) };
  } catch (cause) {
    const { message, code } = describe(cause);
    await logAuthEvent({ event: 'lookup', outcome: 'error', email, code, message });
    return {
      ...generic,
      smsQuota: {
        ...smsQuota,
        available: false,
        reason: 'Text sign-in is unavailable right now',
      },
    };
  }
}

/** Sends the magic link. */
export async function sendMagicLink(
  email: string,
  origin: string
): Promise<ActionState> {
  if (!isAdminEmail(email)) {
    // Same response as success, so the form cannot probe the allowlist.
    await logAuthEvent({ event: 'send_email', outcome: 'fail', email, code: 'not_admin' });
    return { ok: true };
  }

  const quota = await quotaFor('email');
  if (quota.remaining === 0) {
    await logAuthEvent({ event: 'send_email', outcome: 'fail', email, code: 'quota' });
    return { ok: false, error: 'Email limit reached. Try a text message instead.' };
  }

  const started = Date.now();
  try {
    const supabase = await createClient();
    const { error } = await withTimeout(
      supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${origin}/auth/callback`,
        },
      }),
      PROVIDER_TIMEOUT_MS,
      'signInWithOtp(email)'
    );

    if (error && error.status !== 400) {
      await logAuthEvent({
        event: 'send_email',
        outcome: 'error',
        email,
        code: error.status ?? 'send_error',
        message: error.message,
        latencyMs: Date.now() - started,
      });
      return { ok: false, error: error.message };
    }

    await recordSend('email');
    await logAuthEvent({
      event: 'send_email',
      outcome: 'ok',
      email,
      latencyMs: Date.now() - started,
    });
    return { ok: true };
  } catch (cause) {
    const { message, code } = describe(cause);
    await logAuthEvent({
      event: 'send_email',
      outcome: 'error',
      email,
      code,
      message,
      latencyMs: Date.now() - started,
    });
    return { ok: false, error: code === 'timeout' ? SLOW_ERROR : GENERIC_ERROR };
  }
}

/** Sends a one-time code to the number already on the account. */
export async function sendSmsCode(email: string): Promise<ActionState> {
  if (!isAdminEmail(email)) {
    await logAuthEvent({ event: 'send_sms', outcome: 'fail', email, code: 'not_admin' });
    return { ok: true };
  }

  const quota = await quotaFor('sms');
  if (quota.remaining === 0) {
    await logAuthEvent({ event: 'send_sms', outcome: 'fail', email, code: 'quota' });
    return { ok: false, error: 'Text message limit reached. Try again later.' };
  }

  const started = Date.now();
  try {
    // The number is never taken from the form - it comes from the account, so a
    // caller cannot redirect a code to a phone of their choosing.
    const user = await withTimeout(
      findUserByEmail(email),
      PROVIDER_TIMEOUT_MS,
      'listUsers'
    );
    if (!user?.phone) {
      await logAuthEvent({ event: 'send_sms', outcome: 'fail', email, code: 'no_phone' });
      return { ok: true };
    }

    const supabase = await createClient();
    const { error } = await withTimeout(
      supabase.auth.signInWithOtp({
        phone: user.phone,
        options: { shouldCreateUser: false },
      }),
      PROVIDER_TIMEOUT_MS,
      'signInWithOtp(sms)'
    );

    if (error) {
      await logAuthEvent({
        event: 'send_sms',
        outcome: 'error',
        email,
        code: error.status ?? 'send_error',
        message: error.message,
        latencyMs: Date.now() - started,
      });
      return { ok: false, error: error.message };
    }

    await recordSend('sms');
    await logAuthEvent({
      event: 'send_sms',
      outcome: 'ok',
      email,
      latencyMs: Date.now() - started,
    });
    return { ok: true };
  } catch (cause) {
    const { message, code } = describe(cause);
    await logAuthEvent({
      event: 'send_sms',
      outcome: 'error',
      email,
      code,
      message,
      latencyMs: Date.now() - started,
    });
    return { ok: false, error: code === 'timeout' ? SLOW_ERROR : GENERIC_ERROR };
  }
}

/**
 * Verifies the texted code and establishes the session.
 *
 * Runs server-side so the auth cookies are set through the same server client
 * the middleware reads.
 */
export async function verifySmsCode(
  email: string,
  token: string
): Promise<ActionState> {
  if (!isAdminEmail(email)) {
    await logAuthEvent({ event: 'verify_sms', outcome: 'fail', email, code: 'not_admin' });
    return { ok: false, error: 'That code is not valid.' };
  }

  const started = Date.now();
  try {
    const user = await withTimeout(
      findUserByEmail(email),
      PROVIDER_TIMEOUT_MS,
      'listUsers'
    );
    if (!user?.phone) {
      await logAuthEvent({ event: 'verify_sms', outcome: 'fail', email, code: 'no_phone' });
      return { ok: false, error: 'That code is not valid.' };
    }

    const supabase = await createClient();
    const { error } = await withTimeout(
      supabase.auth.verifyOtp({
        phone: user.phone,
        token: token.trim(),
        type: 'sms',
      }),
      PROVIDER_TIMEOUT_MS,
      'verifyOtp'
    );

    if (error) {
      // Expected negative (wrong/expired code) vs unexpected provider failure.
      const expected = error.status === 400 || error.status === 401 || error.status === 403;
      await logAuthEvent({
        event: 'verify_sms',
        outcome: expected ? 'fail' : 'error',
        email,
        code: error.status ?? 'verify_error',
        message: error.message,
        latencyMs: Date.now() - started,
      });
      return { ok: false, error: 'That code is not valid or has expired.' };
    }

    await logAuthEvent({
      event: 'verify_sms',
      outcome: 'ok',
      email,
      latencyMs: Date.now() - started,
    });
    return { ok: true };
  } catch (cause) {
    const { message, code } = describe(cause);
    await logAuthEvent({
      event: 'verify_sms',
      outcome: 'error',
      email,
      code,
      message,
      latencyMs: Date.now() - started,
    });
    // The user did nothing wrong - a provider hang is not a bad code.
    return { ok: false, error: code === 'timeout' ? SLOW_ERROR : GENERIC_ERROR };
  }
}
