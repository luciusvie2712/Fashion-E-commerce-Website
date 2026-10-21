import { test, expect } from '@playwright/test';
import { products, categories, collections } from '../src/data/catalog';
import { resources } from '../src/features/i18n/dictionaries';

test('brand icons and localized metadata load and update through navigation', async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  const html = await (await request.get('/')).text();
  expect(html).toContain('FLUIVIX — Chất riêng, mỗi ngày | Thời trang đương đại');
  expect(html).toContain('Khám phá FLUIVIX: trang phục đương đại');
  for (const [path, contentType] of [
    ['/favicon.svg', 'image/svg+xml'],
    ['/favicon.ico', 'image/'],
    ['/favicon-32x32.png', 'image/png'],
    ['/apple-touch-icon.png', 'image/png'],
  ]) {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain(contentType);
    expect((await response.body()).length).toBeGreaterThan(100);
  }
  await page.goto('/');
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
    'href',
    '/favicon.svg',
  );
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#354739');
  const product = products[0],
    category = categories[0],
    collection = collections[0];
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja'] as const) {
    await page.goto('/');
    await page.locator('.header select').selectOption(locale);
    await expect(page).toHaveTitle(/FLUIVIX — /);
    const homepageTitle = await page.title();
    const homepageDescription = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    await page.reload();
    await expect(page).toHaveTitle(homepageTitle);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      homepageDescription!,
    );
    for (const [route, label] of [
      ['/about', resources[locale].translation.about],
      ['/contact', resources[locale].translation.contact],
      ['/faq', resources[locale].translation.faq],
      ['/shop', resources[locale].translation.shop],
      [`/product/${product.slug}`, product.name[locale]],
      [`/category/${category.id}`, category.name[locale]],
      [`/collections/${collection.id}`, collection.name[locale]],
      ['/product/missing-demo-product', resources[locale].translation.notFound],
    ]) {
      await page.goto(route);
      await expect(page).toHaveTitle(`${label} | FLUIVIX`);
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute(
        'content',
        new RegExp('^' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      );
      const title = await page.title(),
        body = await description.getAttribute('content');
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
        'content',
        body!,
      );
      await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute(
        'content',
        body!,
      );
      expect(body!.length).toBeGreaterThan(30);
    }
    await page.goto('/contact');
    await page.locator('.contact-help a[href="/faq"]').click();
    await expect(page).toHaveTitle(`${resources[locale].translation.faq} | FLUIVIX`);
  }
});
