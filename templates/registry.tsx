import { ClassicTemplate } from '@/templates/classic/ClassicTemplate';
import { FigmaTemplate } from '@/templates/figma/FigmaTemplate';
import { VsCodeTemplate } from '@/templates/vscode/VsCodeTemplate';
import { TEMPLATE_META, DEFAULT_TEMPLATE, resolveTemplateSlug } from '@/templates/meta';
import type { Template, TemplateComponent } from '@/templates/types';

/**
 * Wires each template's metadata (templates/meta.ts) to its render component.
 * The public page reads from here; the admin reads metadata only.
 */
const COMPONENTS: Record<string, TemplateComponent> = {
  classic: ClassicTemplate,
  figma: FigmaTemplate,
  vscode: VsCodeTemplate,
};

const TEMPLATES: Template[] = TEMPLATE_META.map((meta) => ({
  ...meta,
  Component: COMPONENTS[meta.slug] ?? ClassicTemplate,
}));

const BY_SLUG = new Map(TEMPLATES.map((t) => [t.slug, t]));

/** The default (Classic) — guaranteed present. */
export function defaultTemplate(): Template {
  return BY_SLUG.get(DEFAULT_TEMPLATE)!;
}

/**
 * Resolves the template to render for a slug. Falls back to Classic when the
 * slug is missing, unknown, or names an unavailable template.
 */
export function resolveTemplate(slug?: string | null): Template {
  return BY_SLUG.get(resolveTemplateSlug(slug))!;
}
