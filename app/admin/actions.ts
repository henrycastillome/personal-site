'use server';

import { revalidatePath } from 'next/cache';
import { getAdmin } from '@/lib/auth/requireAdmin';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  rich,
  plain,
  nullable,
  bool,
  number,
  stringArray,
} from '@/lib/formFields';

const BUCKET = 'henry-portfolio-images';

export interface ActionResult {
  ok: boolean;
  error?: string;
  /** Public URL, returned by uploadImage. */
  url?: string;
}

const UNAUTHORIZED: ActionResult = {
  ok: false,
  error: 'Your session expired. Please sign in again.',
};

/** Revalidates the public homepage plus the admin page that was just saved. */
function revalidateAll(adminPath?: string) {
  revalidatePath('/');
  if (adminPath) revalidatePath(adminPath);
}

/* -------------------------------------------------------------------------- */
/* Single-row sections                                                        */
/* -------------------------------------------------------------------------- */

export async function updateHero(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const { error } = await admin.supabase
    .from('henry_hero_content')
    .update({
      greeting: rich(formData, 'greeting'),
      subtitle: rich(formData, 'subtitle'),
      description: rich(formData, 'description'),
      cta_text: nullable(formData, 'cta_text'),
      cta_secondary_text: nullable(formData, 'cta_secondary_text'),
      profile_image: nullable(formData, 'profile_image'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', plain(formData, 'id'));

  if (error) return { ok: false, error: error.message };

  revalidateAll('/admin/hero');
  return { ok: true };
}

export async function updateAbout(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const { error } = await admin.supabase
    .from('henry_about_content')
    .update({
      heading: rich(formData, 'heading'),
      bio: rich(formData, 'bio'),
      profile_image: nullable(formData, 'profile_image'),
      skills: stringArray(formData, 'skills'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', plain(formData, 'id'));

  if (error) return { ok: false, error: error.message };

  revalidateAll('/admin/about');
  return { ok: true };
}

export async function updateContact(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const email = plain(formData, 'email');
  if (!email) return { ok: false, error: 'An email address is required.' };

  const { error } = await admin.supabase
    .from('henry_contact_content')
    .update({
      heading: rich(formData, 'heading'),
      subheading: nullable(formData, 'subheading'),
      email,
      phone: nullable(formData, 'phone'),
      linkedin_url: nullable(formData, 'linkedin_url'),
      twitter_url: nullable(formData, 'twitter_url'),
      github_url: nullable(formData, 'github_url'),
      location: nullable(formData, 'location'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', plain(formData, 'id'));

  if (error) return { ok: false, error: error.message };

  revalidateAll('/admin/contact');
  return { ok: true };
}

/**
 * Updates the section headings stored on the singleton henry_site_settings row.
 *
 * Projects and Background are collections with no content row of their own, so
 * their section titles live here. Only the fields present in the submitted form
 * are touched, so the Projects editor and the Background editor can each save
 * their own heading without clobbering the other.
 */
export async function updateSectionHeadings(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const update: Record<string, string> = { updated_at: new Date().toISOString() };
  if (formData.has('projects_heading')) {
    update.projects_heading = rich(formData, 'projects_heading');
  }
  if (formData.has('background_heading')) {
    update.background_heading = rich(formData, 'background_heading');
  }

  // Read the singleton's id (seeded by migration 009). Update if present,
  // insert otherwise, so a project that has not run the seed still works.
  const { data: existing } = await admin.supabase
    .from('henry_site_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  const { error } = existing?.id
    ? await admin.supabase.from('henry_site_settings').update(update).eq('id', existing.id)
    : await admin.supabase.from('henry_site_settings').insert(update);

  if (error) return { ok: false, error: error.message };

  // Both headings render on the homepage; revalidate both admin pages too since
  // this action is shared between them.
  revalidatePath('/');
  revalidatePath('/admin/projects');
  revalidatePath('/admin/background');
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

export async function saveProject(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const id = plain(formData, 'id');
  const row = {
    title: rich(formData, 'title'),
    short_description: rich(formData, 'short_description'),
    problem: rich(formData, 'problem'),
    process: rich(formData, 'process'),
    solution: rich(formData, 'solution'),
    impact: rich(formData, 'impact'),
    image: nullable(formData, 'image'),
    technologies: stringArray(formData, 'technologies'),
    order_index: number(formData, 'order_index'),
    is_visible: bool(formData, 'is_visible'),
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await admin.supabase.from('henry_projects').update(row).eq('id', id)
    : await admin.supabase.from('henry_projects').insert(row);

  if (error) return { ok: false, error: error.message };

  revalidateAll('/admin/projects');
  return { ok: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const { error } = await admin.supabase.from('henry_projects').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidateAll('/admin/projects');
  return { ok: true };
}

export async function moveProject(
  id: string,
  direction: 'up' | 'down'
): Promise<ActionResult> {
  return swapOrder('henry_projects', id, direction, '/admin/projects');
}

/* -------------------------------------------------------------------------- */
/* Work history                                                                */
/* -------------------------------------------------------------------------- */

export async function saveWorkHistory(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const company = plain(formData, 'company');
  const startDate = plain(formData, 'start_date');
  if (!company) return { ok: false, error: 'Company is required.' };
  if (!startDate) return { ok: false, error: 'A start date is required.' };

  const isCurrent = bool(formData, 'is_current');
  const id = plain(formData, 'id');
  const entryType = plain(formData, 'entry_type') === 'education' ? 'education' : 'work';

  const row = {
    entry_type: entryType,
    company,
    position: rich(formData, 'position'),
    location: nullable(formData, 'location'),
    start_date: startDate,
    end_date: isCurrent ? null : nullable(formData, 'end_date'),
    is_current: isCurrent,
    description: rich(formData, 'description'),
    achievements: stringArray(formData, 'achievements'),
    skills_used: stringArray(formData, 'skills_used'),
    logos: stringArray(formData, 'logos'),
    order_index: number(formData, 'order_index'),
    is_visible: bool(formData, 'is_visible'),
    updated_at: new Date().toISOString(),
  };

  const save = (payload: typeof row | Omit<typeof row, 'entry_type'>) =>
    id
      ? admin.supabase.from('henry_work_history').update(payload).eq('id', id)
      : admin.supabase.from('henry_work_history').insert(payload);

  let { error } = await save(row);
  // Tolerate running before migration 014: if the entry_type column is not there
  // yet, save without it so the CMS keeps working (every entry stays 'work').
  if (error && error.message.includes('entry_type')) {
    const fallback = { ...row };
    delete (fallback as { entry_type?: string }).entry_type;
    ({ error } = await save(fallback));
  }

  if (error) return { ok: false, error: error.message };

  revalidateAll('/admin/background');
  return { ok: true };
}

export async function deleteWorkHistory(id: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const { error } = await admin.supabase
    .from('henry_work_history')
    .delete()
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidateAll('/admin/background');
  return { ok: true };
}

export async function moveWorkHistory(
  id: string,
  direction: 'up' | 'down'
): Promise<ActionResult> {
  return swapOrder('henry_work_history', id, direction, '/admin/background');
}

/**
 * Swaps order_index with the adjacent row. Both list sections sort by
 * order_index on the public site, so this is what reordering means.
 */
async function swapOrder(
  table: 'henry_projects' | 'henry_work_history',
  id: string,
  direction: 'up' | 'down',
  adminPath: string
): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const { data: rows, error: listError } = await admin.supabase
    .from(table)
    .select('id, order_index')
    .order('order_index');

  if (listError) return { ok: false, error: listError.message };
  if (!rows) return { ok: false, error: 'Nothing to reorder.' };

  const index = rows.findIndex((row) => row.id === id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= rows.length) {
    return { ok: true }; // Already at the end - nothing to do.
  }

  // Rewrite the whole list to 0..n-1 so duplicate or missing indexes from
  // hand-edited rows can't make reordering a no-op.
  const reordered = [...rows];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  for (let position = 0; position < reordered.length; position++) {
    const { error } = await admin.supabase
      .from(table)
      .update({ order_index: position })
      .eq('id', reordered[position].id);
    if (error) return { ok: false, error: error.message };
  }

  revalidateAll(adminPath);
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Images                                                                      */
/* -------------------------------------------------------------------------- */

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
/**
 * SVG is deliberately excluded. The bucket is public, and an SVG opened at its
 * public URL can execute script in this site's origin.
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Whitelist, not free text - the folder decides the storage path. */
const ALLOWED_FOLDERS = ['hero', 'about', 'projects', 'logos'] as const;

export async function uploadImage(formData: FormData): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'No file selected.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'Images must be 5 MB or smaller.' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: 'Use a JPG, PNG, WebP or GIF image.' };
  }

  const requested = plain(formData, 'folder');
  const folder = (ALLOWED_FOLDERS as readonly string[]).includes(requested)
    ? requested
    : 'uploads';
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const path = `${folder}/${Date.now()}-${safeName}`;

  /**
   * The write goes through the service-role client on purpose.
   *
   * Storage RLS kept rejecting these uploads, and storage policies are awkward
   * to debug: the Storage API connects as its own role, and a policy that
   * errors surfaces as a plain "violates row-level security policy".
   *
   * Authorization is not weakened by this - getAdmin() above already proved
   * the caller has a session whose email is in the ADMIN_EMAIL allowlist, and
   * this action returns early otherwise. The service-role key never leaves the
   * server, and the file type, size, name and folder are all validated before
   * we get here.
   */
  const storage = createAdminClient().storage.from(BUCKET);

  const { error } = await storage.upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) return { ok: false, error: error.message };

  const {
    data: { publicUrl },
  } = storage.getPublicUrl(path);

  return { ok: true, url: publicUrl };
}

/* -------------------------------------------------------------------------- */
/* Image library                                                               */
/* -------------------------------------------------------------------------- */

export interface StoredImage {
  /** Path within the bucket, e.g. "hero/1784-photo.png". */
  path: string;
  name: string;
  url: string;
  size: number;
  /** True when some piece of content still points at this URL. */
  inUse: boolean;
}

export interface ListImagesResult {
  ok: boolean;
  images?: StoredImage[];
  error?: string;
}

/**
 * Every image URL currently referenced by content.
 *
 * Used to stop the library deleting a picture that is still on the site, and
 * to label the one a field is already using.
 */
async function referencedImageUrls(): Promise<Set<string>> {
  const db = createAdminClient();
  const [hero, about, projects, work] = await Promise.all([
    db.from('henry_hero_content').select('profile_image'),
    db.from('henry_about_content').select('profile_image'),
    db.from('henry_projects').select('image'),
    db.from('henry_work_history').select('logos'),
  ]);

  const urls = new Set<string>();
  const add = (value?: string | null) => {
    if (value) urls.add(value);
  };

  hero.data?.forEach((r) => add(r.profile_image));
  about.data?.forEach((r) => add(r.profile_image));
  projects.data?.forEach((r) => add(r.image));
  work.data?.forEach((r) => {
    if (Array.isArray(r.logos)) r.logos.forEach((l: string) => add(l));
  });

  return urls;
}

/**
 * Everything in the bucket, newest first.
 *
 * Walks the known folders *and* the bucket root, because images uploaded
 * before the CMS existed live at the root with no folder prefix.
 */
export async function listImages(): Promise<ListImagesResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: UNAUTHORIZED.error };

  const storage = createAdminClient().storage.from(BUCKET);
  const prefixes = ['', ...ALLOWED_FOLDERS, 'uploads'];

  const found: StoredImage[] = [];
  const referenced = await referencedImageUrls();

  for (const prefix of prefixes) {
    const { data, error } = await storage.list(prefix, {
      limit: 200,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error) return { ok: false, error: error.message };

    for (const item of data ?? []) {
      // Folder entries come back with a null id - only real objects have one.
      if (!item.id) continue;
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      const { data: pub } = storage.getPublicUrl(path);
      found.push({
        path,
        name: item.name,
        url: pub.publicUrl,
        size: item.metadata?.size ?? 0,
        inUse: referenced.has(pub.publicUrl),
      });
    }
  }

  return { ok: true, images: found };
}

/**
 * Removes an image from the bucket.
 *
 * Refuses while any content still points at it - deleting in that case would
 * leave a broken image on the live site with no warning.
 */
export async function deleteImage(path: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const storage = createAdminClient().storage.from(BUCKET);
  const { data: pub } = storage.getPublicUrl(path);

  const referenced = await referencedImageUrls();
  if (referenced.has(pub.publicUrl)) {
    return {
      ok: false,
      error: 'That image is still used on the site. Replace it there first.',
    };
  }

  const { error } = await storage.remove([path]);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
