import { sanitizeRichText } from '@/lib/sanitize';
import type {
  HeroContent,
  AboutContent,
  Project,
  WorkHistory,
  ContactContent,
  SiteSettings,
} from '@/lib/types';

/**
 * Sanitising on the render path, as defence in depth.
 *
 * The CMS already sanitises on write, but every rich-text field is rendered
 * through `dangerouslySetInnerHTML`, so anything that reaches these tables by
 * another route would be trusted blindly - direct SQL, a service-role script,
 * content that predates the sanitiser, or another application, since this
 * Supabase project is shared (hence the `henry_` table prefix).
 *
 * This runs in server components only. Do NOT move it into RichText: that
 * component is pulled into client bundles by the 'use client' sections, and
 * the sanitiser has no business shipping to the browser.
 */

/** Sanitises one field, preserving null/undefined so callers can test truthiness. */
function clean<T extends string | null | undefined>(value: T): T {
  return (value ? sanitizeRichText(value) : value) as T;
}

export function sanitizeHero(hero: HeroContent | null): HeroContent | null {
  if (!hero) return null;
  return {
    ...hero,
    greeting: clean(hero.greeting),
    title: clean(hero.title),
    subtitle: clean(hero.subtitle),
    description: clean(hero.description),
  };
}

export function sanitizeAbout(about: AboutContent | null): AboutContent | null {
  if (!about) return null;
  return {
    ...about,
    heading: clean(about.heading),
    bio: clean(about.bio),
  };
}

export function sanitizeProject(project: Project): Project {
  return {
    ...project,
    title: clean(project.title),
    short_description: clean(project.short_description),
    problem: clean(project.problem),
    process: clean(project.process),
    solution: clean(project.solution),
    impact: clean(project.impact),
  };
}

export function sanitizeWorkHistory(entry: WorkHistory): WorkHistory {
  return {
    ...entry,
    position: clean(entry.position),
    description: clean(entry.description),
  };
}

export function sanitizeContact(
  contact: ContactContent | null
): ContactContent | null {
  if (!contact) return null;
  return {
    ...contact,
    heading: clean(contact.heading),
  };
}

export function sanitizeSiteSettings(
  settings: SiteSettings | null
): SiteSettings | null {
  if (!settings) return null;
  return {
    ...settings,
    projects_heading: clean(settings.projects_heading),
    background_heading: clean(settings.background_heading),
  };
}
