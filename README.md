# Henry Portfolio

Henry Melo's portfolio site and CMS — a Next.js 15 (App Router) app with a
Chakra UI v3 design system, a Supabase-backed admin, first-party analytics, and
seven switchable public-site templates.

Ported from `madeline-portfolio` and sharing the **same Supabase project**; all
database objects are namespaced with the `henry_` prefix and images live in the
`henry-portfolio-images` bucket.

## Stack

- **Next.js 15** (App Router, Server Components + Server Actions), **React 19**
- **Chakra UI v3** design system (`theme/`)
- **Supabase** (Postgres + RLS, Auth magic-link, Storage) via `@supabase/ssr`
- **TipTap** rich-text editing in the admin
- **Vitest** unit tests · **Playwright** e2e · **ESLint** · **SonarQube** ·
  **gitleaks** · Docker/Colima CI

## Layout

```
app/            routes: public /, /admin/*, /login, /auth/*, /api/*
components/     layout, sections, ui, analytics, admin
templates/      the 7 public-site designs + registry/meta
lib/            supabase clients, auth, analytics, sanitisation, types
supabase/       migrations (applied by hand; not tracked in git)
tests/ e2e/     unit + end-to-end suites
```

## Getting started

```bash
npm install
npm run dev            # http://localhost:3000
```

You'll need a `.env.local` (Supabase URL + keys, `ADMIN_EMAIL`,
`NEXT_PUBLIC_STORAGE_BUCKET`) and the 13 `henry_` migrations applied in Supabase.

See **`codes.md`** (untracked) for the full command reference: checks, e2e, the
CI pipeline, Docker, SonarQube, migrations and deployment.

## The seven templates

Classic · Report Card · Student Dashboard · Help Desk · Account Health ·
Onboarding · Classroom. The active one is chosen in the **Templates** admin page
(`active_template` on `henry_site_settings`); `?template=<slug>` previews any of
them. Adding a template is code-only — drop a component in `templates/` and wire
it in the registry; no migration needed.
