import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { contactCopy } from '../src/features/contact/content';
import { resources } from '../src/features/i18n/dictionaries';

const locales = ['vi', 'en', 'ko', 'zh-CN', 'ja'] as const;

test('contact form validates, translates and submits only in memory', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:')) external.push(request.url());
  });
  await page.goto('/contact');
  for (const locale of locales) {
    await page.locator('.header select').selectOption(locale);
    const form = page.locator('.contact-form');
    await form.getByRole('button').click();
    await expect(form.getByRole('alert')).toHaveText(resources[locale].translation.invalid);
    await expect(page.locator('#contact-name')).toBeFocused();
    await expect(page.locator('#contact-name-error')).toHaveText(contactCopy.nameError[locale]);
    await page.locator('#contact-name').fill('  ');
    await page.locator('#contact-email').fill('not-an-email');
    await page.locator('#contact-message').fill('short');
    await form.getByRole('button').click();
    await expect(page.locator('#contact-email-error')).toHaveText(
      resources[locale].translation.emailError,
    );
    await expect(page.locator('#contact-message-error')).toHaveText(
      contactCopy.messageError[locale],
    );
    await page.locator('#contact-name').fill('Sample Visitor');
    await page.locator('#contact-email').fill(' sample-contact@example.test ');
    await page.locator('#contact-message').fill('Sample message contact-private-marker-42');
    await form.getByRole('button').click();
    await expect(form.getByRole('status')).toHaveText(contactCopy.success[locale]);
    await expect(form.getByRole('alert')).toHaveCount(0);
    await expect(page.locator('#contact-message')).toHaveValue('');
    const stored = await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    );
    expect(stored).not.toContain('contact-private-marker-42');
    expect(stored).not.toContain('sample-contact@example.test');
    await form.getByRole('button').click();
    await expect(form.getByRole('alert')).toBeVisible();
    await expect(form.getByRole('status')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('#contact-name')).toHaveValue('');
    await expect(form.getByRole('status')).toHaveCount(0);
  }
  expect(external).toEqual([]);
});

test('contact layout and help links work across languages and viewports', async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/contact');
  for (const locale of locales) {
    await page.locator('.header select').selectOption(locale);
    for (const width of [320, 390, 768, 1366, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator('h1')).toHaveText(contactCopy.heading[locale]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${locale} ${width}`,
      ).toBe(true);
      for (const input of await page.locator('.contact-form input').all())
        expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      if (width === 390 || width === 1440) {
        const audit = await new AxeBuilder({ page })
          .include('.contact-page')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(
          audit.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
        ).toEqual([]);
      }
    }
  }
  await page.locator('.header select').selectOption('vi');
  for (const [name, width] of [
    ['desktop', 1440],
    ['mobile', 390],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `.tmp/visual/contact-${name}.png`, fullPage: true });
  }
  for (const route of ['/faq', '/size-guide', '/track-order']) {
    await page.locator(`.contact-help a[href="${route}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await page.goto('/contact');
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('.contact-studio a').click();
  await expect(page).toHaveURL(/\/about$/);
});
