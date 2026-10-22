import { test, expect, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { seedOrders } from '../src/data/fixtures';

async function centeredThumbnail(row: Locator) {
  const image = row.locator('.order-product-image');
  await expect(image).toHaveJSProperty('complete', true);
  const box = (await image.boundingBox())!,
    parent = (await row.boundingBox())!;
  const mobile = row.page().viewportSize()!.width <= 700;
  expect(box.width).toBe(mobile ? 58 : 80);
  expect(box.height).toBe(mobile ? 74 : 100);
  expect(Math.abs(box.y + box.height / 2 - parent.y - parent.height / 2)).toBeLessThanOrEqual(1);
}

test('voucher suggestions require applying, recover from shipping conflicts and preserve checkout imagery', async ({
  page,
}) => {
  await page.goto('/product/fluivix-tshirts-1');
  await page.locator('.header select').selectOption('en');
  await page.getByRole('button', { name: 'Sand', exact: true }).click();
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('spinbutton').fill('2');
  await page.getByRole('button', { name: 'Buy now', exact: true }).click();
  await expect(page.locator('.checkout-products img')).toHaveAttribute('src', /p-001-sand\.webp$/);
  await page.locator('.coupon-options > summary').click();
  await page.getByRole('button', { name: /^FLUIVIX10/ }).click();
  await expect(page.getByRole('textbox', { name: 'Voucher code', exact: true })).toHaveValue(
    'FLUIVIX10',
  );
  await expect(page.locator('.coupon-applied')).toHaveCount(0);
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('.coupon-applied')).toContainText('FLUIVIX10');
  await expect(page.locator('.summary [data-amount="discountVnd"] dd')).toHaveText('− ₫39,800');
  await page.getByRole('button', { name: /^FREESHIP/ }).click();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('.summary [data-amount="totalVnd"] dd')).toHaveText('₫398,000');
  await page.getByRole('radio', { name: /^Express/ }).check();
  await expect(page.getByRole('button', { name: 'Place DEMO order' })).toBeDisabled();
  await expect(page.locator('.coupon-applied')).toHaveAttribute('data-invalid', 'true');
  await page.getByRole('button', { name: 'Remove FREESHIP', exact: true }).click();
  await expect(page.locator('.coupon-applied')).toHaveCount(0);
  await page.getByRole('radio', { name: /^Standard/ }).check();
  for (const [name, value] of [
    ['Recipient', 'Sample Person'],
    ['Phone number', '0900000000'],
    ['Province / city', 'Sample City'],
    ['District / locality', 'Sample District'],
    ['Street and local area', 'Sample Street 12'],
  ]) {
    await page.getByRole('textbox', { name, exact: true }).fill(value);
  }
  await page.getByRole('button', { name: 'Place DEMO order' }).click();
  await expect(page).toHaveURL(/checkout\/success/);
  await expect(page.locator('.receipt-products img')).toHaveAttribute('src', /p-001-sand\.webp$/);
  await page.locator('.order-success > .button').click();
  await expect(page).toHaveURL(/track-order\?orderId=/);
  await expect(page.locator('.timeline [aria-current="step"]')).toContainText(
    'Pending confirmation',
  );
});

test('checkout, order cards, receipts and tracking keep fixed centered images and localized accessible layouts', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate((orders) => {
    const identity = JSON.parse(localStorage.getItem('fluivix:v1:identity')!);
    identity.state.session = 'demo-user';
    localStorage.setItem('fluivix:v1:identity', JSON.stringify(identity));
    const guest = {
      ...orders[2],
      id: 'FLX-UI-GUEST',
      ownerId: identity.state.guestId,
      ownerType: 'GUEST',
    };
    localStorage.setItem(
      'fluivix:v1:orders',
      JSON.stringify({ version: 1, state: { orders: [...orders, guest] } }),
    );
    localStorage.setItem(
      'fluivix:v1:shopping',
      JSON.stringify({
        version: 1,
        state: {
          carts: {},
          intent: {
            id: 'ui-checkout',
            ownerId: 'demo-user',
            source: 'BUY_NOW',
            items: [{ productId: 'p-001', variantId: 'p-001-sand-M', quantity: 2 }],
          },
        },
      }),
    );
  }, seedOrders());
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja']) {
    await page.locator('.header select').selectOption(locale);
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        '/checkout',
        '/account/orders',
        '/account/orders/FLX-DEMO-1',
        '/track-order?orderId=FLX-UI-GUEST',
      ]) {
        await page.goto(route);
        await expect(page.locator('main')).toBeVisible();
        if (width <= 700 && route === '/checkout')
          await page.locator('.checkout-items-toggle').click();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale} ${width} ${route}`,
        ).toBe(true);
        const rows = page.locator('.order-product, .order-card-body');
        expect(await rows.count()).toBeGreaterThan(0);
        for (const row of await rows.all()) await centeredThumbnail(row);
        if (locale === 'vi' || locale === 'en') {
          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze();
          expect(
            results.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
            `${locale} ${width} ${route}`,
          ).toEqual([]);
          await page.screenshot({
            path: `.tmp/visual/commerce-${locale}-${width}-${route.split('?')[0].split('/')[1]}-${route.includes('FLX-DEMO') ? 'detail' : 'list'}.png`,
            fullPage: true,
          });
        }
      }
    }
  }
});
