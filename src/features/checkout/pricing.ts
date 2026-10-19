import type { Pricing, Shipping } from '../../types/domain';
export const coupons = [
  {
    code: 'FLUIVIX10',
    type: 'PERCENT',
    value: 10,
    min: 300000,
    cap: 100000,
    active: true,
    start: '2020-01-01',
    end: '2099-12-31',
  },
  {
    code: 'FREESHIP',
    type: 'SHIPPING',
    value: 0,
    min: 250000,
    cap: 0,
    active: true,
    start: '2020-01-01',
    end: '2099-12-31',
  },
  {
    code: 'WELCOME50',
    type: 'FIXED',
    value: 50000,
    min: 500000,
    cap: 50000,
    active: true,
    start: '2020-01-01',
    end: '2099-12-31',
  },
  {
    code: 'EXPIRED',
    type: 'FIXED',
    value: 50000,
    min: 0,
    cap: 50000,
    active: true,
    start: '2020-01-01',
    end: '2021-01-01',
  },
  {
    code: 'DISABLED',
    type: 'FIXED',
    value: 50000,
    min: 0,
    cap: 50000,
    active: false,
    start: '2020-01-01',
    end: '2099-12-31',
  },
  {
    code: 'PREMIUM',
    type: 'FIXED',
    value: 200000,
    min: 2000000,
    cap: 200000,
    active: true,
    start: '2020-01-01',
    end: '2099-12-31',
  },
];
export function applyCoupon(code: string, subtotal: number, shipping: Shipping, now = new Date()) {
  if (!code.trim()) return { discount: 0, free: false };
  const coupon = coupons.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return { discount: 0, free: false, error: 'couponUnknown' };
  if (!coupon.active) return { discount: 0, free: false, error: 'couponDisabled' };
  if (now < new Date(coupon.start) || now > new Date(coupon.end))
    return { discount: 0, free: false, error: 'couponExpired' };
  if (subtotal < coupon.min) return { discount: 0, free: false, error: 'couponMinimum' };
  if (coupon.type === 'SHIPPING' && shipping !== 'STANDARD')
    return { discount: 0, free: false, error: 'couponShipping' };
  return {
    discount: Math.min(
      subtotal,
      coupon.type === 'PERCENT'
        ? Math.min(Math.round((subtotal * coupon.value) / 100), coupon.cap)
        : coupon.type === 'FIXED'
          ? coupon.value
          : 0,
    ),
    free: coupon.type === 'SHIPPING',
  };
}
export const calculateShipping = (postDiscount: number, shipping: Shipping, free = false) =>
  shipping === 'EXPRESS' ? 49000 : free || postDiscount >= 599000 ? 0 : 30000;
export function calculateTotal(
  subtotalVnd: number,
  shipping: Shipping = 'STANDARD',
  code = '',
  now = new Date(),
): Pricing {
  if (!Number.isSafeInteger(subtotalVnd) || subtotalVnd < 0) throw new Error('invalid');
  const applied = applyCoupon(code, subtotalVnd, shipping, now);
  const discountVnd = applied.discount;
  const shippingFeeVnd = calculateShipping(subtotalVnd - discountVnd, shipping, applied.free);
  return {
    subtotalVnd,
    discountVnd,
    shippingFeeVnd,
    totalVnd: Math.max(0, subtotalVnd - discountVnd + shippingFeeVnd),
    ...(!applied.error && code ? { couponCode: code.trim().toUpperCase() } : {}),
    ...(applied.error ? { error: applied.error } : {}),
  };
}
