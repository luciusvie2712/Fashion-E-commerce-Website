import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { products, colors, unitPrice, variantImage } from '../src/data/catalog';
import { quickViewCopy } from '../src/features/product/content';

// Real content, viewport containment and WCAG checks guard the shared preview everywhere it appears.
test('quick view is readable and contained across five locales and four viewports', async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/category/tshirts');
  const product = products[3];
  const trigger = page.locator(
    `.product-card:has(a.product-name[href="/product/${product.slug}"]) .quick-view`,
  );
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja'] as const) {
    await page.locator('.header select').selectOption(locale);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await trigger.focus();
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: product.name[locale], exact: true });
      await expect(dialog.locator('h3')).toHaveText(product.name[locale]);
      await expect(dialog.locator('.quick-preview-description')).toHaveText(
        product.description[locale],
      );
      await expect(dialog.locator('.quick-preview-fabric p')).toHaveText(product.materials[locale]);
      await dialog.locator('summary').click();
      await expect(dialog.locator('.quick-preview-care > p')).toHaveText(product.care[locale]);
      const geometry = await dialog.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const scroller = el.querySelector('.quick-preview')!;
        return {
          x: box.x,
          y: box.y,
          right: box.right,
          bottom: box.bottom,
          overflow: scroller.scrollWidth > scroller.clientWidth,
        };
      });
      expect(geometry.x).toBeGreaterThanOrEqual(0);
      expect(geometry.y).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(width);
      expect(geometry.bottom).toBeLessThanOrEqual(900);
      expect(geometry.overflow).toBe(false);
      const photo = (await dialog.locator('.quick-preview-photo').boundingBox())!;
      const favorite = (await dialog.locator('.quick-preview-photo .favorite').boundingBox())!;
      expect(favorite.x).toBeGreaterThanOrEqual(photo.x);
      expect(favorite.y).toBeGreaterThanOrEqual(photo.y);
      expect(favorite.x + favorite.width).toBeLessThanOrEqual(photo.x + photo.width);
      expect(favorite.y + favorite.height).toBeLessThanOrEqual(photo.y + photo.height);
      await expect
        .poll(() =>
          dialog
            .locator('.quick-preview-photo img')
            .evaluate((el) => (el as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
      await dialog.getByRole('link').scrollIntoViewIfNeeded();
      await expect(
        dialog.getByRole('link', { name: quickViewCopy.details[locale] }),
      ).toBeInViewport();
      await expect(dialog.locator('.modal-close')).toBeInViewport();
      if (width === 390 || width === 1440) {
        const audit = await new AxeBuilder({ page })
          .include('.quick-view-dialog')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(
          audit.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
          `${locale} ${width}`,
        ).toEqual([]);
      }
      if (locale === 'vi' && (width === 390 || width === 1440)) {
        await dialog.locator('.quick-preview').evaluate((el) => {
          el.scrollTop = 0;
        });
        await page.screenshot({ path: `.tmp/visual/quick-view-${width}.png` });
      }
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
  }
});

test('quick view updates color image, real stock, price and wishlist, resets and opens details', async ({
  page,
}) => {
  await page.goto('/category/tshirts');
  await page.locator('.header select').selectOption('en');
  const product = products[6];
  const trigger = page.locator(
    `.product-card:has(a.product-name[href="/product/${product.slug}"]) .quick-view`,
  );
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  for (const color of colors.filter((c) => product.variants.some((v) => v.colorId === c.id))) {
    await dialog.getByRole('button', { name: color.name.en, exact: true }).click();
    const variants = product.variants.filter((v) => v.colorId === color.id);
    const stocked = variants.filter((v) => v.stock > 0);
    const price = Math.min(
      ...(stocked.length ? stocked : variants).map((v) => unitPrice(product, v.id)),
    );
    await expect(dialog.locator('.quick-preview-pricing strong')).toHaveText(
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(price),
    );
    await expect(dialog.locator('.quick-preview-photo img')).toHaveAttribute(
      'src',
      variantImage(product, variants[0].id),
    );
    for (const variant of variants) {
      await expect(
        dialog
          .locator('.quick-preview-sizes li')
          .filter({ hasText: new RegExp(`^${variant.size} ·`) }),
      ).toHaveAttribute('data-unavailable', String(variant.stock === 0));
    }
  }
  await dialog.getByRole('button', { name: 'Wishlist', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Wishlist', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await trigger.click();
  await expect(dialog.getByRole('button', { name: 'Ink', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(dialog.locator('.quick-preview-care')).not.toHaveAttribute('open');
  await dialog.getByRole('link', { name: 'Explore product' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`/product/${product.slug}$`));
});

test('quick view handles sold-out single-size products, short screens and image fallback', async ({
  page,
}) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await page.goto('/category/accessories');
  await page.locator('.header select').selectOption('en');
  const product = products[47];
  await page.route('**/assets/photos/p-048-ink.webp', (route) => route.abort());
  const trigger = page.locator(
    `.product-card:has(a.product-name[href="/product/${product.slug}"]) .quick-view`,
  );
  await trigger.focus();
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.quick-preview-stock')).toHaveText('Sold out · Ink');
  await expect(dialog.locator('.quick-preview-sizes li')).toHaveCount(1);
  await expect(dialog.locator('.quick-preview-sizes li')).toContainText('ONE_SIZE');
  await expect(dialog.locator('.quick-preview-photo > svg')).toBeVisible();
  await dialog.getByRole('link').scrollIntoViewIfNeeded();
  await expect(dialog.getByRole('link')).toBeInViewport();
  await expect(dialog.locator('.modal-close')).toBeInViewport();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
