import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createAdminClient } from '@/lib/supabase/admin';
import { PageHeader } from '@/components/admin/PageHeader';
import {
  AnalyticsDashboard,
  type AnalyticsData,
} from '@/components/admin/AnalyticsDashboard';

/** The selectable look-back windows. */
const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

/** Recent-activity page sizes. */
const RECENT_SIZES = [10, 20, 50] as const;

function coerceDays(value: string | undefined): Range {
  const n = Number(value);
  return (RANGES as readonly number[]).includes(n) ? (n as Range) : 30;
}

function coerceSize(value: string | undefined): number {
  const n = Number(value);
  return (RECENT_SIZES as readonly number[]).includes(n) ? n : RECENT_SIZES[0];
}

function coercePage(value: string | undefined): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; ra_size?: string; ra_page?: string }>;
}) {
  // Authorization first; then read aggregates with the service-role client.
  // The RPCs are admin-readable either way, but this keeps every admin data
  // read on the same client.
  await requireAdmin();
  const sp = await searchParams;
  const days = coerceDays(sp.days);
  const recentSize = coerceSize(sp.ra_size);
  const recentPage = coercePage(sp.ra_page);
  const db = createAdminClient();

  const [
    overview,
    byDay,
    byCountry,
    byDevice,
    bySource,
    bySection,
    clicks,
    recentVisits,
  ] = await Promise.all([
    db.rpc('henry_analytics_overview', { days }),
    db.rpc('henry_analytics_by_day', { days }),
    db.rpc('henry_analytics_by_country', { days }),
    db.rpc('henry_analytics_by_device', { days }),
    db.rpc('henry_analytics_by_source', { days }),
    db.rpc('henry_analytics_by_section', { days }),
    db.rpc('henry_analytics_clicks', { days }),
    // Fetch one extra row: if it comes back, there's a next page. Only ever
    // pulls a single page from the database, never the whole history.
    db.rpc('henry_analytics_recent_visits', {
      days,
      max_rows: recentSize + 1,
      row_offset: (recentPage - 1) * recentSize,
    }),
  ]);

  // If the migration has not been run yet, the RPCs error; degrade to empty
  // rather than crashing the admin.
  const notReady = Boolean(overview.error);

  // The extra probe row means "there is a next page"; show only `recentSize`.
  let recentRows = recentVisits.data ?? [];
  if (recentVisits.error) {
    // Fallback for the pre-migration 2-arg function (no row_offset): fetch the
    // top of the list up to this page and slice the window client-side. Keeps
    // the feed working before migration 011 is re-run; the offset path above
    // takes over (and only ever pulls one page) once it is.
    const legacy = await db.rpc('henry_analytics_recent_visits', {
      days,
      max_rows: recentPage * recentSize + 1,
    });
    recentRows = (legacy.data ?? []).slice(
      (recentPage - 1) * recentSize,
      recentPage * recentSize + 1
    );
  }
  const recentHasNext = recentRows.length > recentSize;

  const data: AnalyticsData = {
    days,
    overview: overview.data?.[0] ?? {
      total_views: 0,
      unique_visitors: 0,
      email_clicks: 0,
      linkedin_clicks: 0,
    },
    byDay: byDay.data ?? [],
    byCountry: byCountry.data ?? [],
    byDevice: byDevice.data ?? [],
    bySource: bySource.data ?? [],
    bySection: bySection.data ?? [],
    clicks: clicks.data ?? [],
    recentVisits: recentRows.slice(0, recentSize),
    recentPage,
    recentSize,
    recentHasNext,
  };

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Who is visiting your site, where from, and what they click. Updated live; location needs the site deployed."
      />
      <AnalyticsDashboard data={data} notReady={notReady} />
    </>
  );
}
