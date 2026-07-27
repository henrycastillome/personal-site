# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> public site >> renders the nav with every section link
- Location: e2e/smoke.spec.ts:19:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('site-nav')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('site-nav')

```

```yaml
- img
- img
- img
- img
- img
- paragraph: henry-melo
- paragraph: .fig
- text: Share
- paragraph: Pages
- img
- paragraph: Portfolio
- paragraph: Layers
- img
- paragraph: Hero
- img
- paragraph: About
- img
- paragraph: Projects
- img
- paragraph: Experience
- img
- paragraph: Contact
- img
- paragraph: Hero
- paragraph: · 1440 × 900
- text: henrymelo.com
- paragraph: Hi, I'm Henry
- paragraph: I design financial products that make moving money feel simple and safe.
- paragraph: I'm a Senior UX Designer at Western Union. I sit between design and engineering to make sure what gets designed is what actually ships, sometimes pushing code myself and working shoulder to shoulder with the engineers to get it right.
- link "Get in touch":
  - /url: mailto:henry.melo.contact@gmail.com
  - text: Get in touch
  - img
- link "Let's connect":
  - /url: https://www.linkedin.com/in/henry--melo/
  - text: Let's connect
  - img
- img
- paragraph: Projects
- paragraph: · Grid
- paragraph: Improving Capsule's Delivery Efficiency
- paragraph: Conducted field research to identify inefficiencies for the delivery service and the UX opportunities to reduce failed deliveries by 50-70% through simple delivery confirmation interventions.
- paragraph: "From Manual Operations To $258K Revenue: Payment & Booking"
- paragraph: Founded and led UX/UI design for 40minutes, a fitness marketplace app that transformed a tedious 30-minute+ booking and payment process into an instant digital experience.
- paragraph: "From Metrics To Impact: Digital Safety For Immigrant Families"
- paragraph: Created interactive data dashboards that secured $150K in funding and improved program participation by 40%. Made digital services accessible to non-English speaking families.
- img
- paragraph: Experience
- paragraph: · List
- paragraph: Senior UX Designer
- paragraph: Western Union
- paragraph: 2025 – Now
- paragraph: UX Researcher
- paragraph: Capsule
- paragraph: 2025 – 2025
- paragraph: Senior Product Designer Consultant
- paragraph: CIANA
- paragraph: 2024 – 2025
- paragraph: UX Designer Consultant
- paragraph: Center for Digital Experiences
- paragraph: 2022 – 2024
- paragraph: MS, Information Experience Design (HCI & UX)
- paragraph: Pratt Institute
- paragraph: 2022 – 2024
- paragraph: Product Designer & Founder
- paragraph: 40 Minutes Fitness
- paragraph: 2015 – 2022
- paragraph: BS, Industrial Engineering
- paragraph: Universidad el Bosque
- paragraph: 2010 – 2015
- img
- paragraph: About
- paragraph:
  - strong: How I Found My Way Into UX
- paragraph: "My journey into UX started somewhere unexpected: fitness. I've got a background in engineering, so when I had an idea for a fitness app a few years ago, I just built it and launched it. It picked up interest and a growing user base fast. But the part that hooked me wasn't the code or the fitness. It was watching how people actually used the thing, and realizing that understanding user needs was the problem I wanted to solve."
- paragraph: That spark led me into UX, and eventually to a Master's in Information Experience Design (HCI) at Pratt Institute. Best decision ever.
- paragraph:
  - strong: Blending Engineering & Design Thinking
- paragraph: That engineer's instinct never left. I still love breaking down messy problems, and it's what helps me design experiences that feel effortless for the people using them.
- paragraph: Today I bring that mix to my work as a Senior UX Designer at Western Union. I sit between design and engineering to make sure the intended design is what actually ships, sometimes pushing code myself and building alongside the engineers to get it right.
- paragraph:
  - strong: "Beyond UX: Tennis, Food, and NYC"
- paragraph: When I'm not designing, you'll find me on the tennis court. Yes, I'm a die-hard Nadal fan, so much so that I named my dog Rafa. Outside of UX and sports, I'm on a constant mission to find NYC's best hidden food gems. There's always a new restaurant to try, and hunting down those spots has become a bit of an obsession.
- text: Figma React Angular Design Sytems User Research Interaction Design HTML/CSS UX Engineering
- img
- paragraph: Contact
- link "henry.melo.contact@gmail.com":
  - /url: mailto:henry.melo.contact@gmail.com
  - img
  - text: henry.melo.contact@gmail.com
- link "LinkedIn":
  - /url: https://www.linkedin.com/in/henry--melo/
  - img
  - text: LinkedIn
- link "GitHub":
  - /url: https://github.com/henrycmelo
  - img
  - text: GitHub
- paragraph: Design
- paragraph: Position
- paragraph: Auto
- paragraph: Width
- paragraph: "760"
- paragraph: Fill
- paragraph: Deep Teal
- paragraph: Font
- paragraph: Inter
- paragraph: 2 here
- button "AG"
- text: SH
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Smoke coverage for the public site.
  5  |  *
  6  |  * The point is to prove the data-testid locators are present and stable, so
  7  |  * integration specs can be written against them. It deliberately asserts on
  8  |  * structure and behaviour rather than on CMS copy, which changes.
  9  |  *
  10 |  * The admin is not covered: sign-in is a magic link, so it needs a seeded
  11 |  * storageState or a service-role-minted session. That is its own piece of work.
  12 |  */
  13 | 
  14 | test.describe('public site', () => {
  15 |   test.beforeEach(async ({ page }) => {
  16 |     await page.goto('/');
  17 |   });
  18 | 
  19 |   test('renders the nav with every section link', async ({ page }) => {
> 20 |     await expect(page.getByTestId('site-nav')).toBeVisible();
     |                                                ^ Error: expect(locator).toBeVisible() failed
  21 | 
  22 |     for (const id of ['home', 'projects', 'career', 'aboutme', 'contact']) {
  23 |       await expect(page.getByTestId(`nav-link-${id}`)).toBeAttached();
  24 |     }
  25 |   });
  26 | 
  27 |   test('nav links scroll to their section', async ({ page }) => {
  28 |     await page.getByTestId('nav-link-projects').click();
  29 |     await expect(page.locator('#projects')).toBeInViewport();
  30 |   });
  31 | 
  32 |   test('hero CTAs point at email and LinkedIn', async ({ page }) => {
  33 |     // These Buttons use `asChild`, so the testid lands on the <a> itself
  34 |     // rather than on a wrapper - assert the href on the element directly.
  35 |     const email = page.getByTestId('hero-cta-email');
  36 |     await expect(email).toBeVisible();
  37 |     await expect(email).toHaveAttribute('href', /^mailto:/);
  38 | 
  39 |     const linkedin = page.getByTestId('hero-cta-linkedin');
  40 |     if (await linkedin.count()) {
  41 |       await expect(linkedin).toHaveAttribute('href', /linkedin\.com/);
  42 |       // Opens in a new tab, so it must carry the opener guard.
  43 |       await expect(linkedin).toHaveAttribute('rel', /noopener/);
  44 |     }
  45 |   });
  46 | 
  47 |   test('project cards render with case-study blocks', async ({ page }) => {
  48 |     const cards = page.getByTestId('project-card');
  49 |     await expect(cards.first()).toBeVisible();
  50 | 
  51 |     // At least one card should carry the full Problem -> Impact narrative.
  52 |     const first = cards.first();
  53 |     for (const key of ['problem', 'process', 'solution', 'impact']) {
  54 |       await expect(first.getByTestId(`case-study-${key}`)).toBeVisible();
  55 |     }
  56 |   });
  57 | 
  58 |   test('every section anchor the nav targets actually exists', async ({ page }) => {
  59 |     for (const id of ['home', 'projects', 'career', 'aboutme', 'contact']) {
  60 |       await expect(page.locator(`#${id}`)).toBeAttached();
  61 |     }
  62 |   });
  63 | 
  64 |   test('serves the security headers', async ({ page }) => {
  65 |     const response = await page.goto('/');
  66 |     const headers = response!.headers();
  67 | 
  68 |     expect(headers['content-security-policy']).toBeTruthy();
  69 |     expect(headers['x-frame-options']).toBe('DENY');
  70 |     expect(headers['x-content-type-options']).toBe('nosniff');
  71 |     expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  72 |   });
  73 | 
  74 |   test('admin is gated', async ({ page }) => {
  75 |     await page.goto('/admin');
  76 |     await expect(page).toHaveURL(/\/login/);
  77 |   });
  78 | });
  79 | 
  80 | test.describe('mobile', () => {
  81 |   test.use({ viewport: { width: 390, height: 844 } });
  82 | 
  83 |   test('menu trigger opens the drawer', async ({ page }) => {
  84 |     await page.goto('/');
  85 | 
  86 |     const trigger = page.getByTestId('nav-menu-trigger');
  87 |     await expect(trigger).toBeVisible();
  88 | 
  89 |     await trigger.click();
  90 |     await expect(page.getByRole('dialog')).toBeVisible();
  91 |   });
  92 | });
  93 | 
```