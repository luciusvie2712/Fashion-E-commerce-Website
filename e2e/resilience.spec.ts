import { test, expect } from '@playwright/test';
test('blocked local storage leaves a usable shopping session and warning', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
    Storage.prototype.getItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await page.goto('/');
  await page.locator('.header select').selectOption('en');
  await expect(page.locator('.warning')).toContainText('may not survive');
  await page.locator('.product-name').first().click();
  await page.getByRole('button', { name: 'Ink', exact: true }).click();
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await page.getByRole('link', { name: 'Shopping bag (1)', exact: true }).click();
  await expect(page.locator('.cart-row')).toHaveCount(1);
});
test('reset confirms and preserves unrelated browser keys', async ({ page }) => {
  await page.goto('/');
  await page.locator('.header select').selectOption('en');
  await page.evaluate(() => localStorage.setItem('unrelated', 'keep'));
  await page.getByRole('button', { name: 'Reset demo data' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('fluivix:v1:identity'))).toBeTruthy();
  await page.getByRole('button', { name: 'Reset demo data' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  expect(await page.evaluate(() => localStorage.getItem('unrelated'))).toBe('keep');
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('fluivix:v1:shopping') ?? '{"state":{"carts":{}}}').state
          .carts,
    ),
  ).toEqual({});
});
test('quick view, image fallback and localized demo forms work', async ({ page }) => {
  await page.goto('/');
  await page.locator('.header select').selectOption('en');
  await page.locator('.product-card').first().getByRole('button', { name: 'Quick view' }).focus();
  await page.locator('.product-card').first().getByRole('button', { name: 'Quick view' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('link').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/product\//);
  await page.getByRole('button', { name: 'Submit locally' }).click();
  await expect(page.locator('.reviews [role="alert"]')).toBeVisible();
  await page.route('**/assets/photos/p-001-ink.webp', (route) => route.abort());
  await page.goto('/shop');
  await expect(page.locator('.product-image svg').first()).toBeVisible();
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Submit locally' }).click();
  await expect(page.locator('main [role="alert"]')).toBeVisible();
});
