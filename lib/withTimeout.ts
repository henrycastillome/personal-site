/**
 * Races a promise against a deadline.
 *
 * The sign-in actions call out to Supabase/GoTrue, and a hung provider call
 * would otherwise ride the serverless function all the way to its hard timeout
 * (~10s on Netlify), which the platform kills with no useful body - the client
 * then sees an empty, unhelpful error. Wrapping each provider call in a shorter
 * deadline turns that into a clean, catchable rejection we can report.
 *
 * On timeout the underlying promise is not cancelled (fetch has no abort here);
 * it is simply left to settle and be ignored. That is fine for idempotent reads
 * and for OTP verification, where a late success has no side effect worth
 * keeping.
 */
export class TimeoutError extends Error {
  constructor(ms: number, label?: string) {
    super(`${label ?? 'Operation'} timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label?: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms, label)), ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer)) as Promise<T>;
}
