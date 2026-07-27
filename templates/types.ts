import type {
  HeroContent,
  AboutContent,
  Project,
  WorkHistory,
  ContactContent,
  SiteSettings,
} from '@/lib/types';

/**
 * The fully-fetched, sanitised content the site renders. Produced by
 * getPortfolioData() in app/page.tsx and passed to the Classic template - it
 * re-presents this data, it never fetches its own.
 */
export interface PortfolioData {
  hero: HeroContent | null;
  about: AboutContent | null;
  projects: Project[];
  workHistory: WorkHistory[];
  contact: ContactContent | null;
  settings: SiteSettings | null;
}
