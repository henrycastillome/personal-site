/**
 * TypeScript interfaces for all data models
 */

export interface HeroContent {
  id: string;
  /** Lead-in line above the headline, e.g. "Hi, I'm Henry Melo. I am a". */
  greeting?: string;
  /**
   * Retired. Its content was merged into `greeting`; no longer shown or
   * written by the CMS. The column still holds the old value.
   */
  title?: string;
  /** The headline itself. */
  subtitle?: string;
  description?: string;
  /** Primary button label. Its destination is the Contact email. */
  cta_text?: string;
  /** Secondary button label. Its destination is the Contact LinkedIn URL. */
  cta_secondary_text?: string;
  /**
   * Retired. The primary button builds a mailto: from the contact email, so
   * this is no longer read or written.
   */
  cta_link?: string;
  /** Retired - nothing renders a hero background image. */
  background_image?: string;
  profile_image?: string;
  updated_at: string;
}

export interface AboutContent {
  id: string;
  heading: string;
  bio: string; // HTML string from TipTap
  profile_image?: string;
  /** @deprecated Migrated into gallery_images by migration 016. */
  secondary_image?: string;
  /** Extra photos stacked under profile_image, any number. */
  gallery_images?: string[];
  skills?: string[];
  updated_at: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  description?: string;
  icon?: string; // Icon name from react-icons
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  short_description?: string;
  /**
   * Retired. Superseded by the four case-study blocks below; no longer shown
   * or written by the CMS. The column still holds the earlier free-text
   * version of this content.
   */
  full_description?: string;
  /** Case-study blocks, all rich text from TipTap. */
  problem?: string;
  process?: string;
  solution?: string;
  impact?: string;
  image?: string;
  technologies?: string[]; // Array of tech tags
  metrics?: ProjectMetric[]; // Key achievements
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface WorkHistory {
  id: string;
  /** 'work' (default) or 'education' — drives the timeline node icon. */
  entry_type?: 'work' | 'education';
  company: string;
  position: string;
  location?: string;
  start_date: string; // ISO date string
  end_date?: string; // ISO date string, null for current position
  is_current: boolean;
  description?: string; // HTML string from TipTap
  achievements?: string[]; // Array of bullet points
  skills_used?: string[]; // Array of skills
  logos?: string[]; // Array of company logo URLs
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactContent {
  id: string;
  heading: string;
  subheading?: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
  location?: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_title: string;
  site_description?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  /** Section headings for the two collection sections. Rich text (HTML). */
  projects_heading?: string;
  background_heading?: string;
  /** Slug of the active public-site template. Validated against the registry. */
  active_template?: string;
  updated_at: string;
}

