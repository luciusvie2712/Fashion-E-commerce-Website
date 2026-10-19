import { products } from './catalog';
import { createOrderSnapshot } from '../features/orders/domain';
import { calculateTotal } from '../features/checkout/pricing';
import type { Order, Fulfillment } from '../types/domain';
export function seedOrders(): Order[] {
  return (
    [
      'PENDING_CONFIRMATION',
      'CONFIRMED',
      'SHIPPING',
      'DELIVERED',
      'CANCELLED',
      'AWAITING_PAYMENT',
    ] as Fulfillment[]
  ).map((status, i) => {
    const product = products[i],
      variant = product.variants.find((v) => v.stock > 0)!;
    const date = new Date('2026-10-19T02:00:00Z');
    const order = createOrderSnapshot(
      {
        id: `seed-intent-${i}`,
        ownerId: 'demo-user',
        source: 'BUY_NOW',
        items: [{ productId: product.id, variantId: variant.id, quantity: 1 }],
      },
      {
        id: `seed-address-${i}`,
        ownerId: 'demo-user',
        recipient: 'Demo',
        phone: '0900000000',
        province: 'Hà Nội',
        district: 'Demo',
        street: 'Demo 01',
        isDefault: false,
      },
      calculateTotal(product.basePriceVnd),
      'STANDARD',
      i === 5 ? 'ONLINE_DEMO' : 'COD',
      'seed-guest',
      date,
    );
    return {
      ...order,
      id: `FLX-DEMO-${i + 1}`,
      fulfillmentStatus: status,
      paymentStatus: i === 5 ? 'FAILED' : status === 'DELIVERED' ? 'PAID' : 'UNPAID',
      consumed: i !== 5,
      ...(status === 'DELIVERED' ? { deliveredAt: date.toISOString() } : {}),
      timeline: [
        { status: 'PENDING_CONFIRMATION', at: date.toISOString() },
        ...(status !== 'PENDING_CONFIRMATION' ? [{ status, at: date.toISOString() }] : []),
      ],
    };
  });
}
