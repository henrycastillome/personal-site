import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

/**
 * Content Security Policy.
 *
 * Two deliberate relaxations:
 *  - `style-src 'unsafe-inline'` is required. Chakra/Emotion injects <style>
 *    tags at runtime; a strict style policy blanks every page.
 *  - `script-src 'unsafe-eval'` is dev-only, for Turbopack's HMR runtime.
 *
 * Images allow Supabase storage, which is where every CMS upload is served
 * from, plus data:/blob: for inline icons and upload previews.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co${isDev ? ' ws: wss:' : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Image uploads go through a Server Action, and the default cap is 1 MB.
      // Kept in step with MAX_UPLOAD_BYTES in app/admin/actions.ts, which
      // rejects anything larger with a readable message instead of a crash.
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
