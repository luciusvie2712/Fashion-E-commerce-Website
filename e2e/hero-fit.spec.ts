import { test, expect } from '@playwright/test';

test('wide hero fills desktop without side bands and preserves responsive copy', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const [width, height] of [
    [320, 640],
    [360, 640],
    [375, 812],
    [390, 844],
    [430, 932],
    [700, 1000],
    [768, 900],
    [844, 390],
    [1024, 768],
    [1440, 900],
    [1920, 1080],
    [2560, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja']) {
      await page.locator('.header select').selectOption(locale);
      const image = page.locator('.hero-media img');
      await expect
        .poll(() =>
          image.evaluate(async (node: HTMLImageElement) => {
            try {
              await node.decode();
              return true;
            } catch {
              return false;
            }
          }),
        )
        .toBe(true);
      await expect
        .poll(() =>
          page.locator('.hero').evaluate((hero) => {
            const photo = hero.querySelector('img')!;
            const h = hero.getBoundingClientRect(),
              i = photo.getBoundingClientRect(),
              c = hero.querySelector('.hero-copy')!.getBoundingClientRect();
            const scale = Math.max(i.width / photo.naturalWidth, i.height / photo.naturalHeight);
            const portraitPhone = innerWidth <= 700 && innerHeight >= innerWidth;
            return {
              viewportFit: portraitPhone || Math.abs(h.bottom - innerHeight) < 2,
              compactPortrait:
                !portraitPhone ||
                (Math.abs(i.top - h.top) < 1 &&
                  Math.abs(i.height - (i.width * 5) / 8) < 1 &&
                  Math.abs(c.top - i.bottom) < 1 &&
                  Math.abs(c.bottom - h.bottom) < 1 &&
                  getComputedStyle(photo).objectFit === 'cover' &&
                  parseFloat(getComputedStyle(hero.querySelector('.hero-copy')!).paddingBottom) <=
                    28),
              copyFits: c.top >= h.top - 1 && c.bottom <= h.bottom + 1,
              noPageOverflow: document.documentElement.scrollWidth <= innerWidth,
              photoFits: i.top >= h.top - 1 && i.bottom <= h.bottom + 1 && i.height >= 80,
              filled:
                innerWidth <= 900 ||
                (getComputedStyle(photo).objectFit === 'cover' &&
                  Math.abs(i.left - h.left) < 1 &&
                  Math.abs(i.right - h.right) < 1 &&
                  photo.naturalWidth * scale >= h.width - 1 &&
                  photo.naturalHeight * scale >= h.height - 1),
            };
          }),
        )
        .toEqual({
          viewportFit: true,
          compactPortrait: true,
          copyFits: true,
          noPageOverflow: true,
          photoFits: true,
          filled: true,
        });
      const source = await image.evaluate((node: HTMLImageElement) => node.currentSrc);
      expect(source).toContain(width > 900 ? '/campaign-hero-wide.webp' : '/campaign-hero.webp');
    }
    await page.locator('.header select').selectOption('vi');
    if ([320, 390, 430, 700, 1440, 1920, 2560].includes(width))
      await page.screenshot({ path: `.tmp/visual/hero-wide-${width}.png` });
  }
  await page.locator('.hero-copy a').click();
  await expect(page).toHaveURL(/\/collections\/everyday$/);
});

test('compact phone hero action scrolls clear of the bottom navigation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const action = page.locator('.hero-copy a');
  await action.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await expect
    .poll(async () => {
      const button = (await action.boundingBox())!;
      const nav = (await page.locator('.mobile-bottom-nav').boundingBox())!;
      return button.y >= 0 && button.y + button.height <= nav.y;
    })
    .toBe(true);
  await action.click();
  await expect(page).toHaveURL(/\/collections\/everyday$/);
});
