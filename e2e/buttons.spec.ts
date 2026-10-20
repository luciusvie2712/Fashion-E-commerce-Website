import { test, expect, type Locator } from '@playwright/test';

async function contrast(button: Locator) {
  return button.evaluate((node) => {
    const rgb = (color: string) => (color.match(/[\d.]+/g) ?? []).map(Number);
    const fg = rgb(getComputedStyle(node).color);
    let parent: Element | null = node;
    let bg = [248, 247, 244];
    while (parent) {
      const color = rgb(getComputedStyle(parent).backgroundColor);
      if (color.length >= 3 && (color[3] ?? 1) === 1) {
        bg = color;
        break;
      }
      parent = parent.parentElement;
    }
    const luminance = (color: number[]) =>
      color
        .slice(0, 3)
        .map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        })
        .reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
    const a = luminance(fg),
      b = luminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

test('primary, light, secondary and quick-view buttons keep readable hover and focus states', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.header select').selectOption('en');
  for (const [route, selector] of [
    ['/', '.hero .button.light'],
    ['/login', 'form .button'],
    ['/product/fluivix-tshirts-1', '.purchase > .button.secondary'],
    ['/shop', '.quick-view'],
  ]) {
    await page.goto(route);
    const button = page.locator(selector).first();
    if (selector === '.quick-view') await page.locator('.product-card').first().hover();
    await button.hover();
    for (const delay of [0, 60, 60, 140]) {
      await page.waitForTimeout(delay);
      expect(await contrast(button), `${route} ${selector} during hover`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
    await button.evaluate((node: HTMLElement) => node.focus());
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS('outline-style', 'solid');
    await expect(button).toHaveCSS('outline-width', '2px');
    expect(await button.evaluate((node) => getComputedStyle(node).boxShadow)).not.toBe('none');
  }
  await page.getByRole('button', { name: 'Quick view', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('chips, icons and disabled buttons stay distinct and reduced motion removes hover movement', async ({
  page,
}) => {
  await page.goto('/product/fluivix-tshirts-1');
  await page.locator('.header select').selectOption('en');
  const chip = page.getByRole('button', { name: 'Ink', exact: true });
  await chip.click();
  await chip.hover();
  await page.waitForTimeout(220);
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  expect(await contrast(chip)).toBeGreaterThanOrEqual(4.5);
  const favorite = page.locator('.purchase .favorite');
  await favorite.click();
  await favorite.hover();
  await page.waitForTimeout(220);
  await expect(favorite).toHaveAttribute('aria-pressed', 'true');
  expect(await contrast(favorite)).toBeGreaterThanOrEqual(4.5);
  await page.goto('/product/fluivix-accessories-8');
  const disabled = page.getByRole('button', { name: 'Add to bag', exact: true });
  await expect(disabled).toBeDisabled();
  const background = await disabled.evaluate((node) => getComputedStyle(node).backgroundColor);
  await disabled.hover({ force: true });
  await expect(disabled).toHaveCSS('background-color', background);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const cta = page.locator('.hero .button');
  await cta.hover();
  await expect(cta).toHaveCSS('translate', 'none');
  await expect(cta).toHaveCSS('transition-duration', '0s');
});
