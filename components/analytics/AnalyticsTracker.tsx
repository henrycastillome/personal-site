'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics/track';

/**
 * Records a page view on mount, and one "section view" per section per session
 * as the visitor scrolls - the data behind the dashboard's section-engagement
 * panel. Renders nothing.
 *
 * Mounted once in MainLayout, so it runs on every public page load.
 */

// The section anchors on the homepage (see app/page.tsx). 'home' is excluded:
// it is always in view on load, so it says nothing about engagement.
const SECTION_IDS = ['projects', 'career', 'aboutme', 'contact'];
const SEEN_KEY = 'henry_sections_seen';

export function AnalyticsTracker() {
  useEffect(() => {
    track('pageview');

    // Dedupe section views within a session so one long read is not counted as
    // dozens of crossings.
    let seen: Set<string>;
    try {
      seen = new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? '[]'));
    } catch {
      seen = new Set();
    }
    const persist = () => {
      try {
        sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
      } catch {
        // best effort
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || seen.has(entry.target.id)) continue;
          seen.add(entry.target.id);
          persist();
          track('section_view', entry.target.id);
        }
      },
      // Fire once a section crosses into the upper three-quarters of the
      // viewport - works for sections both shorter and taller than the screen.
      { rootMargin: '0px 0px -25% 0px', threshold: 0 }
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
