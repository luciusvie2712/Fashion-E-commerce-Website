import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { faq } from '../src/data/content';
import { faqCopy } from '../src/features/faq/content';

test('FAQ search and topics retain URL history and recover from empty results', async ({
  page,
}) => {
  await page.goto('/faq');
  await page.locator('.header select').selectOption('vi');
  const search = page.locator('.faq-search input');
  await search.fill('mat khau');
  await expect(page.locator('.faq-item')).toHaveCount(2);
  await expect(page.locator('#faq-question-4')).toHaveText(/Có lưu mật khẩu/);
  await expect(page.locator('#faq-question-7')).toBeVisible();
  await expect(page).toHaveURL(/q=mat\+khau/);
  await page.reload();
  await expect(search).toHaveValue('mat khau');
  await page.locator('.faq-search button').click();
  await expect(search).toBeFocused();
  await expect(page.locator('.faq-item')).toHaveCount(8);
  await page.getByRole('button', { name: faqCopy.shopping.vi, exact: true }).click();
  await expect(page.locator('.faq-item')).toHaveCount(2);
  await page.getByRole('button', { name: faqCopy.delivery.vi, exact: true }).click();
  await expect(page.locator('.faq-item')).toHaveCount(3);
  await page.goBack();
  await expect(
    page.getByRole('button', { name: faqCopy.shopping.vi, exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.faq-item')).toHaveCount(2);
  await page.goForward();
  await expect(page.locator('.faq-item')).toHaveCount(3);
  await search.fill('no-matching-faq-42');
  await expect(page.locator('.faq-empty')).toBeVisible();
  await page.locator('.faq-empty button').click();
  await expect(page.locator('.faq-item')).toHaveCount(8);
  await expect(search).toHaveValue('');
  await expect(page).toHaveURL(/\/faq$/);
});

test('FAQ translations, responsive answers and accessibility work in all locales', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/faq');
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja'] as const) {
    await page.locator('.header select').selectOption(locale);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (let id = 0; id < faq.length; id++) {
        const trigger = page.locator(`#faq-question-${id}`);
        await expect(trigger).toHaveText(
          new RegExp(faq[id][0][locale].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        );
        if ((await trigger.getAttribute('aria-expanded')) === 'false') await trigger.click();
        await expect(page.locator(`#faq-answer-${id} p`)).toHaveText(faq[id][1][locale]);
        await expect(page.locator(`#faq-answer-${id} a`)).toBeVisible();
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${locale} ${width}`,
      ).toBe(true);
      if (width === 390 || width === 1440) {
        const audit = await new AxeBuilder({ page })
          .include('.faq-page')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(
          audit.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
        ).toEqual([]);
      }
    }
  }
  await page.locator('.header select').selectOption('vi');
  await page.locator('#faq-question-0').click();
  for (const [name, width] of [
    ['desktop', 1440],
    ['mobile', 390],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => {
      scrollTo(0, 0);
      return document.fonts.ready;
    });
    await page.screenshot({ path: `.tmp/visual/faq-${name}.png`, fullPage: true });
  }
  await page.locator('.faq-help a').click();
  await expect(page).toHaveURL(/\/contact$/);
  await page.goto('/faq');
  await page.locator('#faq-question-1').click();
  await page.locator('#faq-answer-1 a').click();
  await expect(page).toHaveURL(/\/size-guide$/);
});

test('FAQ accordion motion reverses safely and respects keyboard and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/faq');
  await expect(page.locator('#faq-question-3')).toBeVisible();
  const button = page.locator('#faq-question-3'),
    panel = page.locator('#faq-answer-3');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect
    .poll(
      () =>
        panel.evaluate(
          (node) => node.getAnimations().filter((a) => a.playState === 'running').length,
        ),
      { intervals: [10, 20, 30] },
    )
    .toBeGreaterThan(0);
  await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toHaveAttribute('inert', '');
  await expect.poll(() => panel.evaluate((node) => node.getBoundingClientRect().height)).toBe(0);
  await expect(panel.getByRole('link')).toHaveCount(0);
  await button.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#faq-question-4')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#faq-question-7')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.locator('#faq-question-0')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#faq-question-7')).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await button.click();
  await expect(panel).toBeVisible();
  expect(await panel.evaluate((node) => getComputedStyle(node).transitionDuration)).toBe('0s');
  expect(await panel.evaluate((node) => node.getAnimations().length)).toBe(0);
  await button.click();
  await expect(panel).toBeHidden();
});
