import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sendOtp } from '@/lib/sms/bird';

/**
 * Bird is the delivery path for SMS sign-in codes, reached from the public
 * /api/auth/sms-hook endpoint. Two things make it worth covering closely:
 *
 *   - The request shape has to match Bird's OTP API exactly. A wrong field
 *     name fails at runtime, in production, on someone's sign-in attempt -
 *     there is no compile-time check against a remote contract.
 *   - It must never throw. The hook returns the error text to Supabase, which
 *     surfaces it in the sign-in form; an exception instead becomes an opaque
 *     500 and the user learns nothing.
 */

const ENV_KEYS = ['BIRD_ACCESS_KEY', 'BIRD_API_BASE', 'BIRD_OTP_TEMPLATE'] as const;
const ORIGINAL: Record<string, string | undefined> = {};

function setEnv(key: string, value: string | undefined) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

/** A stub fetch that records its call and resolves with the given response. */
function mockFetch(response: Partial<Response> & { text?: () => Promise<string> }) {
  const fn = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => '',
    ...response,
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

/** The parsed body of the first fetch call. */
function sentBody(fn: ReturnType<typeof vi.fn>) {
  return JSON.parse(fn.mock.calls[0][1].body);
}

beforeEach(() => {
  for (const k of ENV_KEYS) ORIGINAL[k] = process.env[k];
  // A known-good baseline; individual tests override what they care about.
  setEnv('BIRD_ACCESS_KEY', 'bk_us1_testkey');
  setEnv('BIRD_API_BASE', undefined);
  setEnv('BIRD_OTP_TEMPLATE', undefined);
});

afterEach(() => {
  for (const k of ENV_KEYS) setEnv(k, ORIGINAL[k]);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('configuration', () => {
  it('fails with a named variable when the access key is missing', async () => {
    const fetchMock = mockFetch({});
    setEnv('BIRD_ACCESS_KEY', undefined);

    const result = await sendOtp('+15551230000', '123456');

    expect(result.ok).toBe(false);
    expect(result.error).toContain('BIRD_ACCESS_KEY');
    // Must bail before the network call, not fire an unauthenticated request.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats an empty access key as missing', async () => {
    const fetchMock = mockFetch({});
    setEnv('BIRD_ACCESS_KEY', '');

    const result = await sendOtp('+15551230000', '123456');

    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('endpoint resolution', () => {
  it('derives the region from the access key prefix', async () => {
    const fetchMock = mockFetch({});
    await sendOtp('+15551230000', '123456');

    expect(fetchMock.mock.calls[0][0]).toBe('https://us1.platform.bird.com/v1/sms/messages');
  });

  it('follows the key to a different region', async () => {
    const fetchMock = mockFetch({});
    setEnv('BIRD_ACCESS_KEY', 'bk_eu1_testkey');

    await sendOtp('+31612345678', '123456');

    expect(fetchMock.mock.calls[0][0]).toBe('https://eu1.platform.bird.com/v1/sms/messages');
  });

  it('falls back to the default region for an unrecognised key format', async () => {
    const fetchMock = mockFetch({});
    setEnv('BIRD_ACCESS_KEY', 'legacy-key-with-no-region');

    const result = await sendOtp('+15551230000', '123456');

    // Degrading beats throwing: a key we cannot parse may still be valid.
    expect(result.ok).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe('https://us1.platform.bird.com/v1/sms/messages');
  });

  it('lets BIRD_API_BASE override the derived host', async () => {
    const fetchMock = mockFetch({});
    setEnv('BIRD_API_BASE', 'http://localhost:4599');

    await sendOtp('+15551230000', '123456');

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:4599/v1/sms/messages');
  });
});

describe('request shape', () => {
  it('posts JSON with bearer auth', async () => {
    const fetchMock = mockFetch({});
    await sendOtp('+15551230000', '123456');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer bk_us1_testkey');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('matches Bird\'s documented OTP body exactly', async () => {
    const fetchMock = mockFetch({});
    await sendOtp('+14155551234', '123456');

    expect(sentBody(fetchMock)).toEqual({
      to: '+14155551234',
      template: {
        name: 'bird_otp_verification',
        parameters: { code: '123456' },
      },
    });
  });

  it('allows the template name to be overridden', async () => {
    const fetchMock = mockFetch({});
    setEnv('BIRD_OTP_TEMPLATE', 'my_custom_template');

    await sendOtp('+15551230000', '123456');

    expect(sentBody(fetchMock).template.name).toBe('my_custom_template');
  });

  it('sends the phone number through verbatim', async () => {
    const fetchMock = mockFetch({});
    // Normalising to E.164 is the caller's job; mangling it here would break
    // numbers this function was never taught about.
    await sendOtp('+441632960961', '123456');

    expect(sentBody(fetchMock).to).toBe('+441632960961');
  });

  it('preserves a code with leading zeros as a string', async () => {
    const fetchMock = mockFetch({});
    await sendOtp('+15551230000', '007123');

    // Coercing to a number here would text the user "7123" and the code
    // would never verify.
    expect(sentBody(fetchMock).template.parameters.code).toBe('007123');
  });
});

describe('failure handling', () => {
  it('reports the status and body when Bird rejects the send', async () => {
    mockFetch({ ok: false, status: 422, text: async () => 'unregistered template' });

    const result = await sendOtp('+15551230000', '123456');

    expect(result.ok).toBe(false);
    expect(result.error).toContain('422');
    expect(result.error).toContain('unregistered template');
  });

  it('truncates a long error body', async () => {
    mockFetch({ ok: false, status: 500, text: async () => 'x'.repeat(5000) });

    const result = await sendOtp('+15551230000', '123456');

    // An HTML error page would otherwise flood the function log and the form.
    expect(result.error!.length).toBeLessThan(400);
  });

  it('does not leak the access key in an error', async () => {
    mockFetch({ ok: false, status: 401, text: async () => 'unauthorized' });

    const result = await sendOtp('+15551230000', '123456');

    // The error reaches the sign-in form, so it must stay free of credentials.
    expect(result.error).not.toContain('bk_us1_testkey');
  });

  it('returns an error rather than throwing when the network fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const result = await sendOtp('+15551230000', '123456');

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Could not reach Bird');
  });

  it('survives an unreadable error body', async () => {
    mockFetch({
      ok: false,
      status: 502,
      text: async () => {
        throw new Error('stream already consumed');
      },
    });

    const result = await sendOtp('+15551230000', '123456');

    expect(result.ok).toBe(false);
    expect(result.error).toContain('502');
  });
});

describe('success', () => {
  it('reports ok with no error', async () => {
    mockFetch({ ok: true, status: 200, text: async () => '{"id":"msg_1"}' });

    const result = await sendOtp('+15551230000', '123456');

    expect(result).toEqual({ ok: true });
  });
});
