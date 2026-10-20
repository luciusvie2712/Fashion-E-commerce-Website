import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { resources } from '../src/features/i18n/dictionaries';

test('compact forms fit desktop viewports and keep mobile submit controls visible', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/login');
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja'] as const) {
    await page.locator('.header select').selectOption(locale);
    for (const [width, height] of [
      [1366, 768],
      [1440, 900],
      [390, 844],
      [360, 800],
    ]) {
      await page.setViewportSize({ width, height });
      for (const route of ['/login', '/register', '/forgot-password']) {
        await page.goto(route);
        const card = page.locator('.auth-shell'),
          submit = card.locator('form > .button');
        await expect(submit).toBeVisible();
        const box = (await (width > 1000 ? card : submit).boundingBox())!;
        expect(box.y + box.height, `${locale} ${width}x${height} ${route}`).toBeLessThanOrEqual(
          height - 8,
        );
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        for (const input of await card.locator('input').all())
          expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
    }
  }
  await page.locator('.header select').selectOption('vi');
  await page.goto('/register');
  await page.locator('.auth-disclosure summary').click();
  await expect(page.locator('.auth-disclosure .demo-notice')).toBeVisible();
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.evaluate(() => {
    const identity = JSON.parse(localStorage.getItem('fluivix:v1:identity')!);
    identity.state.session = 'demo-user';
    localStorage.setItem('fluivix:v1:identity', JSON.stringify(identity));
  });
  for (const route of ['/account/profile', '/account/addresses', '/contact']) {
    await page.goto(route);
    if (route.endsWith('addresses'))
      await page
        .getByRole('button', { name: resources.vi.translation.addAddress, exact: true })
        .click();
    const form = page.locator('main form.field-grid');
    await expect(form).toBeVisible();
    const box = (await form.boundingBox())!;
    expect(box.y + box.height, route).toBeLessThanOrEqual(760);
  }
});

test('auth controls preserve values, clear passwords between modes and retain the intended destination', async ({
  page,
}) => {
  await page.goto('/login?redirect=%2Faccount%2Forders');
  await page.locator('.header select').selectOption('en');
  await page.getByRole('button', { name: 'Use sample email', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue(
    'demo@fluivix.local',
  );
  const password = page.getByLabel('Demo password', { exact: true });
  await expect(password).toBeFocused();
  await password.fill('sample-secret-42');
  await page.getByRole('button', { name: 'Show password · Demo password', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'text');
  await expect(password).toHaveValue('sample-secret-42');
  await page.getByRole('button', { name: 'Hide password · Demo password', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('link', { name: 'Create demo account', exact: true }).click();
  await expect(page).toHaveURL(/register\?redirect=%2Faccount%2Forders/);
  await expect(password).toHaveValue('');
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('textbox', { name: 'Full name', exact: true }).fill('Sample Person');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('auth-layout@example.local');
  await password.fill('registration-secret-42');
  const confirmation = page.getByLabel('Confirm password', { exact: true });
  await confirmation.fill('mismatch-secret');
  await page.getByRole('button', { name: 'Create demo account', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('confirmation must match');
  await expect(confirmation).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Show password · Confirm password', exact: true }).click();
  await expect(confirmation).toHaveAttribute('type', 'text');
  await expect(password).toHaveAttribute('type', 'password');
  await confirmation.fill('registration-secret-42');
  await page.getByRole('button', { name: 'Create demo account', exact: true }).click();
  await expect(page).toHaveURL(/\/account\/orders$/);
  const persisted = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  expect(persisted).not.toContain('registration-secret-42');
  expect(persisted).not.toContain('sample-secret-42');
});

test('auth layouts remain localized, readable and keyboard accessible at phone, tablet and desktop sizes', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/login');
  for (const locale of ['vi', 'en', 'ko', 'zh-CN', 'ja'] as const) {
    await page.locator('.header select').selectOption(locale);
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/login', '/register', '/forgot-password']) {
        await page.goto(route);
        await expect(page.locator('.auth-shell h1')).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale} ${width} ${route}`,
        ).toBe(true);
        if (route !== '/forgot-password') {
          const toggle = page.getByRole('button', {
            name: `${resources[locale].translation.showPassword} · ${resources[locale].translation.password}`,
            exact: true,
          });
          const box = (await toggle.boundingBox())!;
          await toggle.focus();
          await page.keyboard.press('Enter');
          await expect(page.locator('#auth-password')).toHaveAttribute('type', 'text');
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
        if ((locale === 'vi' && width === 360) || (locale === 'en' && width === 1280)) {
          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          expect(
            results.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
            `${locale} ${width} ${route}`,
          ).toEqual([]);
          await page.screenshot({
            path: `.tmp/visual/auth-${locale}-${width}-${route.slice(1)}.png`,
            fullPage: true,
          });
        }
      }
    }
  }
});
