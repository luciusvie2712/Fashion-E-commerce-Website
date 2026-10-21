import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { stories } from '../src/data/content';
import { collections } from '../src/data/catalog';

const routes = [
  '/return-policy',
  '/terms',
  '/lookbook',
  '/size-guide',
  '/shipping-policy',
  '/privacy-policy',
];
const policies = {
  '/return-policy': 'returnPolicy',
  '/terms': 'terms',
  '/shipping-policy': 'shippingPolicy',
  '/privacy-policy': 'privacyPolicy',
} as const;

test('six information pages retain all localized content and fit phones through desktop', async ({
  page,
}) => {
  test.setTimeout(240000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja'] as const) {
    await page.locator('.header select').selectOption(locale);
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('main h1')).toBeVisible();
      const policy = policies[route as keyof typeof policies];
      if (policy)
        for (const paragraph of stories[policy])
          await expect(
            page.locator('main').getByText(paragraph[locale], { exact: true }),
          ).toBeVisible();
      if (route === '/lookbook') {
        await expect(page.locator('.lookbook-edit')).toHaveCount(4);
        await expect(page.locator('.lookbook-pieces a')).toHaveCount(12);
        const sources = await page
          .locator('.lookbook-photo img')
          .evaluateAll((images) => images.map((image) => image.getAttribute('src')));
        expect(new Set(sources).size).toBe(4);
      }
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale} ${route} ${width}`,
        ).toBe(true);
        for (const img of await page.locator('main img').all()) {
          await img.scrollIntoViewIfNeeded();
          await img.evaluate((node: HTMLImageElement) => node.decode());
        }
        if (width === 390 || width === 1440) {
          const audit = await new AxeBuilder({ page })
            .include('main')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          expect(
            audit.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
            `${locale} ${route} ${width}`,
          ).toEqual([]);
        }
      }
    }
  }
  expect(errors).toEqual([]);
});

test('size reference, policy navigation and lookbook links stay interactive', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/size-guide');
  await page.locator('.header select').selectOption('en');
  const select = page.locator('main select');
  await expect(page.locator('main table tbody tr')).toHaveCount(5);
  await expect(page.locator('main table thead th')).toHaveCount(4);
  await select.selectOption('trousers');
  await expect(page.locator('main table thead th')).toHaveCount(3);
  await select.selectOption('accessories');
  await expect(page.locator('main table')).toHaveCount(0);
  await expect(page.locator('main')).toContainText('ONE_SIZE');
  await select.selectOption('tshirts');
  await page.locator('.information-toc a').last().click();
  await expect(page).toHaveURL(/#info-section-1$/);
  await page.locator('.information-related a[href="/return-policy"]').click();
  await expect(page.locator('.return-process li')).toHaveCount(4);
  await page.locator('.return-process a').click();
  await expect(page).toHaveURL(/\/track-order$/);
  await page.goto('/shipping-policy');
  await expect(page.locator('.information-table tbody tr')).toHaveCount(2);
  await expect(page.locator('.information-table')).toContainText('FREESHIP');
  await page.goto('/lookbook');
  for (const collection of collections) {
    await page.locator(`.lookbook-heading a[href="#look-${collection.id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#look-${collection.id}$`));
    await expect(page.locator(`#look-${collection.id}`)).toBeInViewport();
  }
  await page.locator('.lookbook-collection-link').last().click();
  await expect(page).toHaveURL(/\/collections\/studio$/);
  await page.goto('/lookbook');
  await page.locator('.lookbook-pieces a').first().click();
  await expect(page).toHaveURL(/\/product\//);
  await page.getByRole('button', { name: 'Size guide', exact: true }).click();
  await expect(page.getByRole('dialog').locator('table')).toBeVisible();
  await page.keyboard.press('Escape');
});

test('information page visual references', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.header select').selectOption('vi');
  for (const route of routes) {
    for (const [name, width] of [
      ['desktop', 1440],
      ['mobile', 390],
    ] as const) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(route);
      await expect(page.locator('main h1')).toBeVisible();
      for (const img of await page.locator('main img').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate((node: HTMLImageElement) => node.decode());
      }
      await page.evaluate(() => {
        scrollTo(0, 0);
        return document.fonts.ready;
      });
      await page.screenshot({
        path: `.tmp/visual/information-${route.slice(1)}-${name}.png`,
        fullPage: true,
      });
    }
  }
});
