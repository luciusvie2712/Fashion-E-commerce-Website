import { test, expect } from '@playwright/test';

test('Vietnamese letters and combining accents render in one bundled font', async ({
  page,
  context,
}) => {
  const requestedFonts: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'font') requestedFonts.push(request.url());
  });
  await page.goto('/');
  const sample = await page.evaluate(async () => {
    const vowels = 'aăâeêioôơuưyAĂÂEÊIOÔƠUƯY';
    const tones = ['', '\u0300', '\u0301', '\u0303', '\u0309', '\u0323'];
    const text =
      [...vowels]
        .flatMap((vowel) => tones.map((tone) => (vowel + tone).normalize('NFC')))
        .join(' ') + ' đ Đ';
    for (const [id, style] of [
      ['regular', '400'],
      ['bold', '700'],
      ['italic', 'italic 400'],
    ]) {
      await document.fonts.load(`${style} 32px Gelasio`, text);
      const probe = document.createElement('span');
      probe.id = `font-probe-${id}`;
      probe.textContent = text;
      probe.style.cssText = `display:inline-block;white-space:nowrap;font:${style} 32px Gelasio;position:fixed;left:0;top:0`;
      document.body.append(probe);
    }
    const probe = document.getElementById('font-probe-regular')!;
    const nfc = probe.getBoundingClientRect().width;
    probe.textContent = text.normalize('NFD');
    const nfd = probe.getBoundingClientRect().width;
    return { nfc, nfd };
  });
  expect(Math.abs(sample.nfc - sample.nfd)).toBeLessThan(1);
  const client = await context.newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  const { root } = await client.send('DOM.getDocument');
  for (const face of ['regular', 'bold', 'italic']) {
    const { nodeId } = await client.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: `#font-probe-${face}`,
    });
    const { fonts } = await client.send('CSS.getPlatformFontsForNode', { nodeId });
    expect(fonts.length).toBeGreaterThan(0);
    for (const font of fonts) {
      expect(font.familyName).toBe('Gelasio');
      expect(font.isCustomFont).toBe(true);
    }
  }
  expect(requestedFonts.some((url) => url.endsWith('/fonts/Gelasio-Variable.ttf'))).toBe(true);
  expect(requestedFonts.some((url) => url.endsWith('/fonts/Gelasio-Italic-Variable.ttf'))).toBe(
    true,
  );
  for (const url of requestedFonts) expect(new URL(url).origin).toBe(new URL(page.url()).origin);
});

test('Vietnamese controls and notifications use the same face and Georgia remains for English', async ({
  page,
}) => {
  await page.goto('/login');
  await expect(page.locator('body')).toHaveCSS('font-family', /^Gelasio/);
  await expect(page.locator('input[type="email"]')).toHaveCSS('font-family', /^Gelasio/);
  await page.goto('/shop');
  await page.locator('.favorite').first().click();
  await expect(page.locator('[data-sonner-toaster]')).toHaveCSS('font-family', /^Gelasio/);
  await page.locator('.header select').selectOption('en');
  await expect(page.locator('body')).toHaveCSS('font-family', /^Georgia/);
  await page.locator('.header select').selectOption('vi');
  await expect(page.locator('body')).toHaveCSS('font-family', /^Gelasio/);
});
