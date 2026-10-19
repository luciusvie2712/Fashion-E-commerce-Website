import { beforeEach, it, expect } from 'vitest';
import { useOrders } from '../features/orders/store';
import { useCart } from '../features/cart/store';
import { createOrderSnapshot, transitionOrder, canRequestReturn } from '../features/orders/domain';
import { products } from '../data/catalog';
import { calculateTotal } from '../features/checkout/pricing';
import type { Intent, Address } from '../types/domain';
const line = { productId: products[0].id, variantId: products[0].variants[0].id, quantity: 1 };
const intent: Intent = { id: 'test-intent', ownerId: 'test-guest', source: 'CART', items: [line] };
const address: Address = {
  id: 'address',
  ownerId: 'test-guest',
  recipient: 'Sample',
  phone: '0900000000',
  province: 'Sample',
  district: 'Sample',
  street: 'Sample street',
  isDefault: false,
};
beforeEach(() => {
  useOrders.setState({ orders: [] });
  useCart.setState({ carts: { 'test-guest': [{ ...line, quantity: 3 }] }, intent });
});
it('COD idempotently snapshots and consumes only purchased quantities', () => {
  const store = useOrders.getState();
  const a = store.place(intent, address, calculateTotal(199000), 'STANDARD', 'COD', 'test-guest');
  const b = store.place(intent, address, calculateTotal(199000), 'STANDARD', 'COD', 'test-guest');
  expect(a.id).toBe(b.id);
  expect(useOrders.getState().orders).toHaveLength(1);
  expect(a.paymentStatus).toBe('UNPAID');
  expect(useCart.getState().carts['test-guest'][0].quantity).toBe(2);
});
it('online failure, retry and repeated success keep one order and consume once', () => {
  const store = useOrders.getState();
  const o = store.place(
    intent,
    address,
    calculateTotal(199000),
    'STANDARD',
    'ONLINE_DEMO',
    'test-guest',
  );
  store.pay('test-guest', o.id, 'failure');
  expect(useCart.getState().carts['test-guest'][0].quantity).toBe(3);
  store.pay('test-guest', o.id, 'retry');
  store.pay('test-guest', o.id, 'success');
  store.pay('test-guest', o.id, 'success');
  expect(useOrders.getState().orders).toHaveLength(1);
  expect(useOrders.getState().orders[0].paymentStatus).toBe('PAID');
  expect(useCart.getState().carts['test-guest'][0].quantity).toBe(2);
});
it('buy now success never consumes regular cart', () => {
  const store = useOrders.getState();
  store.place(
    { ...intent, source: 'BUY_NOW' },
    address,
    calculateTotal(199000),
    'STANDARD',
    'COD',
    'test-guest',
  );
  expect(useCart.getState().carts['test-guest'][0].quantity).toBe(3);
});
it('snapshots remain independent of mutable catalog and address values', () => {
  const o = createOrderSnapshot(
    intent,
    address,
    calculateTotal(199000),
    'STANDARD',
    'COD',
    'test-guest',
  );
  const name = products[0].name.en;
  products[0].name.en = 'Changed';
  expect(o.items[0].nameAtPurchase.en).toBe(name);
  products[0].name.en = name;
  expect(o.addressSnapshot).not.toBe(address);
  expect(o.items[0].unitPriceVnd).toBe(199000);
});
it('validates fulfillment, return and time-window transitions', () => {
  const date = new Date('2026-10-19');
  let o = createOrderSnapshot(
    intent,
    address,
    calculateTotal(199000),
    'STANDARD',
    'COD',
    'test-guest',
    date,
  );
  expect(() => transitionOrder(o, 'SHIPPING')).toThrow();
  for (const s of ['CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED'] as const)
    o = transitionOrder(o, s, date);
  expect(() => transitionOrder(o, 'CANCELLED')).toThrow();
  expect(canRequestReturn(o, new Date('2026-10-26'))).toBe(true);
  expect(canRequestReturn(o, new Date('2026-10-27'))).toBe(false);
  for (const s of ['REQUESTED', 'REVIEWING', 'APPROVED', 'REFUNDED'] as const)
    o = transitionOrder(o, s, date);
  expect(o.paymentStatus).toBe('REFUNDED');
});
it('unowned payment does not mutate another identity order', () => {
  const s = useOrders.getState();
  const o = s.place(
    intent,
    address,
    calculateTotal(199000),
    'STANDARD',
    'ONLINE_DEMO',
    'test-guest',
  );
  s.pay('other', o.id, 'success');
  expect(useOrders.getState().orders[0].paymentStatus).toBe('PENDING');
});
