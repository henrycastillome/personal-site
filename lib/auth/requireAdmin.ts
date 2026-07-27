import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/auth/adminEmails';
import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Single authorization boundary for the CMS.
 *
 * Middleware only checks that *a* session exists - this additionally checks the
 * signed-in address against the ADMIN_EMAIL allowlist. Call it from the admin
 * layout AND from every server action, since server actions are routable
 * endpoints of their own.
 */
export async function requireAdmin(): Promise<{
  supabase: SupabaseClient;
  user: User;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (!isAdminEmail(user.email)) {
    redirect('/login?error=unauthorized');
  }

  return { supabase, user };
}

/**
 * Non-redirecting variant for server actions, which return a result object
 * instead of navigating.
 */
export async function getAdmin(): Promise<{
  supabase: SupabaseClient;
  user: User;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return null;
  }

  return { supabase, user };
}
