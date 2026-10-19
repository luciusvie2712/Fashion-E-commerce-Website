import { test, expect } from '@playwright/test';
import { locales } from '../src/types/domain';
import { resources } from '../src/features/i18n/dictionaries';
import { colors, products } from '../src/data/catalog';
for (const locale of locales)
  test(`localized validation payment and tracking in ${locale}`, async ({ page }) => {
    const t = resources[locale].translation;
    await page.goto('/');
    await page.locator('.header select').selectOption(locale);
    await page.goto('/product/fluivix-tshirts-1');
    await page.getByRole('button', { name: t.add, exact: true }).click();
    await expect(page.locator('.purchase [role="alert"]')).toHaveText(t.choose);
    await page.getByRole('button', { name: colors[0].name[locale], exact: true }).click();
    await page.getByRole('button', { name: 'M', exact: true }).click();
    await page.getByRole('button', { name: t.buy, exact: true }).click();
    await page.getByRole('button', { name: t.placeOrder }).click();
    await expect(page.locator('.field-error')).toHaveCount(5);
    for (const key of ['recipient', 'phone', 'province', 'district', 'street'] as const)
      await page
        .getByRole('textbox', { name: t[key], exact: true })
        .fill(key === 'phone' ? '0900000000' : `Sample ${key}`);
    await page.getByRole('textbox', { name: t.coupon, exact: true }).fill('BAD');
    await page.getByRole('button', { name: t.apply, exact: true }).click();
    await expect(page.locator('.field-error')).toHaveText(t.couponUnknown);
    await page.getByRole('textbox', { name: t.coupon, exact: true }).fill('');
    await page.getByRole('button', { name: t.apply, exact: true }).click();
    await page.getByRole('radio', { name: t.online, exact: true }).check();
    await page.getByRole('button', { name: t.placeOrder }).click();
    const id = new URL(page.url()).searchParams.get('orderId');
    await page.getByRole('button', { name: t.cancelPayment, exact: true }).click();
    await expect(page.locator('main [role="status"]')).toHaveText(t.FAILED);
    await page.getByRole('button', { name: t.retry, exact: true }).click();
    await page.getByRole('button', { name: t.simulateSuccess, exact: true }).click();
    await expect(page.locator('main')).toContainText(id!);
    await page
      .locator('main')
      .getByRole('link', { name: new RegExp(t.track) })
      .click();
    await expect(page.locator('main')).toContainText(t.PAID);
    await expect(page.locator('main')).toContainText(products[0].name[locale]);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('main')).toContainText(id!);
    await page.locator('.header select').selectOption(locale === 'ja' ? 'en' : 'ja');
    await expect(page.locator('main')).toContainText(id!);
  });
