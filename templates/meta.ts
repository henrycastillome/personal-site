import type { TemplateMeta } from '@/templates/types';

/**
 * Template metadata — deliberately free of React/component imports so it can be
 * shared by server actions, the admin page and the registry alike.
 *
 * To add a template: add its meta here, wire its component in registry.tsx.
 */
export const DEFAULT_TEMPLATE = 'classic';

export const TEMPLATE_META: TemplateMeta[] = [
  {
    slug: 'classic',
    name: 'Classic',
    description: 'A clean, professional portfolio. Dark sidebar over stacked sections.',
    status: 'available',
  },
  {
    slug: 'figma',
    name: 'Figma',
    description: 'A design-tool canvas — your work as frames, with live multiplayer cursors.',
    status: 'available',
  },
  {
    slug: 'vscode',
    name: 'VS Code',
    description: 'A code editor — sections as files, with live multiplayer cursors.',
    status: 'available',
  },
];

const BY_SLUG = new Map(TEMPLATE_META.map((t) => [t.slug, t]));

export function templateMeta(slug?: string | null): TemplateMeta | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}

/**
 * The slug to actually render for a request: the one asked for if it exists and
 * is available, otherwise the default (Classic). Pure — no component imports —
 * so it is unit-testable without pulling the whole template tree in.
 */
export function resolveTemplateSlug(slug?: string | null): string {
  const meta = slug ? BY_SLUG.get(slug) : undefined;
  return meta && meta.status === 'available' ? meta.slug : DEFAULT_TEMPLATE;
}

/** Whether a slug names a real, selectable template (guards the admin action). */
export function isActivatableTemplate(slug: string): boolean {
  return BY_SLUG.get(slug)?.status === 'available';
}
