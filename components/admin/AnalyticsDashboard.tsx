import NextLink from 'next/link';
import { Box, Flex, Grid, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { fillDailyRange } from '@/lib/analytics/series';

/**
 * Presentational analytics dashboard. Server-rendered (no client JS): the only
 * interactivity is the range switch, which is plain links that reload with a
 * different `?days=`.
 *
 * All charts are CSS bars on purpose - no chart library, keeping the bundle and
 * the dependency list lean.
 */

export interface Overview {
  total_views: number;
  unique_visitors: number;
  email_clicks: number;
  linkedin_clicks: number;
}
export interface DayRow { day: string; views: number; visitors: number }
export interface CountryRow { country: string; region: string; city: string; views: number }
export interface DeviceRow { device: string; views: number }
export interface SourceRow { referrer_host: string; views: number }
export interface SectionRow { section: string; views: number; visitors: number }
export interface ClickRow { event_type: string; source: string; clicks: number }
export interface RecentVisit {
  visitor_id: string;
  last_seen: string;
  country: string | null;
  region: string | null;
  city: string | null;
  device: string | null;
  page_views: number;
  sections: string[] | null;
  email_clicks: number;
  linkedin_clicks: number;
}

export interface AnalyticsData {
  days: number;
  overview: Overview;
  byDay: DayRow[];
  byCountry: CountryRow[];
  byDevice: DeviceRow[];
  bySource: SourceRow[];
  bySection: SectionRow[];
  clicks: ClickRow[];
  recentVisits: RecentVisit[];
  recentPage: number;
  recentSize: number;
  recentHasNext: boolean;
}

const RANGES = [7, 30, 90];
const RECENT_SIZES = [10, 20, 50];

/** Builds an /admin/analytics URL preserving the range + pagination state. */
function raHref(days: number, size: number, page: number): string {
  return `/admin/analytics?days=${days}&ra_size=${size}&ra_page=${page}`;
}

const SECTION_LABELS: Record<string, string> = {
  projects: 'Projects',
  career: 'Background',
  aboutme: 'About',
  contact: 'Contact',
};

const num = (n: number) => Number(n ?? 0).toLocaleString();

export function AnalyticsDashboard({
  data,
  notReady,
}: {
  data: AnalyticsData;
  notReady?: boolean;
}) {
  if (notReady) {
    return (
      <Box
        p="5"
        bg="bg.surface"
        borderLeftWidth="3px"
        borderLeftColor="status.warning"
        borderRadius="md"
      >
        <Text textStyle="bodyBold" color="text.primary" mb="1">
          Analytics isn&apos;t set up yet
        </Text>
        <Text textStyle="caption" color="text.tertiary">
          Run migration <b>010_analytics.sql</b> in the Supabase SQL editor, then
          reload. Nothing is recorded until then.
        </Text>
      </Box>
    );
  }

  const { overview } = data;

  return (
    <VStack align="stretch" gap="8">
      <RangeTabs days={data.days} />

      {/* Overview */}
      <SimpleGrid columns={{ base: 2, lg: 4 }} gap="4">
        <StatCard label="Page views" value={overview.total_views} />
        <StatCard label="Unique visitors" value={overview.unique_visitors} />
        <StatCard label="Email clicks" value={overview.email_clicks} />
        <StatCard label="LinkedIn clicks" value={overview.linkedin_clicks} />
      </SimpleGrid>

      <Panel title="Visits over time">
        <VisitsChart rows={data.byDay} days={data.days} />
      </Panel>

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap="6">
        <Panel title="Top locations">
          <BarList
            rows={data.byCountry.map((r) => ({
              label: locationLabel(r),
              value: r.views,
            }))}
            emptyLabel="No location data yet"
          />
        </Panel>

        <Panel title="Devices">
          <BarList
            rows={data.byDevice.map((r) => ({
              label: capitalize(r.device),
              value: r.views,
            }))}
            emptyLabel="No visits yet"
          />
        </Panel>

        <Panel title="Traffic sources">
          <BarList
            rows={data.bySource.map((r) => ({
              label: r.referrer_host,
              value: r.views,
            }))}
            emptyLabel="No visits yet"
          />
        </Panel>

        <Panel title="Section engagement">
          <BarList
            rows={data.bySection.map((r) => ({
              label: SECTION_LABELS[r.section] ?? r.section,
              value: r.views,
            }))}
            emptyLabel="No scroll data yet"
          />
        </Panel>
      </Grid>

      <Panel title="Link clicks by placement">
        <ClicksTable rows={data.clicks} />
      </Panel>

      <Panel title="Recent activity">
        <RecentActivity
          visits={data.recentVisits}
          days={data.days}
          page={data.recentPage}
          size={data.recentSize}
          hasNext={data.recentHasNext}
        />
      </Panel>
    </VStack>
  );
}

/* -------------------------------------------------------------------------- */

function RangeTabs({ days }: { days: number }) {
  return (
    <Flex gap="2">
      {RANGES.map((r) => {
        const active = r === days;
        return (
          <NextLink key={r} href={`/admin/analytics?days=${r}`}>
            <Box
              px="4"
              py="2"
              borderRadius="button"
              borderWidth="1px"
              borderColor={active ? 'accent.brand' : 'border.default'}
              bg={active ? 'accent.brand' : 'bg.surface'}
              color={active ? 'text.inverse' : 'text.secondary'}
              textStyle="captionBold"
              cursor="pointer"
              _hover={active ? undefined : { borderColor: 'accent.brand' }}
            >
              Last {r} days
            </Box>
          </NextLink>
        );
      })}
    </Flex>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Box
      p="5"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
    >
      <Text textStyle="display" color="text.primary" lineHeight="1">
        {num(value)}
      </Text>
      <Text textStyle="caption" color="text.tertiary" mt="2">
        {label}
      </Text>
    </Box>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      p="5"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
    >
      <Text textStyle="label" color="text.primary" mb="4">
        {title}
      </Text>
      {children}
    </Box>
  );
}

/** Horizontal labelled bars, sorted as given, scaled to the largest value. */
function BarList({
  rows,
  emptyLabel,
}: {
  rows: { label: string; value: number }[];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <Text textStyle="caption" color="text.tertiary">
        {emptyLabel}
      </Text>
    );
  }
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <VStack align="stretch" gap="3">
      {rows.map((r, i) => (
        <Box key={`${r.label}-${i}`}>
          <Flex justify="space-between" mb="1" gap="3">
            <Text textStyle="caption" color="text.secondary" truncate>
              {r.label}
            </Text>
            <Text textStyle="captionBold" color="text.primary" flexShrink={0}>
              {num(r.value)}
            </Text>
          </Flex>
          <Box h="8px" bg="bg.muted" borderRadius="full" overflow="hidden">
            <Box
              h="full"
              w={`${Math.max((r.value / max) * 100, 2)}%`}
              bg="accent.brand"
              borderRadius="full"
            />
          </Box>
        </Box>
      ))}
    </VStack>
  );
}

/**
 * Vertical bars across the whole window (zero-filled), with a baseline axis and
 * evenly-spaced date labels underneath so a bar can be read without hovering.
 */
function VisitsChart({ rows, days }: { rows: DayRow[]; days: number }) {
  // Fill the range so the axis is continuous and the dates line up evenly.
  const series = fillDailyRange(rows, days, new Date());
  const max = Math.max(...series.map((r) => r.views), 1);

  if (series.every((r) => r.views === 0)) {
    return (
      <Text textStyle="caption" color="text.tertiary">
        No visits yet.
      </Text>
    );
  }

  // Roughly eight labels, always including the first and last day. The last is
  // forced in; drop the nearest stepped label if it would sit on top of it.
  const last = series.length - 1;
  const step = Math.max(1, Math.ceil(series.length / 8));
  const labelIndices = new Set<number>();
  for (let i = 0; i <= last; i += step) labelIndices.add(i);
  for (const idx of [...labelIndices]) {
    if (idx !== last && last - idx < step / 2) labelIndices.delete(idx);
  }
  labelIndices.add(last);

  return (
    <Box>
      <Flex
        align="end"
        gap="1"
        h="160px"
        borderBottomWidth="1px"
        borderColor="border.default"
        pb="1"
      >
        {series.map((r) => (
          <Flex
            key={r.day}
            direction="column"
            align="center"
            justify="end"
            flex="1"
            minW="4px"
            h="full"
            title={`${formatDay(r.day)}: ${num(r.views)} views, ${num(r.visitors)} visitors`}
          >
            <Box
              w="full"
              maxW="28px"
              h={`${(r.views / max) * 100}%`}
              minH={r.views > 0 ? '3px' : '0'}
              bg="accent.brand"
              borderTopRadius="sm"
            />
          </Flex>
        ))}
      </Flex>

      {/* X-axis: a label every `step` days, first and last always shown. Labels
          are absolutely positioned so they can overflow their (narrow) column
          into blank neighbours without shifting the bars above. */}
      <Flex gap="1" mt="2" h="16px">
        {series.map((r, i) => {
          if (!labelIndices.has(i)) {
            return <Box key={r.day} flex="1" minW="4px" />;
          }
          // Pin the first label to the left edge and the last to the right so
          // neither is clipped at the container boundary; centre the rest.
          const edge =
            i === 0
              ? { left: '0' }
              : i === last
                ? { right: '0' }
                : { left: '50%', transform: 'translateX(-50%)' };
          return (
            <Box key={r.day} flex="1" minW="4px" position="relative">
              <Text
                position="absolute"
                {...edge}
                textStyle="caption"
                color="text.tertiary"
                whiteSpace="nowrap"
              >
                {formatDay(r.day)}
              </Text>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}

function ClicksTable({ rows }: { rows: ClickRow[] }) {
  if (rows.length === 0) {
    return (
      <Text textStyle="caption" color="text.tertiary">
        No link clicks yet.
      </Text>
    );
  }
  const label = (t: string) =>
    t === 'click_email' ? 'Email' : t === 'click_linkedin' ? 'LinkedIn' : t;

  return (
    <VStack align="stretch" gap="0">
      <Flex
        justify="space-between"
        pb="2"
        borderBottomWidth="1px"
        borderColor="border.default"
      >
        <Text textStyle="caption" color="text.tertiary">Link · Placement</Text>
        <Text textStyle="caption" color="text.tertiary">Clicks</Text>
      </Flex>
      {rows.map((r, i) => (
        <Flex
          key={`${r.event_type}-${r.source}-${i}`}
          justify="space-between"
          py="3"
          borderBottomWidth={i === rows.length - 1 ? '0' : '1px'}
          borderColor="border.subtle"
        >
          <Text textStyle="caption" color="text.secondary">
            {label(r.event_type)} · {capitalize(r.source)}
          </Text>
          <Text textStyle="captionBold" color="text.primary">
            {num(r.clicks)}
          </Text>
        </Flex>
      ))}
    </VStack>
  );
}

/** A feed of recent visits, each summarising what one visitor did. */
function RecentActivity({
  visits,
  days,
  page,
  size,
  hasNext,
}: {
  visits: RecentVisit[];
  days: number;
  page: number;
  size: number;
  hasNext: boolean;
}) {
  const empty = !visits || visits.length === 0;
  const hasPrev = page > 1;

  return (
    <>
      {empty ? (
        <Text textStyle="caption" color="text.tertiary">
          {hasPrev ? 'No more activity on this page.' : 'No visits yet.'}
        </Text>
      ) : (
        <VStack align="stretch" gap="0">
          {visits.map((v, i) => (
            <Box
              key={`${v.visitor_id}-${v.last_seen}`}
              py="4"
              borderBottomWidth={i === visits.length - 1 ? '0' : '1px'}
              borderColor="border.subtle"
            >
              <Flex justify="space-between" align="baseline" gap="3" mb="1" wrap="wrap">
                <Text textStyle="captionBold" color="text.primary">
                  {visitLocation(v)} · {capitalize(v.device ?? 'unknown')}
                </Text>
                <Text textStyle="caption" color="text.tertiary" flexShrink={0}>
                  {formatDateTime(v.last_seen)}
                </Text>
              </Flex>
              <Text textStyle="caption" color="text.secondary">
                {visitSummary(v)}
              </Text>
              <Text textStyle="caption" color="text.muted" mt="1">
                Visitor {v.visitor_id.slice(0, 6)}
              </Text>
            </Box>
          ))}
        </VStack>
      )}

      {/* Pagination - only when there is more than one page to move through. */}
      {(hasPrev || hasNext) && (
        <Flex
          align="center"
          justify="space-between"
          gap="3"
          mt="4"
          pt="4"
          wrap="wrap"
          borderTopWidth="1px"
          borderColor="border.subtle"
        >
          <Flex align="center" gap="2">
            <Text textStyle="caption" color="text.tertiary">
              Per page
            </Text>
            {RECENT_SIZES.map((s) => {
              const active = s === size;
              return (
                <NextLink key={s} href={raHref(days, s, 1)}>
                  <Box
                    px="2.5"
                    py="1"
                    borderRadius="base"
                    borderWidth="1px"
                    borderColor={active ? 'accent.brand' : 'border.default'}
                    bg={active ? 'accent.brand' : 'bg.surface'}
                    color={active ? 'text.inverse' : 'text.secondary'}
                    textStyle="caption"
                    fontWeight={active ? 'bold' : 'normal'}
                    cursor="pointer"
                  >
                    {s}
                  </Box>
                </NextLink>
              );
            })}
          </Flex>

          <Flex align="center" gap="3">
            <PagerButton href={hasPrev ? raHref(days, size, page - 1) : undefined}>
              Prev
            </PagerButton>
            <Text textStyle="caption" color="text.secondary">
              Page {page}
            </Text>
            <PagerButton href={hasNext ? raHref(days, size, page + 1) : undefined}>
              Next
            </PagerButton>
          </Flex>
        </Flex>
      )}
    </>
  );
}

/** Prev/Next control: a link when enabled, a dimmed non-link when not. */
function PagerButton({ href, children }: { href?: string; children: React.ReactNode }) {
  const style = {
    px: '3',
    py: '1',
    borderRadius: 'base',
    borderWidth: '1px',
    textStyle: 'captionBold',
  } as const;

  if (!href) {
    return (
      <Box {...style} borderColor="border.subtle" color="text.muted" opacity={0.5} cursor="not-allowed">
        {children}
      </Box>
    );
  }
  return (
    <NextLink href={href}>
      <Box
        {...style}
        borderColor="border.default"
        color="text.secondary"
        cursor="pointer"
        _hover={{ borderColor: 'accent.brand', color: 'text.primary' }}
      >
        {children}
      </Box>
    </NextLink>
  );
}

/* -------------------------------------------------------------------------- */

function locationLabel(r: CountryRow): string {
  const parts = [r.city, r.region, r.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Unknown';
}

function visitLocation(v: RecentVisit): string {
  const parts = [v.city, v.region, v.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Unknown';
}

/** "Viewed the site · scrolled to Projects, About · clicked Email, LinkedIn" */
function visitSummary(v: RecentVisit): string {
  const parts: string[] = [];

  if (v.page_views > 0) {
    parts.push(v.page_views > 1 ? `Viewed the site (${num(v.page_views)}×)` : 'Viewed the site');
  }

  const sections = (v.sections ?? []).map((s) => SECTION_LABELS[s] ?? s);
  if (sections.length) parts.push(`scrolled to ${sections.join(', ')}`);

  const clicks: string[] = [];
  if (v.email_clicks > 0) clicks.push(v.email_clicks > 1 ? `Email ×${num(v.email_clicks)}` : 'Email');
  if (v.linkedin_clicks > 0)
    clicks.push(v.linkedin_clicks > 1 ? `LinkedIn ×${num(v.linkedin_clicks)}` : 'LinkedIn');
  if (clicks.length) parts.push(`clicked ${clicks.join(', ')}`);

  return parts.length ? parts.join(' · ') : 'Visited';
}

/** 'YYYY-MM-DD' (UTC) -> "Jul 25". Parsed as UTC to avoid an off-by-one day. */
function formatDay(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * ISO timestamp -> "Jul 25, 2:30 PM EDT". Always shown in US Eastern
 * (America/New_York handles the EST/EDT switch) rather than the server's
 * timezone, which is UTC on Netlify. The zone abbreviation is included so the
 * reading is unambiguous.
 */
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  });
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
