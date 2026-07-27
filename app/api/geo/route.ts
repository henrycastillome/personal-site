import { NextResponse, type NextRequest } from 'next/server';
import { geoFromHeaders } from '@/lib/analytics/geo';

/**
 * Coarse location for the live templates' visitor names ("Someone from <city>").
 *
 * Reads only the edge-derived city/region/country (Netlify's `x-nf-geo`) — never
 * the IP, and nothing is stored. Locally there is no geo header, so everything
 * comes back null and the client falls back to a neutral name.
 *
 * Node runtime so `Buffer` (used to decode the base64 header) is available.
 */
export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const geo = geoFromHeaders(request.headers);
  return NextResponse.json(geo, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
