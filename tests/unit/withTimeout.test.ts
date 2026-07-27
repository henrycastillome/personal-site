import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withTimeout, TimeoutError } from '@/lib/withTimeout';

/**
 * withTimeout is what turns a hung Supabase call into a catchable rejection
 * instead of a dead request that rides the serverless function to its hard
 * kill. The sign-in actions depend on it rejecting on time and resolving
 * cleanly when the work beats the deadline.
 */

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('withTimeout', () => {
  it('resolves with the value when the promise beats the deadline', async () => {
    const promise = withTimeout(Promise.resolve('done'), 1000);
    await expect(promise).resolves.toBe('done');
  });

  it('rejects with a TimeoutError once the deadline passes', async () => {
    // A promise that never settles - only the deadline can resolve the race.
    const pending = new Promise<string>(() => {});
    const raced = withTimeout(pending, 5000, 'verifyOtp');

    const assertion = expect(raced).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  it('names the operation in the timeout message', async () => {
    const raced = withTimeout(new Promise<string>(() => {}), 3000, 'listUsers');
    const assertion = expect(raced).rejects.toThrow(/listUsers timed out after 3000ms/);
    await vi.advanceTimersByTimeAsync(3000);
    await assertion;
  });

  it('propagates a rejection from the underlying promise unchanged', async () => {
    const boom = new Error('provider exploded');
    await expect(withTimeout(Promise.reject(boom), 1000)).rejects.toBe(boom);
  });

  it('does not reject after the promise already resolved', async () => {
    const raced = withTimeout(Promise.resolve('fast'), 1000);
    await expect(raced).resolves.toBe('fast');
    // Advancing past the deadline must not produce a late unhandled rejection.
    await vi.advanceTimersByTimeAsync(2000);
  });
});
