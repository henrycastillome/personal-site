/**
 * Turning the sparse "views per day" rows into a continuous daily series.
 *
 * henry_analytics_by_day only returns days that had traffic, so the visits chart
 * had uneven gaps and no real date axis. This fills every calendar day in the
 * window with zero where there was no activity, giving the chart an even,
 * labellable timeline.
 *
 * Days are keyed in UTC to match the RPC, which buckets on
 * `(created_at AT TIME ZONE 'UTC')::date`. `now` is a parameter so this stays
 * pure and testable.
 */

export interface DayPoint {
  day: string; // 'YYYY-MM-DD' (UTC)
  views: number;
  visitors: number;
}

const DAY_MS = 86_400_000;

/** UTC 'YYYY-MM-DD' for a timestamp. */
function utcDayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function fillDailyRange(
  rows: DayPoint[],
  days: number,
  now: Date
): DayPoint[] {
  const byDay = new Map(rows.map((r) => [r.day, r]));

  // Midnight UTC today - the last day in the window.
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const series: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = utcDayKey(today - i * DAY_MS);
    const row = byDay.get(key);
    series.push({
      day: key,
      // RPC counts can arrive as strings (bigint); coerce.
      views: Number(row?.views ?? 0),
      visitors: Number(row?.visitors ?? 0),
    });
  }
  return series;
}
