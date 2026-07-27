import { sanitizeRichText } from '@/lib/sanitize';

/**
 * Parsers for the FormData that admin forms submit.
 *
 * These live outside app/admin/actions.ts because that file is a
 * `'use server'` module: every export there must be an async server action, so
 * plain helpers cannot be exported from it - and therefore cannot be unit
 * tested. They are pure functions, which is exactly what should be covered.
 */

/** Rich text, sanitised on the way in. */
export function rich(formData: FormData, key: string): string {
  return sanitizeRichText(formData.get(key)?.toString() ?? '');
}

/** Plain text, trimmed. Missing keys become an empty string. */
export function plain(formData: FormData, key: string): string {
  return formData.get(key)?.toString().trim() ?? '';
}

/** Optional plain field - empty string becomes null so the column stays clean. */
export function nullable(formData: FormData, key: string): string | null {
  return plain(formData, key) || null;
}

/**
 * Checkbox-ish values. Accepts the several shapes a form can produce, and
 * treats anything unrecognised as false.
 */
export function bool(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === 'true' || value === 'on' || value === '1';
}

/**
 * Numeric field, falling back when absent, blank or unparseable.
 *
 * The absent and blank cases need handling before Number(): `Number(null)` and
 * `Number('')` are both 0, which is finite, so a missing field would otherwise
 * silently resolve to 0 instead of the caller's fallback.
 */
export function number(formData: FormData, key: string, fallback = 0): number {
  const raw = formData.get(key);
  if (raw === null || raw.toString().trim() === '') return fallback;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * JSON-encoded string arrays produced by TagListInput and MultiImageUploader.
 * Malformed JSON yields an empty array rather than throwing, so one bad field
 * cannot fail an entire save.
 */
export function stringArray(formData: FormData, key: string): string[] {
  const raw = formData.get(key)?.toString();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item).trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}
