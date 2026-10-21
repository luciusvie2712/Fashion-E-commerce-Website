import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`header hides down, returns up and remains keyboard reachable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const dock = page.locator('.header-dock');
    const bottom = () => dock.evaluate((node) => node.getBoundingClientRect().bottom);
    await expect(page.locator('body')).toHaveCSS('font-family', /Georgia/);
    await page.evaluate(() => scrollTo(0, 700));
    await expect.poll(bottom).toBeLessThanOrEqual(0);
    await page.evaluate(() => scrollTo(0, 640));
    await expect
      .poll(() => dock.evaluate((node) => node.getBoundingClientRect().top))
      .toBeCloseTo(0, 0);
    expect(
      await page.locator('.announcement').evaluate((node) => node.getBoundingClientRect().bottom),
    ).toBeLessThan(0);
    await page.evaluate(() => scrollTo(0, 643));
    await page.waitForTimeout(100);
    expect(await bottom()).toBeGreaterThan(50);
    await page.evaluate(() => scrollTo(0, 850));
    await expect.poll(bottom).toBeLessThanOrEqual(0);
    await dock
      .locator('.wordmark')
      .evaluate((node: HTMLElement) => node.focus({ preventScroll: true }));
    await expect.poll(bottom).toBeGreaterThan(50);
    await expect(dock.locator('.wordmark')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  });
}

test('scroll content fades out and back in, and dialog close completes', async ({ page }) => {
  await page.goto('/');
  await page.locator('.header select').selectOption('en');
  const category = page.locator('.category-grid > a').first();
  await category.scrollIntoViewIfNeeded();
  await expect(category).toHaveCSS('opacity', '1');
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect(category).toHaveCSS('opacity', '0');
  await category.scrollIntoViewIfNeeded();
  await expect(category).toHaveCSS('opacity', '1');
  await page.goto('/product/fluivix-tshirts-1');
  await page.locator('.favorite').first().click();
  await expect(page.locator('[data-sonner-toaster]')).toHaveCSS('font-family', /Georgia/);
  await page.getByRole('button', { name: 'Size guide', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS('animation-name', 'dialog-in');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('reduced motion stays visible and reacts to preference changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.scroll-reveal')).toHaveCount(0);
  await expect(page.locator('.header-dock')).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.scroll-reveal').first()).toBeAttached();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.scroll-reveal')).toHaveCount(0);
  await expect(page.locator('main h1')).toHaveCSS('opacity', '1');
});

test('interrupted reveals restore masks, image transforms and focused controls', async ({
  page,
}) => {
  await page.goto('/shop');
  const card = page.locator('.product-card').first();
  for (const y of [1400, 0, 1800, 50, 2200]) {
    await page.evaluate((position) => scrollTo(0, position), y);
    await page.waitForTimeout(80);
  }
  await card
    .locator('.product-name')
    .evaluate((node: HTMLElement) => node.focus({ preventScroll: true }));
  await expect(card).toHaveCSS('opacity', '1');
  await expect(card).toHaveCSS('clip-path', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.scroll-reveal')).toHaveCount(0);
  const styles = await page.locator('.product-image img').evaluateAll((images) =>
    images.map((image) => ({
      transform: (image as HTMLElement).style.transform,
      clip: (image as HTMLElement).style.clipPath,
    })),
  );
  expect(styles.every((style) => !style.transform && !style.clip)).toBe(true);
  await page.locator('.header .wordmark').click();
  await expect(page.locator('.hero-media > img')).toHaveCSS('opacity', '1');
  await expect(page.locator('.hero-media > img')).toHaveCSS('clip-path', 'none');
});
