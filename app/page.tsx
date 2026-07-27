import { createClient } from '@/lib/supabase/server';
import {
  sanitizeHero,
  sanitizeAbout,
  sanitizeProject,
  sanitizeWorkHistory,
  sanitizeContact,
  sanitizeSiteSettings,
} from '@/lib/sanitizeContent';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { ClassicTemplate } from '@/templates/classic/ClassicTemplate';
import type {
  HeroContent,
  AboutContent,
  Project,
  WorkHistory,
  ContactContent,
  SiteSettings,
} from '@/lib/types';
import type { PortfolioData } from '@/templates/types';

async function getPortfolioData(): Promise<PortfolioData> {
  const supabase = await createClient();

  const [
    heroData,
    aboutData,
    projectsData,
    workHistoryData,
    contactData,
    settingsData,
  ] = await Promise.all([
    supabase.from('henry_hero_content').select('*').single(),
    supabase.from('henry_about_content').select('*').single(),
    supabase.from('henry_projects').select('*').order('order_index'),
    supabase.from('henry_work_history').select('*').order('start_date', { ascending: false }),
    supabase.from('henry_contact_content').select('*').single(),
    // maybeSingle: the row is seeded by migration 009, but tolerate its absence
    // rather than throwing on a project that has not run it yet.
    supabase.from('henry_site_settings').select('*').maybeSingle(),
  ]);

  // Sanitised here rather than in the components: every rich-text field below
  // is rendered with dangerouslySetInnerHTML, and writing is not the only way
  // content reaches these tables. See lib/sanitizeContent.ts.
  return {
    hero: sanitizeHero(heroData.data as HeroContent | null),
    about: sanitizeAbout(aboutData.data as AboutContent | null),
    projects: ((projectsData.data as Project[]) || []).map(sanitizeProject),
    workHistory: ((workHistoryData.data as WorkHistory[]) || []).map(
      sanitizeWorkHistory
    ),
    contact: sanitizeContact(contactData.data as ContactContent | null),
    settings: sanitizeSiteSettings(settingsData.data as SiteSettings | null),
  };
}

export default async function Home() {
  const data = await getPortfolioData();

  return (
    <>
      {/* Mounted outside the template so the section-scroll tracker keeps
          working regardless of what the page renders below. */}
      <AnalyticsTracker />
      <ClassicTemplate data={data} />
    </>
  );
}
