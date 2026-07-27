/**
 * Deriving a visitor's coarse location from request headers.
 *
 * On Netlify every request carries an `x-nf-geo` header: base64-encoded JSON
 * with the visitor's country, subdivision (region) and city, resolved at the
 * edge. We read only those derived fields - never the IP - and store them.
 *
 * Locally there is no such header, so everything comes back null and the
 * dashboard shows "Unknown". Real location only appears once deployed.
 */

export interface GeoLocation {
  country: string | null;
  region: string | null;
  city: string | null;
}

const EMPTY: GeoLocation = { country: null, region: null, city: null };

/** Decodes Netlify's base64 `x-nf-geo` JSON. Any malformed value -> empty. */
export function parseNetlifyGeo(headerValue: string | null | undefined): GeoLocation {
  if (!headerValue) return EMPTY;
  try {
    const decoded = Buffer.from(headerValue, 'base64').toString('utf8');
    const json = JSON.parse(decoded);
    return {
      country: json?.country?.name ?? null,
      region: json?.subdivision?.name ?? null,
      city: json?.city ?? null,
    };
  } catch {
    return EMPTY;
  }
}

/**
 * Best-effort location from a request's headers. Prefers Netlify's `x-nf-geo`;
 * falls back to the flatter country/region/city headers other platforms set,
 * so the same code degrades sensibly off Netlify.
 */
export function geoFromHeaders(headers: Headers): GeoLocation {
  const nf = parseNetlifyGeo(headers.get('x-nf-geo'));
  if (nf.country || nf.region || nf.city) return nf;

  const country =
    headers.get('x-country') ?? headers.get('x-vercel-ip-country') ?? null;
  const region = headers.get('x-vercel-ip-country-region') ?? null;
  const rawCity = headers.get('x-vercel-ip-city') ?? null;

  if (!country && !region && !rawCity) return EMPTY;
  return {
    country,
    region,
    // Vercel URL-encodes city names; harmless to attempt elsewhere.
    city: rawCity ? safeDecode(rawCity) : null,
  };
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
