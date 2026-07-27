# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> public site >> nav links scroll to their section
- Location: e2e/smoke.spec.ts:27:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('nav-link-projects')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e24]:
        - paragraph [ref=e25]: henry-melo
        - paragraph [ref=e26]: .fig
      - generic [ref=e27]: Share
    - generic [ref=e29]:
      - generic [ref=e30]:
        - paragraph [ref=e31]: Pages
        - paragraph [ref=e35]: Portfolio
        - paragraph [ref=e36]: Layers
        - paragraph [ref=e40]: Hero
        - paragraph [ref=e45]: About
        - paragraph [ref=e51]: Projects
        - paragraph [ref=e57]: Experience
        - paragraph [ref=e63]: Contact
      - generic [ref=e65]:
        - generic [ref=e66]:
          - generic [ref=e67]:
            - paragraph [ref=e69]: Hero
            - paragraph [ref=e70]: · 1440 × 900
          - generic [ref=e72]:
            - generic [ref=e73]: henrymelo.com
            - generic [ref=e81]:
              - generic [ref=e83]:
                - paragraph [ref=e85]: Hi, I'm Henry
                - paragraph [ref=e87]: I design financial products that make moving money feel simple and safe.
              - paragraph [ref=e89]: I'm a Senior UX Designer at Western Union. I sit between design and engineering to make sure what gets designed is what actually ships, sometimes pushing code myself and working shoulder to shoulder with the engineers to get it right.
              - generic [ref=e90]:
                - link "Get in touch" [ref=e91] [cursor=pointer]:
                  - /url: mailto:henry.melo.contact@gmail.com
                - link "Let's connect" [ref=e94] [cursor=pointer]:
                  - /url: https://www.linkedin.com/in/henry--melo/
        - generic [ref=e99]:
          - generic [ref=e100]:
            - paragraph [ref=e102]: Projects
            - paragraph [ref=e103]: · Grid
          - generic [ref=e105]:
            - generic [ref=e108]:
              - paragraph [ref=e110]: Improving Capsule's Delivery Efficiency
              - paragraph [ref=e112]: Conducted field research to identify inefficiencies for the delivery service and the UX opportunities to reduce failed deliveries by 50-70% through simple delivery confirmation interventions.
            - generic [ref=e115]:
              - paragraph [ref=e117]: "From Manual Operations To $258K Revenue: Payment & Booking"
              - paragraph [ref=e119]: Founded and led UX/UI design for 40minutes, a fitness marketplace app that transformed a tedious 30-minute+ booking and payment process into an instant digital experience.
            - generic [ref=e122]:
              - paragraph [ref=e124]: "From Metrics To Impact: Digital Safety For Immigrant Families"
              - paragraph [ref=e126]: Created interactive data dashboards that secured $150K in funding and improved program participation by 40%. Made digital services accessible to non-English speaking families.
        - generic [ref=e127]:
          - generic [ref=e128]:
            - paragraph [ref=e130]: Experience
            - paragraph [ref=e131]: · List
          - generic [ref=e133]:
            - generic [ref=e134]:
              - generic [ref=e135]:
                - paragraph [ref=e137]: Senior UX Designer
                - paragraph [ref=e138]: Western Union
              - paragraph [ref=e139]: 2025 – Now
            - generic [ref=e140]:
              - generic [ref=e141]:
                - paragraph [ref=e143]: UX Researcher
                - paragraph [ref=e144]: Capsule
              - paragraph [ref=e145]: 2025 – 2025
            - generic [ref=e146]:
              - generic [ref=e147]:
                - paragraph [ref=e149]: Senior Product Designer Consultant
                - paragraph [ref=e150]: CIANA
              - paragraph [ref=e151]: 2024 – 2025
            - generic [ref=e152]:
              - generic [ref=e153]:
                - paragraph [ref=e155]: UX Designer Consultant
                - paragraph [ref=e156]: Center for Digital Experiences
              - paragraph [ref=e157]: 2022 – 2024
            - generic [ref=e158]:
              - generic [ref=e159]:
                - paragraph [ref=e161]: MS, Information Experience Design (HCI & UX)
                - paragraph [ref=e162]: Pratt Institute
              - paragraph [ref=e163]: 2022 – 2024
            - generic [ref=e164]:
              - generic [ref=e165]:
                - paragraph [ref=e167]: Product Designer & Founder
                - paragraph [ref=e168]: 40 Minutes Fitness
              - paragraph [ref=e169]: 2015 – 2022
            - generic [ref=e170]:
              - generic [ref=e171]:
                - paragraph [ref=e173]: BS, Industrial Engineering
                - paragraph [ref=e174]: Universidad el Bosque
              - paragraph [ref=e175]: 2010 – 2015
        - generic [ref=e176]:
          - paragraph [ref=e179]: About
          - generic [ref=e182]:
            - generic [ref=e183]:
              - paragraph [ref=e184]:
                - strong [ref=e185]: How I Found My Way Into UX
              - paragraph [ref=e186]: "My journey into UX started somewhere unexpected: fitness. I've got a background in engineering, so when I had an idea for a fitness app a few years ago, I just built it and launched it. It picked up interest and a growing user base fast. But the part that hooked me wasn't the code or the fitness. It was watching how people actually used the thing, and realizing that understanding user needs was the problem I wanted to solve."
              - paragraph [ref=e187]: That spark led me into UX, and eventually to a Master's in Information Experience Design (HCI) at Pratt Institute. Best decision ever.
              - paragraph [ref=e188]:
                - strong [ref=e189]: Blending Engineering & Design Thinking
              - paragraph [ref=e190]: That engineer's instinct never left. I still love breaking down messy problems, and it's what helps me design experiences that feel effortless for the people using them.
              - paragraph [ref=e191]: Today I bring that mix to my work as a Senior UX Designer at Western Union. I sit between design and engineering to make sure the intended design is what actually ships, sometimes pushing code myself and building alongside the engineers to get it right.
              - paragraph [ref=e192]:
                - strong [ref=e193]: "Beyond UX: Tennis, Food, and NYC"
              - paragraph [ref=e194]: When I'm not designing, you'll find me on the tennis court. Yes, I'm a die-hard Nadal fan, so much so that I named my dog Rafa. Outside of UX and sports, I'm on a constant mission to find NYC's best hidden food gems. There's always a new restaurant to try, and hunting down those spots has become a bit of an obsession.
            - generic [ref=e195]:
              - generic [ref=e196]: Figma
              - generic [ref=e197]: React
              - generic [ref=e198]: Angular
              - generic [ref=e199]: Design Sytems
              - generic [ref=e200]: User Research
              - generic [ref=e201]: Interaction Design
              - generic [ref=e202]: HTML/CSS
              - generic [ref=e203]: UX Engineering
        - generic [ref=e204]:
          - paragraph [ref=e207]: Contact
          - generic [ref=e209]:
            - link "henry.melo.contact@gmail.com" [ref=e210] [cursor=pointer]:
              - /url: mailto:henry.melo.contact@gmail.com
            - link "LinkedIn" [ref=e214] [cursor=pointer]:
              - /url: https://www.linkedin.com/in/henry--melo/
            - link "GitHub" [ref=e219] [cursor=pointer]:
              - /url: https://github.com/henrycmelo
      - generic [ref=e223]:
        - paragraph [ref=e224]: Design
        - generic [ref=e225]:
          - paragraph [ref=e226]: Position
          - paragraph [ref=e227]: Auto
        - generic [ref=e228]:
          - paragraph [ref=e229]: Width
          - paragraph [ref=e230]: "760"
        - generic [ref=e231]:
          - paragraph [ref=e232]: Fill
          - paragraph [ref=e233]: Deep Teal
        - generic [ref=e234]:
          - paragraph [ref=e235]: Font
          - paragraph [ref=e236]: Inter
  - generic [ref=e239]:
    - paragraph [ref=e240]: 2 here
    - generic [ref=e241]:
      - button "AG" [ref=e242] [cursor=pointer]
      - generic "Swift Heron" [ref=e243]: SH
  - alert [ref=e244]
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
  20 |     await expect(page.getByTestId('site-nav')).toBeVisible();
  21 | 
  22 |     for (const id of ['home', 'projects', 'career', 'aboutme', 'contact']) {
  23 |       await expect(page.getByTestId(`nav-link-${id}`)).toBeAttached();
  24 |     }
  25 |   });
  26 | 
  27 |   test('nav links scroll to their section', async ({ page }) => {
> 28 |     await page.getByTestId('nav-link-projects').click();
     |                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
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