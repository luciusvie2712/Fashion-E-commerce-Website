import { describe, it, expect } from 'vitest';
import { products, validateCatalog, unitPrice } from '../data/catalog';
import { calculateTotal } from '../features/checkout/pricing';
import { mergeCartItems, updateCartVariant, consumePurchased } from '../features/cart/domain';
import { resources } from '../features/i18n/dictionaries';
import { locales } from '../types/domain';
import { normalizeVietnameseSearch, sanitizeInternalRedirect } from '../lib/urls';
import { hydrateSafe } from '../lib/storage';
import { z } from 'zod';
import { coupons } from '../features/checkout/pricing';
describe('pricing business examples', () => {
  it.each([
    [200000, 'STANDARD', '', 0, 30000, 230000],
    [400000, 'STANDARD', 'FLUIVIX10', 40000, 30000, 390000],
    [1200000, 'STANDARD', 'FLUIVIX10', 100000, 0, 1100000],
    [260000, 'STANDARD', 'FREESHIP', 0, 0, 260000],
    [260000, 'EXPRESS', 'FREESHIP', 0, 49000, 309000],
    [620000, 'STANDARD', 'FLUIVIX10', 62000, 30000, 588000],
    [599000, 'STANDARD', '', 0, 0, 599000],
    [598999, 'STANDARD', '', 0, 30000, 628999],
  ] as const)('subtotal %s / %s / %s', (subtotal, shipping, code, discount, fee, total) => {
    expect(calculateTotal(subtotal, shipping, code, new Date('2026-10-19'))).toMatchObject({
      discountVnd: discount,
      shippingFeeVnd: fee,
      totalVnd: total,
    });
  });
  it.each([
    ['EXPIRED', 'couponExpired'],
    ['DISABLED', 'couponDisabled'],
    ['BAD', 'couponUnknown'],
    ['PREMIUM', 'couponMinimum'],
  ])('rejects %s', (code, error) =>
    expect(calculateTotal(400000, 'STANDARD', code).error).toBe(error),
  );
});
it('catalog has 48 valid products and complete localized content', () => {
  expect(validateCatalog()).toBe(true);
  expect(products).toHaveLength(48);
  for (const p of products)
    for (const locale of locales)
      for (const field of [p.name, p.description, p.materials, p.care, p.keywords])
        expect(field[locale].length).toBeGreaterThan(1);
});
it('dictionary key and interpolation parity', () => {
  for (const locale of locales) {
    expect(Object.keys(resources[locale].translation)).toEqual(
      Object.keys(resources.vi.translation),
    );
    for (const [key, text] of Object.entries(resources[locale].translation)) {
      expect(text.trim()).not.toBe('');
      expect(text.match(/{{\w+}}/g) ?? []).toEqual(
        resources.vi.translation[key as keyof typeof resources.vi.translation].match(/{{\w+}}/g) ??
          [],
      );
    }
  }
});
it('merges variants and rejects overflow atomically', () => {
  const p = products[0],
    a = { productId: p.id, variantId: p.variants[0].id, quantity: 1 };
  const cart = mergeCartItems([a], a);
  expect(cart[0].quantity).toBe(2);
  expect(() => mergeCartItems(cart, { ...a, quantity: 100 })).toThrow();
  expect(cart[0].quantity).toBe(2);
  const b = { ...a, variantId: p.variants[1].id };
  expect(mergeCartItems([a], b)).toHaveLength(2);
  expect(updateCartVariant([a, b], b.variantId, a.variantId)[0].quantity).toBe(2);
  expect(consumePurchased([{ ...a, quantity: 3 }, b], [a])).toEqual([{ ...a, quantity: 2 }, b]);
});
it.each([0, -1, 0.5, 999])('rejects invalid quantity %s', (quantity) =>
  expect(() =>
    mergeCartItems([], {
      productId: products[0].id,
      variantId: products[0].variants[0].id,
      quantity,
    }),
  ).toThrow(),
);
it('normalizes Vietnamese and guards redirects', () => {
  expect(normalizeVietnameseSearch('ÁO ĐẸP')).toBe('ao dep');
  for (const path of ['https://evil.test', '//evil.test', '/\\evil.test', 'javascript:alert(1)'])
    expect(sanitizeInternalRedirect(path)).toBe('/account');
  expect(sanitizeInternalRedirect('/account/orders?q=1')).toBe('/account/orders?q=1');
});
it('corrupt persistence safely falls back', () => {
  expect(hydrateSafe('invalid', z.array(z.string()), [])).toEqual([]);
  expect(hydrateSafe('[1]', z.array(z.string()), [])).toEqual([]);
});
it('uses variant overrides and rounds percentage discounts to whole VND', () => {
  const p = products[3],
    v = p.variants.find((v) => v.priceOverrideVnd !== undefined)!;
  expect(unitPrice(p, v.id)).toBe(p.basePriceVnd + 20000);
  expect(calculateTotal(300005, 'STANDARD', 'FLUIVIX10').discountVnd).toBe(30001);
});
it('caps a fixed discount to merchandise even if its fixture exceeds the price', () => {
  const coupon = coupons.find((c) => c.code === 'WELCOME50')!,
    old = coupon.value;
  try {
    coupon.value = 1000000;
    expect(calculateTotal(500000, 'STANDARD', 'WELCOME50')).toMatchObject({
      discountVnd: 500000,
      totalVnd: 30000,
    });
  } finally {
    coupon.value = old;
  }
});
