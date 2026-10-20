import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { resources } from '../src/features/i18n/dictionaries';

test('cart quantity controls respect stock, update totals and persist the selected color', async ({
  page,
}) => {
  await page.goto('/product/fluivix-tshirts-1');
  await page.locator('.header select').selectOption('en');
  await page.getByRole('button', { name: 'Sand', exact: true }).click();
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await page.goto('/cart');
  const row = page.locator('.cart-row');
  const quantity = row.getByRole('spinbutton', { name: 'Quantity', exact: true });
  const decrease = row.getByRole('button', { name: 'Decrease quantity', exact: true });
  const increase = row.getByRole('button', { name: 'Increase quantity', exact: true });
  await expect(row.locator('img')).toHaveAttribute('src', /p-001-sand\.webp$/);
  await expect(decrease).toBeDisabled();
  await increase.click();
  await expect(quantity).toHaveValue('2');
  await expect(row.locator('.cart-line-total strong')).toHaveText('₫398,000');
  await expect(page.locator('.summary [data-amount="totalVnd"] dd')).toHaveText('₫428,000');
  const max = (await quantity.getAttribute('max'))!;
  await quantity.fill(max);
  await expect(increase).toBeDisabled();
  await decrease.click();
  await expect(quantity).toHaveValue(String(Number(max) - 1));
  await page.reload();
  await expect(quantity).toHaveValue(String(Number(max) - 1));
  await expect(row.locator('img')).toHaveAttribute('src', /p-001-sand\.webp$/);
  await row.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(row).toHaveCount(0);
  await expect(
    page.locator('.cart-empty').getByRole('link', { name: 'Continue shopping' }),
  ).toBeVisible();
});

test('populated cart stays accessible and balanced across five locales on mobile and desktop', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/cart');
  await page.evaluate(() => {
    const identity = JSON.parse(localStorage.getItem('fluivix:v1:identity')!);
    localStorage.setItem(
      'fluivix:v1:shopping',
      JSON.stringify({
        version: 1,
        state: {
          carts: {
            [identity.state.guestId]: [
              { productId: 'p-001', variantId: 'p-001-sand-M', quantity: 2 },
              { productId: 'p-009', variantId: 'p-009-olive-L', quantity: 1 },
              { productId: 'p-041', variantId: 'p-041-ink-ONE_SIZE', quantity: 1 },
            ],
          },
          intent: null,
        },
      }),
    );
  });
  await page.reload();
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja'] as const) {
    await page.locator('.header select').selectOption(locale);
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator('.cart-row')).toHaveCount(3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const row = page.locator('.cart-row').first();
      await expect(
        row.getByRole('button', {
          name: resources[locale].translation.increaseQuantity,
          exact: true,
        }),
      ).toBeVisible();
      const image = await row.locator('img').boundingBox();
      const info = await row.locator('.cart-product-info').boundingBox();
      expect(image!.x + image!.width).toBeLessThanOrEqual(info!.x);
      for (const control of await row.locator('button').all()) {
        const box = await control.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
      if ((locale === 'vi' && width === 360) || (locale === 'en' && width === 1280)) {
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(
          results.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
        ).toEqual([]);
      }
      await page.screenshot({ path: `.tmp/visual/cart-${locale}-${width}.png`, fullPage: true });
    }
  }
});
