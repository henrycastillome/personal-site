import { createClient } from '@/lib/supabase/server';
import {
  sanitizeHero,
  sanitizeAbout,
  sanitizeProject,
  sanitizeWorkHistory,
  sanitizeContact,
  sanitizeSiteSettings,
} from '@/lib/sanitizeContent';
import type {
  HeroContent,
  AboutContent,
  Project,
  WorkHistory,
  ContactContent,
  SiteSettings,
} from '@/lib/types';
import type { PortfolioData } from '@/templates/types';

/**
 * Fetches and sanitises all public portfolio content. Shared by the homepage
 * and every template preview so there is one source of truth for the data a
 * template renders.
 */
export async function getPortfolioData(): Promise<PortfolioData> {
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
    supabase.from('henry_site_settings').select('*').maybeSingle(),
  ]);

  // Sanitised here rather than in the components: every rich-text field is
  // rendered with dangerouslySetInnerHTML. See lib/sanitizeContent.ts.
  return {
    hero: sanitizeHero(heroData.data as HeroContent | null),
    about: sanitizeAbout(aboutData.data as AboutContent | null),
    projects: ((projectsData.data as Project[]) || []).map(sanitizeProject),
    workHistory: ((workHistoryData.data as WorkHistory[]) || []).map(sanitizeWorkHistory),
    contact: sanitizeContact(contactData.data as ContactContent | null),
    settings: sanitizeSiteSettings(settingsData.data as SiteSettings | null),
  };
}
