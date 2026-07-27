import { describe, it, expect } from 'vitest';
import { fillDailyRange } from '@/lib/analytics/series';

/**
 * The visits chart's date axis depends on this producing a continuous, ordered,
 * zero-filled series. `now` is fixed so the assertions are deterministic.
 */

// 2026-07-25, mid-afternoon UTC - the day rounding must land on the 25th.
const NOW = new Date('2026-07-25T15:30:00Z');

describe('fillDailyRange', () => {
  it('returns exactly `days` points', () => {
    expect(fillDailyRange([], 7, NOW)).toHaveLength(7);
    expect(fillDailyRange([], 30, NOW)).toHaveLength(30);
  });

  it('ends on today (UTC) and is ascending', () => {
    const series = fillDailyRange([], 7, NOW);
    expect(series[0].day).toBe('2026-07-19');
    expect(series[6].day).toBe('2026-07-25');
    const days = series.map((r) => r.day);
    expect([...days].sort()).toEqual(days); // already ascending
  });

  it('zero-fills days with no data', () => {
    const series = fillDailyRange([], 3, NOW);
    expect(series.every((r) => r.views === 0 && r.visitors === 0)).toBe(true);
  });

  it('merges existing rows onto the right day', () => {
    const series = fillDailyRange(
      [{ day: '2026-07-24', views: 12, visitors: 5 }],
      3,
      NOW
    );
    expect(series).toEqual([
      { day: '2026-07-23', views: 0, visitors: 0 },
      { day: '2026-07-24', views: 12, visitors: 5 },
      { day: '2026-07-25', views: 0, visitors: 0 },
    ]);
  });

  it('ignores rows outside the window', () => {
    const series = fillDailyRange(
      [{ day: '2026-06-01', views: 99, visitors: 40 }],
      7,
      NOW
    );
    expect(series.some((r) => r.views === 99)).toBe(false);
    expect(series.every((r) => r.views === 0)).toBe(true);
  });

  it('coerces string counts (bigint from the RPC) to numbers', () => {
    const series = fillDailyRange(
      // The RPC can serialise counts as strings.
      [{ day: '2026-07-25', views: '7' as unknown as number, visitors: '3' as unknown as number }],
      2,
      NOW
    );
    const today = series[series.length - 1];
    expect(today.views).toBe(7);
    expect(today.visitors).toBe(3);
  });
});
