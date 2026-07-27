import { test, expect } from '@playwright/test';

/**
 * Smoke coverage for the public site.
 *
 * The point is to prove the data-testid locators are present and stable, so
 * integration specs can be written against them. It deliberately asserts on
 * structure and behaviour rather than on CMS copy, which changes.
 *
 * The admin is not covered: sign-in is a magic link, so it needs a seeded
 * storageState or a service-role-minted session. That is its own piece of work.
 */

test.describe('public site', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the nav with every section link', async ({ page }) => {
    await expect(page.getByTestId('site-nav')).toBeVisible();

    for (const id of ['home', 'projects', 'career', 'aboutme', 'contact']) {
      await expect(page.getByTestId(`nav-link-${id}`)).toBeAttached();
    }
  });

  test('nav links scroll to their section', async ({ page }) => {
    await page.getByTestId('nav-link-projects').click();
    await expect(page.locator('#projects')).toBeInViewport();
  });

  test('hero CTAs point at email and LinkedIn', async ({ page }) => {
    // These Buttons use `asChild`, so the testid lands on the <a> itself
    // rather than on a wrapper - assert the href on the element directly.
    const email = page.getByTestId('hero-cta-email');
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute('href', /^mailto:/);

    const linkedin = page.getByTestId('hero-cta-linkedin');
    if (await linkedin.count()) {
      await expect(linkedin).toHaveAttribute('href', /linkedin\.com/);
      // Opens in a new tab, so it must carry the opener guard.
      await expect(linkedin).toHaveAttribute('rel', /noopener/);
    }
  });

  test('project cards render with case-study blocks', async ({ page }) => {
    const cards = page.getByTestId('project-card');
    await expect(cards.first()).toBeVisible();

    // At least one card should carry the full Problem -> Impact narrative.
    const first = cards.first();
    for (const key of ['problem', 'process', 'solution', 'impact']) {
      await expect(first.getByTestId(`case-study-${key}`)).toBeVisible();
    }
  });

  test('every section anchor the nav targets actually exists', async ({ page }) => {
    for (const id of ['home', 'projects', 'career', 'aboutme', 'contact']) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test('serves the security headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();

    expect(headers['content-security-policy']).toBeTruthy();
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  test('admin is gated', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('menu trigger opens the drawer', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByTestId('nav-menu-trigger');
    await expect(trigger).toBeVisible();

    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
