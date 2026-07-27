import { NextResponse, type NextRequest } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { sendOtp } from '@/lib/sms/bird';

/**
 * Supabase "Send SMS Hook".
 *
 * Supabase generates the one-time code, then POSTs it here instead of sending
 * it itself. We deliver it through Bird's modern platform API - the reason
 * this endpoint exists at all is that Supabase's built-in MessageBird provider
 * speaks the legacy REST API, which rejects Bird-platform access keys.
 *
 * This route is PUBLIC - Supabase's servers must reach it - so the signature
 * check is the only thing standing between the internet and an endpoint that
 * sends text messages. It runs before anything else and before the body is
 * parsed.
 *
 * Configure at: Supabase -> Authentication -> Hooks -> Send SMS hook
 *   URI:    https://<your-domain>/api/auth/sms-hook
 *   Secret: the generated v1,whsec_... value, stored as SEND_SMS_HOOK_SECRET
 */

/**
 * Runs on the Edge runtime. Supabase gives the Send SMS hook only 5 seconds to
 * respond; OTP sign-in is infrequent, so a Node serverless function is almost
 * always cold and its multi-second cold start alone can blow that budget
 * ("Failed to reach hook within maximum time of 5 seconds"). Edge cold-starts
 * in milliseconds, leaving nearly the whole budget for the Bird call. Everything
 * here is Edge-safe: Web `fetch`, and standardwebhooks is pure JS.
 */
export const runtime = 'edge';

interface SmsHookPayload {
  user: { phone?: string };
  sms: { otp: string };
}

export async function POST(request: NextRequest) {
  const secret = process.env.SEND_SMS_HOOK_SECRET;
  if (!secret) {
    console.error('[sms-hook] SEND_SMS_HOOK_SECRET is not set');
    return NextResponse.json({ error: { message: 'Hook not configured' } }, { status: 500 });
  }

  // The signature covers the exact bytes sent, so verify the raw text before
  // any JSON parsing.
  const raw = await request.text();

  let payload: SmsHookPayload;
  try {
    /**
     * Supabase hands out the secret as `v1,whsec_<base64>`; the verifier wants
     * just the base64 portion.
     */
    const webhook = new Webhook(secret.replace(/^v1,\s*whsec_/, ''));
    payload = webhook.verify(raw, {
      'webhook-id': request.headers.get('webhook-id') ?? '',
      'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
      'webhook-signature': request.headers.get('webhook-signature') ?? '',
    }) as SmsHookPayload;
  } catch {
    // Deliberately vague: an unauthenticated caller learns nothing about why.
    return NextResponse.json({ error: { message: 'Invalid signature' } }, { status: 401 });
  }

  const otp = payload?.sms?.otp;
  const phone = payload?.user?.phone;

  if (!otp || !phone) {
    return NextResponse.json(
      { error: { message: 'Missing phone or code' } },
      { status: 400 }
    );
  }

  // Supabase stores numbers without the leading +; Bird expects E.164 with it.
  const e164 = phone.startsWith('+') ? phone : `+${phone}`;

  // Bird's OTP template supplies the wording; we pass only the code.
  const result = await sendOtp(e164, otp);

  if (!result.ok) {
    // Logged for the function log; the message is returned so Supabase can
    // surface it, which is how provider errors reach the sign-in form.
    console.error('[sms-hook] send failed:', result.error);
    return NextResponse.json(
      { error: { message: result.error ?? 'Could not send the code' } },
      { status: 502 }
    );
  }

  // An empty object tells Supabase the hook handled delivery.
  return NextResponse.json({});
}
