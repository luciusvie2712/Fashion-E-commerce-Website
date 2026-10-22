import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { resources } from '../src/features/i18n/dictionaries';

test('footer remains readable and accessible across languages and widths', async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/contact');
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja'] as const) {
    await page.locator('.header select').selectOption(locale);
    const footer = page.getByRole('contentinfo');
    await expect(
      footer.getByRole('heading', { name: resources[locale].translation.footerSupport }),
    ).toBeVisible();
    await expect(footer.locator('nav a')).toHaveCount(15);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const group of await footer.locator('details.site-footer-column').all()) {
        if ((await group.getAttribute('open')) === null) await group.locator('summary').click();
      }
      await footer.scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${locale} ${width}`,
      ).toBe(true);
      const boxes = await footer
        .locator('.site-footer-brand, .site-footer-column')
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i],
            b = boxes[j];
          expect(
            Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1,
            `${locale} ${width} columns overlap`,
          ).toBe(false);
        }
      if (width < 600)
        for (const link of await footer.locator('nav a').all())
          expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      if (width === 390 || width === 1440) {
        const audit = await new AxeBuilder({ page })
          .include('.site-footer')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(
          audit.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
        ).toEqual([]);
      }
    }
  }
  await page.locator('.header select').selectOption('vi');
  for (const [name, width] of [
    ['desktop', 1440],
    ['mobile', 390],
  ] as const) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.site-footer').screenshot({ path: `.tmp/visual/footer-${name}.png` });
  }
});

test('footer routes, keyboard back-to-top and reset confirmation work', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/contact');
  await page.locator('.header select').selectOption('en');
  const footer = page.getByRole('contentinfo');
  for (const route of ['/shop', '/faq', '/shipping-policy']) {
    await footer.locator(`nav a[href="${route}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
  }
  await footer.locator('.site-footer-cta').click();
  await expect(page).toHaveURL(/\/collections$/);
  const back = footer.getByRole('button', { name: 'Back to top', exact: true });
  await back.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await back.focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('.header .wordmark')).toBeFocused();
  const reset = footer.getByRole('button', { name: 'Reset demo data', exact: true });
  await reset.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(reset).toBeFocused();
});
