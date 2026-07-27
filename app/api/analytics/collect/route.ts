import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { geoFromHeaders } from '@/lib/analytics/geo';
import { deviceFromUserAgent, isBot } from '@/lib/analytics/device';

/**
 * First-party analytics collector.
 *
 * The public site beacons events here (page views, link clicks, section
 * views). Location and device are derived HERE from request headers - never
 * trusted from the body - and the IP is never stored, only the country/region/
 * city Netlify resolved at the edge.
 *
 * This is best-effort telemetry, not an audit log: it validates the event
 * shape, drops obvious bots and cross-origin posts, and otherwise always
 * answers 204 so a client beacon never blocks or surfaces an error.
 */

const EVENT_TYPES = new Set([
  'pageview',
  'click_email',
  'click_linkedin',
  'section_view',
]);

const MAX_LEN = 128;

interface Body {
  type?: string;
  visitorId?: string;
  path?: string;
  referrer?: string;
  source?: string;
}

/** Always 204: analytics must never make the site look broken. */
const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest) {
  try {
    // Same-origin only. sendBeacon/fetch set Origin; if it is present and does
    // not match our host, drop it. A missing Origin is tolerated.
    const origin = request.headers.get('origin');
    if (origin) {
      try {
        if (new URL(origin).host !== request.headers.get('host')) return noContent();
      } catch {
        return noContent();
      }
    }

    const ua = request.headers.get('user-agent');
    if (isBot(ua)) return noContent();

    // Read the raw text and parse: sendBeacon may not send a JSON content-type.
    const raw = await request.text();
    let body: Body;
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      return noContent();
    }

    const type = body.type;
    if (!type || !EVENT_TYPES.has(type)) return noContent();

    const geo = geoFromHeaders(request.headers);

    await createAdminClient()
      .from('henry_analytics_events')
      .insert({
        event_type: type,
        visitor_id: clip(body.visitorId),
        source: clip(body.source),
        path: clip(body.path) ?? '/',
        referrer_host: refererHost(body.referrer, request.headers.get('host')),
        country: geo.country,
        region: geo.region,
        city: geo.city,
        device: deviceFromUserAgent(ua),
      });

    return noContent();
  } catch {
    // Swallow everything - a logging failure must not reach the visitor.
    return noContent();
  }
}

/** Trims and length-caps a free-text field; empty/absent -> null. */
function clip(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = String(value).trim().slice(0, MAX_LEN);
  return trimmed || null;
}

/**
 * External host of the referrer, or null. Our own host counts as direct
 * traffic (null), so the sources table shows where people actually came from.
 */
function refererHost(referrer: string | undefined, ownHost: string | null): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).host.replace(/^www\./, '');
    if (!host || host === ownHost?.replace(/^www\./, '')) return null;
    return host.slice(0, MAX_LEN);
  } catch {
    return null;
  }
}
