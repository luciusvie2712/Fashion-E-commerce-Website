import { test, expect } from '@playwright/test';
import { routeInventory } from '../src/app/route-inventory';
const locales = ['vi', 'en', 'ko', 'zh-CN', 'ja'];
const routes = [
  '/',
  '/shop',
  '/category/tshirts',
  '/collections',
  '/collections/everyday',
  '/new-arrivals',
  '/best-sellers',
  '/sale',
  '/search?q=ao',
  '/product/fluivix-tshirts-1',
  '/wishlist',
  '/cart',
  '/checkout',
  '/checkout/payment?orderId=FLX-DEMO-6',
  '/checkout/success?orderId=FLX-DEMO-1',
  '/track-order',
  '/login',
  '/register',
  '/forgot-password',
  '/account',
  '/account/profile',
  '/account/addresses',
  '/account/orders',
  '/account/orders/FLX-DEMO-1',
  '/account/vouchers',
  '/about',
  '/lookbook',
  '/contact',
  '/size-guide',
  '/faq',
  '/shipping-policy',
  '/return-policy',
  '/privacy-policy',
  '/terms',
];
for (const locale of locales)
  test(`all 34 routes render in ${locale}`, async ({ page, baseURL }) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const external: string[] = [];
    page.on('request', (r) => {
      if (!r.url().startsWith(baseURL!)) external.push(r.url());
    });
    await page.goto('/');
    await page.locator('.header select').selectOption(locale);
    await page.evaluate(() => {
      const identity = JSON.parse(localStorage.getItem('fluivix:v1:identity')!);
      identity.state.session = 'demo-user';
      localStorage.setItem('fluivix:v1:identity', JSON.stringify(identity));
      localStorage.setItem(
        'fluivix:v1:shopping',
        JSON.stringify({
          version: 1,
          state: {
            carts: { 'demo-user': [{ productId: 'p-001', variantId: 'p-001-ink-M', quantity: 1 }] },
            intent: {
              id: 'locale-intent',
              ownerId: 'demo-user',
              source: 'BUY_NOW',
              items: [{ productId: 'p-001', variantId: 'p-001-ink-M', quantity: 1 }],
            },
          },
        }),
      );
    });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('main h1').first()).toBeVisible();
      expect(await page.locator('main').innerText()).not.toMatch(
        /lorem ipsum|\b(?:checkout|catalog|errors)\.[a-z]+/i,
      );
      await expect(page).not.toHaveURL(/login\?redirect=/);
      expect(await page.locator('main').innerText()).not.toBe('');
      const links = await page
        .locator('a')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
      for (const href of links) {
        expect(href).toBeTruthy();
        expect(href).not.toBe('#');
        if (href!.startsWith('#')) {
          expect(await page.locator(href!).count()).toBeGreaterThan(0);
        } else {
          const target = new URL(href!, baseURL);
          expect(target.origin).toBe(new URL(baseURL!).origin);
          expect(
            routeInventory.some(([pattern]) =>
              new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$').test(target.pathname),
            ),
            target.pathname,
          ).toBe(true);
        }
      }
    }
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
  });
test('switch language in checkout retains form data prices and intent', async ({ page }) => {
  await page.goto('/');
  await page.locator('.header select').selectOption('en');
  await page.goto('/product/fluivix-tshirts-1');
  await page.getByRole('button', { name: 'Ink', exact: true }).click();
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('button', { name: 'Buy now', exact: true }).click();
  await page.getByRole('textbox', { name: 'Recipient', exact: true }).fill('Sample Name');
  const before = await page.evaluate(() => localStorage.getItem('fluivix:v1:shopping'));
  for (const locale of locales) {
    await page.locator('.header select').selectOption(locale);
    expect(await page.locator('input[name="recipient"]').inputValue()).toBe('Sample Name');
    expect(await page.evaluate(() => localStorage.getItem('fluivix:v1:shopping'))).toBe(before);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.field-error')).not.toHaveCount(0);
  }
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
});
