/**
 * Bird SMS - one-time passcode delivery.
 *
 * Supabase's built-in MessageBird provider calls the *legacy* REST API, which
 * rejects access keys minted in the modern Bird platform ("Request not
 * allowed (incorrect access_key)"). So we take over via a Send SMS Hook and
 * call Bird ourselves.
 *
 * Uses Bird's OTP endpoint, which sends through a predefined verification
 * template. That means no workspace or channel id is needed, and the message
 * body is Bird's approved OTP copy rather than free text - which also avoids
 * the "trial account can only use predefined SMS template" class of rejection.
 */

/** Bird is region-partitioned, and the region is embedded in the access key. */
const DEFAULT_REGION = 'us1';
const OTP_TEMPLATE = 'bird_otp_verification';

export interface SendSmsResult {
  ok: boolean;
  error?: string;
}

/**
 * `bk_us1_xxxxx` -> `us1`. Falls back to the default rather than throwing, so
 * an unexpected key format degrades instead of breaking sign-in outright.
 */
function regionFromKey(accessKey: string): string {
  const match = /^bk_([a-z0-9]+)_/.exec(accessKey);
  return match?.[1] ?? DEFAULT_REGION;
}

function apiBase(accessKey: string): string {
  // Explicit override wins, for a different region or a mock in testing.
  return (
    process.env.BIRD_API_BASE ??
    `https://${regionFromKey(accessKey)}.platform.bird.com`
  );
}

/**
 * Sends a one-time passcode.
 *
 * `phone` must be E.164 (leading `+`). Supabase stores numbers without it, so
 * callers normalise before getting here.
 */
export async function sendOtp(phone: string, code: string): Promise<SendSmsResult> {
  const accessKey = process.env.BIRD_ACCESS_KEY;
  if (!accessKey) {
    return { ok: false, error: 'Bird is not configured: missing BIRD_ACCESS_KEY' };
  }

  const url = `${apiBase(accessKey)}/v1/sms/messages`;

  // Bound the call so a slow/hanging Bird can't blow Supabase's 5s Send-SMS-hook
  // budget - better to fail fast and cleanly than have Supabase time out at 5s.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
        template: {
          name: process.env.BIRD_OTP_TEMPLATE ?? OTP_TEMPLATE,
          parameters: { code },
        },
      }),
      signal: controller.signal,
    });
  } catch (cause) {
    return {
      ok: false,
      error: controller.signal.aborted
        ? 'Bird timed out'
        : `Could not reach Bird: ${String(cause)}`,
    };
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    // Bird's error shape varies; keep the raw body, truncated, so the cause is
    // visible in the function log without dumping an entire error page.
    const detail = await response.text().catch(() => '');
    return {
      ok: false,
      error: `Bird returned ${response.status}: ${detail.slice(0, 300)}`,
    };
  }

  return { ok: true };
}
