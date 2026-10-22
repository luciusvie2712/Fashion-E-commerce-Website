import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { routeInventory } from '../src/app/route-inventory';
import { seedOrders } from '../src/data/fixtures';
import { mobileCopy } from '../src/components/mobile-content';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  actionTimeout: 15000,
});

async function seed(page: import('@playwright/test').Page) {
  await page.goto('/');
  await expect(page.locator('main h1')).toBeVisible();
  await page.evaluate((orders) => {
    const identity = JSON.parse(localStorage.getItem('fluivix:v1:identity')!);
    identity.state.session = 'demo-user';
    identity.state.addresses = [
      {
        id: 'mobile-address',
        ownerId: 'demo-user',
        recipient: 'Mobile Demo',
        phone: '0900000000',
        province: 'Sample City',
        district: 'Sample District',
        street: 'Sample Street 12',
        isDefault: true,
      },
    ];
    localStorage.setItem('fluivix:v1:identity', JSON.stringify(identity));
    const guest = {
      ...orders[2],
      id: 'FLX-MOBILE-GUEST',
      ownerId: identity.state.guestId,
      ownerType: 'GUEST',
    };
    localStorage.setItem(
      'fluivix:v1:orders',
      JSON.stringify({ version: 1, state: { orders: [...orders, guest] } }),
    );
    const items = [{ productId: 'p-001', variantId: 'p-001-ink-M', quantity: 2 }];
    localStorage.setItem(
      'fluivix:v1:shopping',
      JSON.stringify({
        version: 1,
        state: {
          carts: { 'demo-user': items },
          intent: { id: 'mobile-checkout', ownerId: 'demo-user', source: 'CART', items },
        },
      }),
    );
    localStorage.setItem(
      'fluivix:v1:favorites',
      JSON.stringify({ version: 1, state: { lists: { 'demo-user': ['p-001'] }, recent: {} } }),
    );
  }, seedOrders());
}

for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja'] as const) {
  test(`all 34 mobile routes have complete contained layouts in ${locale}`, async ({ page }) => {
    test.setTimeout(240000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await seed(page);
    await page.locator('.header select').selectOption(locale);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const width of [320, 390, 430, 768]) {
      await page.setViewportSize({ width, height: 844 });
      for (const [pattern] of routeInventory) {
        let route = pattern
          .replace('/category/:slug', '/category/tshirts')
          .replace('/collections/:slug', '/collections/everyday')
          .replace('/product/:slug', '/product/fluivix-tshirts-4')
          .replace(':id', 'FLX-DEMO-1');
        if (route === '/checkout/payment') route += '?orderId=FLX-DEMO-6';
        if (route === '/checkout/success') route += '?orderId=FLX-DEMO-1';
        if (route === '/track-order') route += '?orderId=FLX-MOBILE-GUEST';
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('main h1').first()).toBeVisible();
        if (pattern === '/wishlist')
          await expect(page.locator('main .product-card')).toHaveCount(1);
        if (pattern === '/account/addresses')
          await expect(page.locator('.address-grid article')).toHaveCount(1);
        if (pattern === '/checkout') await expect(page.locator('.checkout-summary')).toBeVisible();
        if (pattern === '/checkout/success')
          await expect(page.locator('.receipt-products')).toBeVisible();
        if (pattern === '/checkout/payment')
          await expect(page.locator('main .status')).toBeVisible();
        if (pattern === '/account/orders/:id')
          await expect(page.locator('.order-detail')).toBeVisible();
        if (pattern === '/track-order')
          await expect(page.locator('.tracking-result')).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale} ${width} ${route}`,
        ).toBe(true);
        const commerce = /^\/(product\/|cart$|checkout)/.test(pattern);
        await expect(page.locator('.mobile-bottom-nav')).toHaveCount(commerce ? 0 : 1);
        if (!commerce && width <= 700) {
          const bar = page.locator('.mobile-bottom-nav');
          await expect(bar).toBeInViewport();
          for (const link of await bar.getByRole('link').all())
            expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        }
        if (
          width === 390 &&
          locale === 'vi' &&
          [
            '/',
            '/shop',
            '/cart',
            '/checkout',
            '/account',
            '/about',
            '/contact',
            '/faq',
            '/lookbook',
            '/terms',
          ].includes(pattern)
        ) {
          await page.evaluate(() => document.fonts.ready);
          await page.screenshot({
            path: `.tmp/visual/mobile-final-${pattern === '/' ? 'home' : pattern.slice(1)}.png`,
          });
        }
      }
    }
    expect(errors).toEqual([]);
  });
}

test('phone browsing uses category shelves, a filter sheet and accessible compact footer', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.header select').selectOption('en');
  const rail = page.locator('.category-grid');
  expect(await rail.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  await page.locator('.mobile-bottom-nav').getByRole('link', { name: 'Shop', exact: true }).tap();
  await page
    .locator('.catalog-category-rail')
    .getByRole('button', { name: 'T-shirts', exact: true })
    .tap();
  await expect(page).toHaveURL(/category=tshirts/);
  await page.getByRole('button', { name: 'Filters', exact: true }).tap();
  const sheet = page.getByRole('dialog');
  await sheet.getByRole('button', { name: 'M', exact: true }).tap();
  await expect(page).toHaveURL(/size=M/);
  await sheet.locator('.catalog-filter-result button').tap();
  await expect(sheet).toHaveCount(0);
  await expect(page.locator('.product-card')).not.toHaveCount(0);
  await page.reload();
  await expect(page.locator('.catalog-category-rail button[aria-pressed="true"]')).toHaveText(
    'T-shirts',
  );
  const footer = page.locator('.site-footer');
  const support = footer.locator('details').nth(1);
  await support.locator('summary').tap();
  await expect(support).toHaveAttribute('open');
  await support.getByRole('link', { name: 'FAQ', exact: true }).tap();
  await expect(page).toHaveURL(/\/faq$/);
});

test('swipe gallery and purchase docks support a complete phone order', async ({
  page,
  context,
}) => {
  await page.goto('/product/fluivix-tshirts-4');
  await page.locator('.header select').selectOption('en');
  await expect(page.locator('.mobile-product-action')).toBeInViewport();
  const photo = (await page.locator('.gallery-main').boundingBox())!;
  const x = photo.x + photo.width * 0.75,
    y = Math.min(photo.y + photo.height / 2, 600);
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 8; step++) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x - step * 20, y }],
    });
    await page.waitForTimeout(16);
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('.gallery-main img')).toHaveAttribute('src', /p-004-sand.webp$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  // CDP touch completion precedes the browser's next paint; let the new image reach the screen.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  // Use pointer activation immediately after the raw CDP swipe: Chromium can suppress
  // subsequent taps' compatibility clicks. Native tap controls are covered separately.
  await page.getByRole('button', { name: mobileCopy.quickAdd.en, exact: true }).click();
  await expect(page.locator('.purchase [role="alert"]')).toBeVisible();
  await page.locator('.purchase').getByRole('button', { name: 'Sand', exact: true }).click();
  await page.locator('.purchase').getByRole('button', { name: 'M', exact: true }).click();
  await expect(page.locator('.mobile-product-action strong')).toHaveText('₫279,000');
  await page.getByRole('button', { name: mobileCopy.quickAdd.en, exact: true }).click();
  await page.locator('.header-actions a[href="/cart"]').click();
  const dock = page.locator('.cart-checkout-action');
  await expect(dock).toBeInViewport();
  for (const scroll of [0, 400, 10000]) {
    await page.evaluate((y) => scrollTo(0, y), scroll);
    await expect(dock).toBeInViewport();
    expect(
      await dock.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }),
    ).toBe(true);
  }
  await dock.getByRole('button', { name: 'Checkout', exact: true }).click();
  await page.locator('.checkout-items-toggle').click();
  await expect(page.locator('.checkout-products .order-product')).toBeVisible();
  for (const [name, value] of [
    ['Recipient', 'Sample Person'],
    ['Phone number', '0900000000'],
    ['Province / city', 'Sample City'],
    ['District / locality', 'Sample District'],
    ['Street and local area', 'Sample Street 12'],
  ]) {
    await page.getByRole('textbox', { name, exact: true }).fill(value);
  }
  await page.getByRole('button', { name: 'Place DEMO order', exact: true }).click();
  await expect(page).toHaveURL(/checkout\/success/);
  await expect(page.locator('.receipt-products')).toContainText('Minimal T-shirts');
});

test('native account picker and mobile WCAG audits work across locales', async ({ page }) => {
  test.setTimeout(240000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page);
  await page.goto('/account');
  await page.locator('.header select').selectOption('en');
  await page.locator('.account-mobile-menu select').selectOption('/account/profile');
  await expect(page).toHaveURL(/\/account\/profile$/);
  await page.locator('input[name="fullName"]').fill('Mobile Demo');
  await page.locator('main').getByRole('button', { name: 'Save changes', exact: true }).tap();
  await page.locator('.account-mobile-menu select').selectOption('/account');
  await expect(page.locator('.account-member-card h2')).toHaveText('Mobile Demo');
  await page.goto('/account/orders/FLX-DEMO-1');
  await page.locator('.account-mobile-menu select').selectOption('/account/orders');
  await expect(page).toHaveURL(/\/account\/orders$/);
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja']) {
    await page.locator('.header select').selectOption(locale);
    for (const route of [
      '/',
      '/shop',
      '/product/fluivix-tshirts-4',
      '/cart',
      '/checkout',
      '/account',
      '/account/orders/FLX-DEMO-1',
      '/terms',
    ]) {
      await page.goto(route);
      await expect(page.locator('main h1').first()).toBeVisible();
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        `${locale} ${route}`,
      ).toEqual([]);
    }
  }
});

test('short landscape heroes retain complete copy and sold-out docks explain availability', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const [width, height] of [
    [430, 320],
    [568, 320],
    [667, 375],
  ]) {
    await page.setViewportSize({ width, height });
    for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja']) {
      await page.locator('.header select').selectOption(locale);
      await page.evaluate(() => scrollTo(0, 0));
      await expect
        .poll(() =>
          page.locator('.hero').evaluate((el) => {
            const hero = el.getBoundingClientRect(),
              copy = el.querySelector('.hero-copy')!.getBoundingClientRect();
            return (
              copy.top >= hero.top - 1 &&
              copy.bottom <= hero.bottom + 1 &&
              document.documentElement.scrollWidth <= innerWidth
            );
          }),
        )
        .toBe(true);
      const action = page.locator('.hero-copy .button');
      await action.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await expect(action).toBeInViewport();
      const box = (await action.boundingBox())!,
        nav = (await page.locator('.mobile-bottom-nav').boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(nav.y);
      if (locale === 'vi')
        await page.screenshot({ path: `.tmp/visual/mobile-final-landscape-${width}.png` });
    }
  }
  await page.goto('/product/fluivix-accessories-8');
  await page.locator('.header select').selectOption('en');
  await expect(page.locator('.mobile-product-action span')).toHaveText('Sold out');
  await expect(
    page.getByRole('button', { name: mobileCopy.quickAdd.en, exact: true }),
  ).toBeDisabled();
});
