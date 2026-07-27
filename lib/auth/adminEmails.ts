/**
 * The admin allowlist.
 *
 * ADMIN_EMAIL accepts one address or a comma-separated list:
 *   ADMIN_EMAIL=you@example.com,someone-else@example.com
 *
 * Keep this in sync with henry_is_admin() in
 * supabase/migrations/002_admin_cms.sql - that function is what actually
 * enforces write access at the database level. This one gates the UI.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  const allowed = adminEmails();
  if (allowed.length === 0) return false;

  const normalized = email?.trim().toLowerCase();
  return Boolean(normalized) && allowed.includes(normalized!);
}
