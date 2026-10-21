import { test, expect } from '@playwright/test';

test('photographic product variants and section images load locally', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.hero-media>img');
  await expect(hero).toHaveAttribute('src', '/assets/photos/campaign-hero.webp');
  await expect(hero).toHaveJSProperty('complete', true);
  await page.goto('/product/fluivix-tshirts-1');
  await expect(page.locator('main h1')).toBeVisible();
  await page.locator('.header select').selectOption('en');
  for (const [label, color] of [
    ['Ink', 'ink'],
    ['Sand', 'sand'],
    ['Olive', 'olive'],
  ]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.locator('.gallery-main img')).toHaveAttribute(
      'src',
      `/assets/photos/p-001-${color}.webp`,
    );
    await page.locator('.gallery-main img').evaluate((img: HTMLImageElement) => img.decode());
  }
  await expect(page.locator('.gallery>.small')).toHaveCount(0);
  await expect(page.locator('.gallery-main img')).toHaveAttribute(
    'alt',
    await page.locator('main h1').innerText(),
  );
  for (const route of ['/collections', '/lookbook', '/about']) {
    await page.goto(route);
    await expect(page.locator('main h1')).toBeVisible();
    const paths = await page
      .locator('main img')
      .evaluateAll((nodes) => nodes.map((img) => img.getAttribute('src')));
    expect(paths.length).toBeGreaterThan(0);
    expect(
      paths.every((path) => path?.startsWith('/assets/photos/') && path.endsWith('.webp')),
    ).toBe(true);
  }
});

test('larger storefront typography remains readable in five locales', async ({ page }) => {
  await page.goto('/');
  for (const width of [360, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja']) {
      await page.locator('.header select').selectOption(locale);
      for (const route of ['/', '/shop', '/product/fluivix-tshirts-1', '/login']) {
        await page.goto(route);
        await expect(page.locator('main h1').first()).toBeVisible();
        expect(
          await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize)),
        ).toBeGreaterThanOrEqual(17);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale} ${route} ${width}`,
        ).toBe(true);
        const card = page.locator('.product-name').first();
        if (await card.count())
          expect(
            await card.evaluate((node) => parseFloat(getComputedStyle(node).fontSize)),
          ).toBeGreaterThanOrEqual(16);
        if (route === '/login')
          expect(
            await page
              .locator('input[type="email"]')
              .evaluate((node) => parseFloat(getComputedStyle(node).fontSize)),
          ).toBeGreaterThanOrEqual(16);
      }
    }
  }
});
