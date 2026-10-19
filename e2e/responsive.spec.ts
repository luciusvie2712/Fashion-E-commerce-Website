import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const width of [360, 390, 768, 1024, 1280, 1440])
  test(`responsive layout and images at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('.header select').selectOption('ja');
    await page.evaluate(() => {
      const identity = JSON.parse(localStorage.getItem('fluivix:v1:identity')!);
      identity.state.session = 'demo-user';
      localStorage.setItem('fluivix:v1:identity', JSON.stringify(identity));
      const line = { productId: 'p-001', variantId: 'p-001-ink-M', quantity: 1 };
      localStorage.setItem(
        'fluivix:v1:shopping',
        JSON.stringify({
          version: 1,
          state: {
            carts: { 'demo-user': [line] },
            intent: {
              id: 'responsive-intent',
              ownerId: 'demo-user',
              source: 'BUY_NOW',
              items: [line],
            },
          },
        }),
      );
    });
    for (const route of [
      '/',
      '/shop',
      '/product/fluivix-tshirts-1',
      '/cart',
      '/checkout',
      '/account/orders/FLX-DEMO-1',
      '/login',
      '/about',
    ]) {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        route,
      ).toBe(true);
      const images = page.locator('main img');
      for (const img of await images.all()) {
        await img.scrollIntoViewIfNeeded();
        await expect(img).toHaveJSProperty('complete', true);
        expect(await img.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(
          0,
        );
      }
      await page.screenshot({
        path: `.tmp/visual/visual-${width}-${route === '/' ? 'home' : route.split('/')[1]}.png`,
        fullPage: true,
      });
    }
  });
test('key screens meet automated WCAG AA checks', async ({ page }) => {
  await page.goto('/');
  await page.locator('.header select').selectOption('en');
  await page.evaluate(() => {
    const identity = JSON.parse(localStorage.getItem('fluivix:v1:identity')!);
    identity.state.session = 'demo-user';
    localStorage.setItem('fluivix:v1:identity', JSON.stringify(identity));
    localStorage.setItem(
      'fluivix:v1:shopping',
      JSON.stringify({
        version: 1,
        state: {
          carts: {},
          intent: {
            id: 'axe-intent',
            ownerId: 'demo-user',
            source: 'BUY_NOW',
            items: [{ productId: 'p-001', variantId: 'p-001-ink-M', quantity: 1 }],
          },
        },
      }),
    );
  });
  for (const route of [
    '/',
    '/shop',
    '/product/fluivix-tshirts-1',
    '/login',
    '/contact',
    '/account/profile',
    '/account/addresses',
    '/checkout',
  ]) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.map((n) => n.target),
      })),
      route,
    ).toEqual([]);
  }
});
test('mobile drawer and filter dialog work with keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.header select').selectOption('en');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('link', { name: 'Shop', exact: true }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
