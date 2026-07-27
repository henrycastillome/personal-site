import { createAdminClient } from '@/lib/supabase/admin';
import { maskEmail, type Channel } from '@/lib/auth/quota';

/**
 * The sign-in event log (see migration 008).
 *
 * This exists to answer "why did my sign-in fail?" after the fact. Every
 * sign-in action records an outcome here, so a timed-out OTP verify or a
 * provider rejection leaves a trace that can be read from the SQL editor
 * instead of vanishing into a serverless log.
 */

export type AuthEvent =
  | 'lookup'
  | 'send_email'
  | 'send_sms'
  | 'verify_sms'
  | 'signout';
export type AuthOutcome = 'ok' | 'fail' | 'error';

export interface AuthEventInput {
  event: AuthEvent;
  outcome: AuthOutcome;
  channel?: Channel;
  /** Full address; masked before it is written, never stored raw. */
  email?: string;
  /** Provider or HTTP status code, e.g. 'otp_expired', '429'. */
  code?: string | number | null;
  /** Human message; truncated before writing. */
  message?: string | null;
  /** Provider call duration in ms. */
  latencyMs?: number;
}

/** Error text is truncated so a stray HTML error page can't bloat a row. */
const MAX_MESSAGE = 300;

/**
 * Writes one event. Deliberately never throws and never rejects: logging is a
 * side channel, and a logging failure must not turn a working sign-in into a
 * broken one. Any error is swallowed to the server console.
 */
export async function logAuthEvent(input: AuthEventInput): Promise<void> {
  try {
    const db = createAdminClient();
    await db.from('henry_auth_events').insert({
      event: input.event,
      outcome: input.outcome,
      channel: input.channel ?? null,
      masked_email: input.email ? maskEmail(input.email) : null,
      error_code: input.code != null ? String(input.code) : null,
      error_message: input.message ? input.message.slice(0, MAX_MESSAGE) : null,
      latency_ms:
        typeof input.latencyMs === 'number' ? Math.round(input.latencyMs) : null,
    });
  } catch (cause) {
    console.error('[authLog] failed to record event', input.event, cause);
  }
}
