import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { getPortfolioData } from '@/lib/portfolio';
import { resolveTemplate } from '@/templates/registry';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const data = await getPortfolioData();

  // `?template=` is a read-only preview override (used by the admin Preview
  // links); otherwise render the template the CMS has active. resolveTemplate
  // falls back to Classic for an unknown slug.
  const preview = (await searchParams).template;
  const { Component } = resolveTemplate(preview ?? data.settings?.active_template);

  return (
    <>
      {/* Mounted outside the template so the section-scroll tracker keeps
          working regardless of what renders below. */}
      <AnalyticsTracker />
      <Component data={data} />
    </>
  );
}
