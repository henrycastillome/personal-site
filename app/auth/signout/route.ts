import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { logAuthEvent } from '@/lib/auth/authLog';

/**
 * Signs out and returns to /login.
 *
 * Binds the cookie writer directly to the redirect response rather than using
 * `cookies()` from next/headers: sign-out works by *deleting* the auth cookies,
 * and those deletions have to land on the response that is actually returned.
 *
 * The Location is RELATIVE on purpose. Building an absolute URL from
 * `request.nextUrl.origin` breaks behind Netlify's proxy - the origin comes
 * back with the wrong scheme (http) or host, so the POST -> 303 redirect lands
 * on a different origin and the CSP's `form-action 'self'` blocks the whole
 * submission. A relative `/login` is resolved by the browser against the page's
 * own origin, so it is always same-origin.
 */
export async function POST(request: NextRequest) {
  const response = new NextResponse(null, {
    status: 303, // 303 so the browser follows with GET, not POST.
    headers: { Location: '/login' },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Read who is leaving before the session is cleared, so the log can record a
  // masked email. getUser() verifies against Supabase (the SSR getSession is not
  // trustworthy on its own).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  // Only a real sign-out is worth a log line; a POST with no session is a no-op.
  // Awaited (not fire-and-forget) so the insert isn't dropped when the
  // serverless function freezes after the response is sent.
  if (user?.email) {
    await logAuthEvent({ event: 'signout', outcome: 'ok', email: user.email });
  }

  return response;
}
