import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { products } from '../src/data/catalog';
import { imageViewerCopy as copy } from '../src/features/product/content';

test('image viewer browses, zooms and pans without changing purchase options', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/product/fluivix-tshirts-4');
  await page.locator('.header select').selectOption('en');
  await page.locator('.purchase').getByRole('button', { name: 'Sand', exact: true }).click();
  await page.locator('.purchase').getByRole('button', { name: 'M', exact: true }).click();
  const trigger = page.locator('.gallery-main');
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.zoom-image')).toHaveAttribute('src', /p-004-sand.webp$/);
  await expect(dialog.locator('.image-viewer-caption')).toHaveText('02 / 03Sand');
  await dialog.getByRole('button', { name: 'Next image' }).click();
  await expect(dialog.locator('.zoom-image')).toHaveAttribute('src', /p-004-olive.webp$/);
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('.zoom-image')).toHaveAttribute('src', /p-004-ink.webp$/);
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.locator('.zoom-image')).toHaveAttribute('src', /p-004-olive.webp$/);
  await dialog
    .locator('.image-viewer-thumbnails')
    .getByRole('button', { name: '02 · Color: Sand' })
    .click();
  const tools = dialog.locator('.image-viewer-tools');
  await expect(tools.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
  await tools.getByRole('button', { name: 'Enlarge image' }).click();
  await expect(tools.locator('output')).toHaveText('150%');
  await tools.getByRole('button', { name: 'Enlarge image' }).click();
  await tools.getByRole('button', { name: 'Enlarge image' }).click();
  await expect(tools.locator('output')).toHaveText('250%');
  await tools.getByRole('button', { name: 'Zoom out' }).click();
  await expect(tools.locator('output')).toHaveText('200%');
  await tools.getByRole('button', { name: 'Enlarge image' }).click();
  await expect(tools.getByRole('button', { name: 'Enlarge image' })).toBeDisabled();
  const viewport = dialog.locator('.image-viewer-viewport');
  const before = await viewport.evaluate((el) => ({ x: el.scrollLeft, y: el.scrollTop }));
  const bounds = (await viewport.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 - 90, bounds.y + bounds.height / 2 - 70, {
    steps: 8,
  });
  await page.mouse.up();
  const after = await viewport.evaluate((el) => ({ x: el.scrollLeft, y: el.scrollTop }));
  expect(after.x).toBeGreaterThan(before.x + 60);
  expect(after.y).toBeGreaterThan(before.y + 40);
  await expect(tools.locator('output')).toHaveText('250%');
  await tools.getByRole('button', { name: 'Fit to view' }).click();
  await expect(tools.locator('output')).toHaveText('100%');
  expect(await viewport.evaluate((el) => el.scrollLeft + el.scrollTop)).toBe(0);
  await dialog.locator('.image-viewer-canvas').click();
  await expect(tools.locator('output')).toHaveText('200%');
  await dialog.getByRole('button', { name: 'Previous image' }).click();
  await expect(tools.locator('output')).toHaveText('100%');
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(
    page.locator('.purchase').getByRole('button', { name: 'Sand', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.locator('.purchase').getByRole('button', { name: 'M', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Enter');
  await expect(dialog.locator('.zoom-image')).toHaveAttribute('src', /p-004-sand.webp$/);
  await expect(tools.locator('output')).toHaveText('100%');
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).toHaveCount(0);
});

test('image viewer fits five locales and narrow, desktop and short landscape screens', async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/product/fluivix-tshirts-4');
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja'] as const) {
    await page.locator('.header select').selectOption(locale);
    for (const [width, height] of [
      [320, 740],
      [390, 844],
      [768, 1000],
      [1440, 1000],
      [568, 320],
    ]) {
      await page.setViewportSize({ width, height });
      await page.locator('.gallery-main').click();
      const dialog = page.getByRole('dialog', { name: products[3].name[locale], exact: true });
      await expect(dialog.locator('.image-viewer-header h3')).toHaveText(products[3].name[locale]);
      await expect(dialog.locator('.image-viewer-help')).toHaveText(copy.keyboard[locale]);
      await expect(dialog.locator('.zoom-image')).toHaveCSS('object-fit', 'contain');
      await expect
        .poll(() =>
          dialog.locator('.zoom-image').evaluate((el) => (el as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
      const geometry = await dialog.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          right: rect.right,
          bottom: rect.bottom,
          overflow: el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight,
        };
      });
      expect(geometry.x).toBeGreaterThanOrEqual(0);
      expect(geometry.y).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(width);
      expect(geometry.bottom).toBeLessThanOrEqual(height);
      expect(geometry.overflow).toBe(false);
      expect((await dialog.locator('.image-viewer-stage').boundingBox())!.height).toBeGreaterThan(
        45,
      );
      for (const selector of [
        '.modal-close',
        '.image-viewer-tools',
        '.image-viewer-thumbnails',
        '.image-viewer-prev',
        '.image-viewer-next',
      ]) {
        await expect(dialog.locator(selector)).toBeInViewport();
      }
      if (width === 390 || width === 1440) {
        const result = await new AxeBuilder({ page })
          .include('.image-viewer-dialog')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(
          result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
          `${locale} ${width}`,
        ).toEqual([]);
        if (locale === 'vi')
          await page.screenshot({ path: `.tmp/visual/image-viewer-${width}.png` });
      }
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
    }
  }
});

test('single-image viewer has clear disabled navigation and a usable local image fallback', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/assets/photos/p-048-ink.webp', (route) => route.abort());
  await page.goto('/product/fluivix-accessories-8');
  await page.locator('.header select').selectOption('en');
  await page.locator('.gallery-main').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('svg.zoom-image')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Previous image' })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Next image' })).toBeDisabled();
  await expect(dialog.locator('.image-viewer-help')).toHaveText(copy.onlyImage.en);
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('.image-viewer-caption')).toHaveText('01 / 01Ink');
  await dialog
    .locator('.image-viewer-tools')
    .getByRole('button', { name: 'Enlarge image' })
    .click();
  await expect(dialog.locator('output')).toHaveText('150%');
  await page.keyboard.press('Escape');
  await expect(page.locator('.gallery-main')).toBeFocused();
});

test('touch users can tap to zoom and pan the enlarged photo', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto(`${baseURL}/product/fluivix-tshirts-4`);
    await page.locator('.gallery-main').tap();
    const dialog = page.getByRole('dialog');
    await dialog.locator('.image-viewer-canvas').tap();
    await expect(dialog.locator('output')).toHaveText('200%');
    const viewport = dialog.locator('.image-viewer-viewport');
    const initial = await viewport.evaluate((el) => el.scrollTop);
    const rect = (await viewport.boundingBox())!;
    const x = rect.x + rect.width / 2,
      y = rect.y + rect.height / 2;
    const session = await context.newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 8; step++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x - step * 8, y: y - step * 10 }],
      });
      await page.waitForTimeout(16);
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(initial + 20);
    await expect(dialog.locator('output')).toHaveText('200%');
    // Chromium can omit the compatibility click of a tap after raw CDP scrolling.
    // Keep native touch zoom/pan assertions above; use pointer input to verify dismissal.
    await dialog.locator('.modal-close').click();
    await expect(dialog).toHaveCount(0);
  } finally {
    await context.close();
  }
});
