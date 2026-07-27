import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client with service role key for privileged operations
 * Use only in secure server-side contexts (API routes, server actions)
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
