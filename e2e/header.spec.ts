import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('header utilities stay separate and usable across all languages and breakpoints', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/shop');
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja']) {
    await page.locator('.header select').selectOption(locale);
    for (const width of [360, 390, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const geometry = await page.locator('.header').evaluate((header) => {
        const boxes = [...header.children]
          .filter((node) => getComputedStyle(node).display !== 'none')
          .map((node) => node.getBoundingClientRect())
          .filter((box) => box.width && box.height);
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          overlaps: boxes.some((a, i) =>
            boxes
              .slice(i + 1)
              .some(
                (b) =>
                  Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
                  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1,
              ),
          ),
        };
      });
      expect(geometry, `${locale} ${width}`).toEqual({ overflow: false, overlaps: false });
      await expect(page.locator('.header select')).toHaveCount(1);
      for (const action of await page
        .locator('.header-actions > a, .header-actions > button')
        .all()) {
        if (!(await action.isVisible())) continue;
        const box = (await action.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  }
});

test('navigation drawer supports keyboard focus, language changes and route selection', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/shop');
  await page.locator('.header select').selectOption('en');
  const trigger = page.getByRole('button', { name: 'Menu', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Shop', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect
    .poll(() =>
      drawer.evaluate(
        (node) => node.getAnimations().filter((a) => a.playState === 'running').length,
      ),
    )
    .toBe(0);
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
  await page.screenshot({ path: '.tmp/visual/navbar-drawer.png' });
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await drawer.locator('select').selectOption('vi');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await drawer.locator('a[href="/sale"]').click();
  await expect(page).toHaveURL(/\/sale$/);
  await expect(drawer).toHaveCount(0);
  await page.locator('.header select').selectOption('en');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('textbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.desktop-nav a.active')).toHaveAttribute('href', '/sale');
  await page.screenshot({ path: '.tmp/visual/navbar-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '.tmp/visual/navbar-mobile.png' });
});
