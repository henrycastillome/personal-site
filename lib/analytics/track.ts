/**
 * Client-side analytics beacons.
 *
 * Fire-and-forget: uses navigator.sendBeacon so an event survives the
 * navigation it describes (a mailto opening the mail client, a LinkedIn link
 * leaving the page). Everything is wrapped so a failure is silent - analytics
 * must never interfere with the site.
 *
 * The only identifier is a random UUID kept in localStorage. No cookies, no
 * personal data; location and device are added server-side by the collector.
 */

const VISITOR_KEY = 'henry_vid';
const ENDPOINT = '/api/analytics/collect';

export type EventType =
  | 'pageview'
  | 'click_email'
  | 'click_linkedin'
  | 'section_view';

/** Stable anonymous visitor id, created on first visit. */
export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    // Private mode / storage blocked: still send events, just uncorrelated.
    return 'anon';
  }
}

export function track(type: EventType, source?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({
      type,
      visitorId: getVisitorId(),
      path: window.location.pathname,
      referrer: document.referrer || undefined,
      source,
    });
    const blob = new Blob([payload], { type: 'application/json' });
    if (navigator.sendBeacon?.(ENDPOINT, blob)) return;
    // Fallback for the rare browser without sendBeacon.
    void fetch(ENDPOINT, { method: 'POST', body: payload, keepalive: true });
  } catch {
    // Ignore - never let tracking throw into a click handler.
  }
}

/** Convenience for the CTA links; `source` is 'nav' | 'hero' | 'contact'. */
export function trackClick(
  type: 'click_email' | 'click_linkedin',
  source: string
): void {
  track(type, source);
}
