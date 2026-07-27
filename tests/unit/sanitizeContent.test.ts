import { describe, it, expect } from 'vitest';
import {
  sanitizeHero,
  sanitizeAbout,
  sanitizeProject,
  sanitizeWorkHistory,
  sanitizeContact,
} from '@/lib/sanitizeContent';
import type {
  HeroContent,
  AboutContent,
  Project,
  WorkHistory,
  ContactContent,
} from '@/lib/types';

/**
 * The render-path defence. Content can reach these tables without passing
 * through the CMS - direct SQL, a service-role script, or another app sharing
 * this Supabase project - and every field below is rendered with
 * dangerouslySetInnerHTML.
 */
const XSS = '<p>safe</p><script>alert(1)</script>';
const CLEAN = '<p>safe</p>';

describe('sanitizeHero', () => {
  const hero = (over: Partial<HeroContent> = {}) =>
    ({ id: '1', updated_at: '', ...over }) as HeroContent;

  it('cleans every rich-text field', () => {
    const out = sanitizeHero(
      hero({ greeting: XSS, title: XSS, subtitle: XSS, description: XSS })
    )!;
    for (const v of [out.greeting, out.title, out.subtitle, out.description]) {
      expect(v).toBe(CLEAN);
    }
  });

  it('returns null for null', () => {
    expect(sanitizeHero(null)).toBeNull();
  });

  it('preserves undefined rather than turning it into an empty string', () => {
    // Components branch on truthiness, so a missing field must stay missing.
    expect(sanitizeHero(hero({ subtitle: undefined })!)!.subtitle).toBeUndefined();
  });

  it('leaves non-HTML fields untouched', () => {
    const out = sanitizeHero(hero({ cta_text: 'Email me' }))!;
    expect(out.cta_text).toBe('Email me');
  });
});

describe('sanitizeAbout', () => {
  it('cleans heading and bio', () => {
    const out = sanitizeAbout({
      id: '1',
      heading: XSS,
      bio: XSS,
      updated_at: '',
    } as AboutContent)!;
    expect(out.heading).toBe(CLEAN);
    expect(out.bio).toBe(CLEAN);
  });

  it('returns null for null', () => {
    expect(sanitizeAbout(null)).toBeNull();
  });
});

describe('sanitizeProject', () => {
  it('cleans the title, intro and all four case-study blocks', () => {
    const out = sanitizeProject({
      id: '1',
      title: XSS,
      short_description: XSS,
      problem: XSS,
      process: XSS,
      solution: XSS,
      impact: XSS,
      order_index: 0,
      is_visible: true,
      created_at: '',
      updated_at: '',
    } as Project);

    for (const v of [
      out.title,
      out.short_description,
      out.problem,
      out.process,
      out.solution,
      out.impact,
    ]) {
      expect(v).toBe(CLEAN);
    }
  });

  it('leaves non-HTML fields alone', () => {
    const out = sanitizeProject({
      id: '1',
      title: '',
      image: 'https://example.com/a.png',
      technologies: ['a', 'b'],
      order_index: 3,
      is_visible: true,
      created_at: '',
      updated_at: '',
    } as Project);

    expect(out.image).toBe('https://example.com/a.png');
    expect(out.technologies).toEqual(['a', 'b']);
    expect(out.order_index).toBe(3);
  });
});

describe('sanitizeWorkHistory', () => {
  it('cleans position and description', () => {
    const out = sanitizeWorkHistory({
      id: '1',
      company: 'ACME',
      position: XSS,
      description: XSS,
      start_date: '2020-01-01',
      is_current: false,
      order_index: 0,
      is_visible: true,
      created_at: '',
      updated_at: '',
    } as WorkHistory);

    expect(out.position).toBe(CLEAN);
    expect(out.description).toBe(CLEAN);
    expect(out.company).toBe('ACME');
  });
});

describe('sanitizeContact', () => {
  it('cleans the heading but leaves the address alone', () => {
    const out = sanitizeContact({
      id: '1',
      heading: XSS,
      email: 'a@b.com',
      updated_at: '',
    } as ContactContent)!;

    expect(out.heading).toBe(CLEAN);
    expect(out.email).toBe('a@b.com');
  });

  it('returns null for null', () => {
    expect(sanitizeContact(null)).toBeNull();
  });
});
