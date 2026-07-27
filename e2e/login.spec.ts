import { test, expect } from '@playwright/test';

/**
 * Sign-in flow. Uses a NON-admin address on purpose: the server actions return
 * the same neutral shape for unknown addresses and send nothing, so this
 * exercises the UI without consuming the real email quota.
 */
test.describe('sign-in', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('asks for an email first', async ({ page }) => {
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-continue')).toBeVisible();
    // The channel chooser must not be visible until an address is entered.
    await expect(page.getByTestId('login-choice')).toBeHidden();
  });

  test('opens the channel chooser after continue', async ({ page }) => {
    await page.getByTestId('login-email').fill('nobody@example.com');
    await page.getByTestId('login-continue').click();

    await expect(page.getByTestId('login-choice')).toBeVisible();
    await expect(page.getByTestId('login-option-email')).toBeVisible();
    await expect(page.getByTestId('login-option-sms')).toBeVisible();
  });

  test('disables SMS when the account has no verified phone', async ({ page }) => {
    await page.getByTestId('login-email').fill('nobody@example.com');
    await page.getByTestId('login-continue').click();

    const sms = page.getByTestId('login-option-sms');
    await expect(sms).toBeVisible();
    await expect(sms).toHaveAttribute('data-disabled', /.*/);
  });
});
