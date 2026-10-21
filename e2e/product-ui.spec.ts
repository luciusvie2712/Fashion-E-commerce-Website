import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { products } from '../src/data/catalog';

test('product options show exact price and stock and reset on product navigation', async ({
  page,
}) => {
  await page.goto('/product/fluivix-tshirts-4');
  await page.locator('.header select').selectOption('en');
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await expect(page.locator('.purchase [role="alert"]')).toBeVisible();
  await page.getByRole('button', { name: 'Ink', exact: true }).click();
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await expect(page.locator('.large-price strong')).toHaveText('₫279,000');
  await expect(page.locator('.large-price del')).toHaveText('₫359,000');
  const quantity = page
    .locator('.purchase')
    .getByRole('spinbutton', { name: 'Quantity', exact: true });
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await expect(quantity).toHaveValue('2');
  const maximum = Number(await quantity.getAttribute('max'));
  await quantity.fill(String(maximum));
  await expect(page.getByRole('button', { name: 'Increase quantity', exact: true })).toBeDisabled();
  await quantity.fill(String(maximum + 1));
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await expect(page.locator('.purchase [role="alert"]')).toContainText('stock');
  await quantity.fill('2');
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await expect(page.locator('.purchase [role="alert"]')).toHaveCount(0);
  await page.locator('.product-card .product-name').first().click();
  await expect(page).toHaveURL(/\/product\/fluivix-tshirts-1$/);
  await expect(page.locator('.purchase .chips button[aria-pressed="true"]')).toHaveCount(0);
  await expect(quantity).toHaveValue('1');
  await page.goto('/product/fluivix-tshirts-7');
  await page.getByRole('button', { name: 'Ink', exact: true }).click();
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('button', { name: 'Sand', exact: true }).click();
  await expect(page.getByRole('button', { name: 'M', exact: true })).toBeDisabled();
  await expect(page.locator('.product-stock')).toHaveText('Sold out');
  await expect(page.getByRole('button', { name: 'Add to bag', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'L', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Add to bag', exact: true })).toBeEnabled();
  await expect(page.locator('.gallery-main img')).toHaveAttribute('src', /p-007-sand\.webp$/);
  await page.getByRole('button', { name: 'Enlarge image', exact: true }).click();
  await expect(page.getByRole('dialog').locator('.zoom-image')).toHaveAttribute(
    'src',
    /p-007-sand\.webp$/,
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Enlarge image', exact: true })).toBeFocused();
  await page.locator('.product-section-links a').first().click();
  await expect(page).toHaveURL(/#product-information$/);
  await expect(
    page.locator('.product-information-grid').getByText(products[6].materials.en, { exact: true }),
  ).toBeVisible();
});

test('product layout and complete details work for all locales and product types', async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/product/fluivix-tshirts-1');
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja'] as const) {
    await page.locator('.header select').selectOption(locale);
    for (const slug of ['fluivix-tshirts-1', 'fluivix-tshirts-4', 'fluivix-accessories-8']) {
      await page.goto(`/product/${slug}`);
      const product = products.find((item) => item.slug === slug)!;
      await expect(page.locator('h1')).toHaveText(product.name[locale]);
      await expect(page.locator('.product-intro')).toHaveText(product.description[locale]);
      await expect(
        page
          .locator('.product-information-grid')
          .getByText(product.materials[locale], { exact: true }),
      ).toBeVisible();
      await expect(
        page.locator('.product-information-grid').getByText(product.care[locale], { exact: true }),
      ).toBeVisible();
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale} ${slug} ${width}`,
        ).toBe(true);
        await expect(page.locator('.gallery-main img')).toHaveJSProperty('complete', true);
        const photoBox = (await page.locator('.gallery-main').boundingBox())!;
        const hintBox = (await page.locator('.gallery-zoom-hint').boundingBox())!;
        expect(hintBox.height).toBeLessThanOrEqual(60);
        expect(hintBox.width).toBeLessThan(photoBox.width);
        expect(hintBox.x).toBeGreaterThanOrEqual(photoBox.x);
        expect(hintBox.y + hintBox.height).toBeLessThanOrEqual(photoBox.y + photoBox.height);
        if (width === 390 || width === 1440) {
          const audit = await new AxeBuilder({ page })
            .include('main')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          expect(
            audit.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
            `${locale} ${slug} ${width}`,
          ).toEqual([]);
        }
      }
    }
  }
  await page.locator('.header select').selectOption('vi');
  await page.goto('/product/fluivix-tshirts-4');
  await page.locator('.purchase fieldset .chips button').nth(1).click();
  await page.locator('.product-sizes button').nth(1).click();
  for (const [name, width] of [
    ['desktop', 1440],
    ['mobile', 390],
  ] as const) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => {
      scrollTo(0, 0);
      return document.fonts.ready;
    });
    await page.screenshot({ path: `.tmp/visual/product-upgrade-${name}.png`, fullPage: true });
  }
});
