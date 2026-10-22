import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`deployment deep links, refresh and local resources at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    const failedResources: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`);
    });
    page.on('requestfailed', (request) => {
      // Navigation can legitimately cancel a lazy image that has left the page.
      if (!request.failure()?.errorText.includes('ERR_ABORTED'))
        failedResources.push(`${request.failure()?.errorText} ${request.url()}`);
    });

    await page.goto('/login');
    await page.locator('.header select').selectOption('en');
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('demo@fluivix.local');
    await page.getByLabel('Demo password', { exact: true }).fill('samplepass8');
    await page.getByRole('button', { name: 'Demo sign in' }).click();
    await expect(page).toHaveURL(/\/account$/);

    // Populate a cart through the UI so direct checkout loads a usable checkout intent.
    await page.goto('/product/fluivix-tshirts-1');
    await page.getByRole('button', { name: 'Ink', exact: true }).click();
    await page.getByRole('button', { name: 'M', exact: true }).click();
    await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
    await page.goto('/cart');
    await page.getByRole('button', { name: /^Checkout/ }).click();
    await expect(page).toHaveURL(/\/checkout$/);

    for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja']) {
      await page.locator('.header select').selectOption(locale);
      for (const route of ['/product/fluivix-tshirts-1', '/cart', '/checkout', '/account/orders']) {
        const response = await page.goto(route);
        expect(response?.status(), route).toBe(200);
        await expect(page).toHaveURL(new RegExp(`${route}$`));
        await expect(page.locator('main h1').first()).toBeVisible();
        const heading = await page.locator('main h1').first().textContent();
        const reload = await page.reload();
        expect(reload?.status(), route).toBe(200);
        await expect(page).toHaveURL(new RegExp(`${route}$`));
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('main h1').first()).toHaveText(heading!);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        if (route.startsWith('/product/')) {
          await expect(page.locator('.gallery-main img')).toBeVisible();
          await expect
            .poll(() =>
              page
                .locator('.gallery-main img')
                .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
            )
            .toBe(true);
          await page.evaluate(() => document.fonts.ready);
          if (locale === 'vi')
            expect(await page.evaluate(() => document.fonts.check('16px Gelasio'))).toBe(true);
        }
      }
    }
    expect(errors).toEqual([]);
    expect(failedResources).toEqual([]);
  });
}
