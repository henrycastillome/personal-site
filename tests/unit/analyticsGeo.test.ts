import { describe, it, expect } from 'vitest';
import { parseNetlifyGeo, geoFromHeaders } from '@/lib/analytics/geo';

/**
 * Geo is the one field a visitor cannot fake (it is derived server-side from
 * Netlify's header), and it is what powers the "where do visitors come from"
 * panel. The decoder has to be tolerant: a malformed header must degrade to
 * "unknown", never throw into the collector.
 */

function encode(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');
}

const SAMPLE = {
  city: 'San Francisco',
  country: { code: 'US', name: 'United States' },
  subdivision: { code: 'CA', name: 'California' },
};

describe('parseNetlifyGeo', () => {
  it('decodes country, region and city from the base64 header', () => {
    expect(parseNetlifyGeo(encode(SAMPLE))).toEqual({
      country: 'United States',
      region: 'California',
      city: 'San Francisco',
    });
  });

  it('returns nulls for a missing header (local dev)', () => {
    expect(parseNetlifyGeo(null)).toEqual({ country: null, region: null, city: null });
    expect(parseNetlifyGeo(undefined)).toEqual({ country: null, region: null, city: null });
  });

  it('returns nulls, not a throw, for a malformed header', () => {
    expect(parseNetlifyGeo('not-base64-$$$')).toEqual({
      country: null,
      region: null,
      city: null,
    });
    expect(parseNetlifyGeo(encode('a string, not an object'))).toEqual({
      country: null,
      region: null,
      city: null,
    });
  });

  it('fills only the fields Netlify provided', () => {
    expect(parseNetlifyGeo(encode({ country: { name: 'France' } }))).toEqual({
      country: 'France',
      region: null,
      city: null,
    });
  });
});

describe('geoFromHeaders', () => {
  const headers = (init: Record<string, string>) => new Headers(init);

  it('prefers Netlify x-nf-geo', () => {
    expect(geoFromHeaders(headers({ 'x-nf-geo': encode(SAMPLE) }))).toEqual({
      country: 'United States',
      region: 'California',
      city: 'San Francisco',
    });
  });

  it('falls back to flat headers when x-nf-geo is absent', () => {
    const result = geoFromHeaders(
      headers({
        'x-vercel-ip-country': 'DE',
        'x-vercel-ip-country-region': 'BE',
        'x-vercel-ip-city': 'Berlin',
      })
    );
    expect(result).toEqual({ country: 'DE', region: 'BE', city: 'Berlin' });
  });

  it('url-decodes a fallback city name', () => {
    const result = geoFromHeaders(
      headers({ 'x-vercel-ip-country': 'US', 'x-vercel-ip-city': 'San%20Francisco' })
    );
    expect(result.city).toBe('San Francisco');
  });

  it('returns all nulls when no geo headers are present', () => {
    expect(geoFromHeaders(headers({}))).toEqual({
      country: null,
      region: null,
      city: null,
    });
  });
});
