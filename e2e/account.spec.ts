import { test, expect } from '@playwright/test';
test('registration address profile logout reentry and owner scoping', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Ngôn ngữ', exact: true }).selectOption('en');
  await page.goto('/account/addresses');
  await expect(page).toHaveURL(/login\?redirect=/);
  await page.getByRole('link', { name: 'Create demo account', exact: true }).click();
  await page.getByRole('textbox', { name: 'Full name', exact: true }).fill('Sample User');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('sample@example.local');
  await page.getByLabel('Demo password', { exact: true }).fill('demopass8');
  await page.getByLabel('Confirm password', { exact: true }).fill('demopass8');
  await page.getByRole('button', { name: 'Create demo account' }).click();
  await expect(page).toHaveURL(/\/account$/);
  await page.getByRole('link', { name: 'Address book', exact: true }).click();
  await page.getByRole('button', { name: 'Add address' }).click();
  for (const [name, value] of [
    ['Recipient', 'Sample Person'],
    ['Phone number', '0900000000'],
    ['Province / city', 'Sample City'],
    ['District / locality', 'Sample District'],
    ['Street and local area', 'Sample Street 12'],
  ])
    await page.getByRole('textbox', { name, exact: true }).fill(value);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('.address-grid')).toContainText('Sample Street 12');
  await page.reload();
  await expect(page.locator('.address-grid')).toContainText('Sample Person');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('sample@example.local');
  await page.getByLabel('Demo password', { exact: true }).fill('different8');
  await page.getByRole('button', { name: 'Demo sign in' }).click();
  await page.getByRole('link', { name: 'Orders', exact: true }).click();
  await expect(page.locator('.order-card')).toHaveCount(0);
  const identity = await page.evaluate(() => localStorage.getItem('fluivix:v1:identity'));
  expect(identity).not.toContain('password');
  expect(identity).not.toContain('different8');
});
test('safe redirect, duplicate email and forgot password disclose demo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Ngôn ngữ', exact: true }).selectOption('en');
  await page.goto('/login?redirect=https://example.com');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('demo@fluivix.local');
  await page.getByLabel('Demo password', { exact: true }).fill('samplepass8');
  await page.getByRole('button', { name: 'Demo sign in' }).click();
  await expect(page).toHaveURL(/\/account$/);
  await page.goto('/account/orders');
  await expect(page.locator('.order-card')).toHaveCount(6);
  await page.goto('/forgot-password');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('sample@example.local');
  await page.getByRole('button', { name: 'Forgot password', exact: true }).click();
  await expect(page.getByRole('status').first()).toContainText('No email was sent');
});
