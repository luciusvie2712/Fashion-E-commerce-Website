import { seedOrders } from '../../data/fixtures';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { persistOptions, addressSchema, lineSchema, localizedSchema } from '../../lib/persist';
import type {
  Order,
  Intent,
  Address,
  Pricing,
  Shipping,
  Payment,
  Fulfillment,
  ReturnStatus,
} from '../../types/domain';
import { createOrderSnapshot, transitionOrder } from './domain';
import { useCart } from '../cart/store';
const orderSchema = z.object({
  id: z.string(),
  intentId: z.string(),
  ownerId: z.string(),
  ownerType: z.enum(['GUEST', 'USER']),
  items: z.array(
    lineSchema.extend({
      nameAtPurchase: localizedSchema,
      colorNameAtPurchase: localizedSchema,
      sku: z.string(),
      size: z.string(),
      imageUrl: z.string(),
      unitPriceVnd: z.number().int().nonnegative(),
    }),
  ),
  addressSnapshot: addressSchema,
  pricingSnapshot: z.object({
    subtotalVnd: z.number().int().nonnegative(),
    discountVnd: z.number().int().nonnegative(),
    shippingFeeVnd: z.number().int().nonnegative(),
    totalVnd: z.number().int().nonnegative(),
    couponCode: z.string().optional(),
  }),
  shippingMethod: z.enum(['STANDARD', 'EXPRESS']),
  paymentMethod: z.enum(['COD', 'ONLINE_DEMO']),
  paymentStatus: z.enum(['UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED']),
  fulfillmentStatus: z.enum([
    'AWAITING_PAYMENT',
    'PENDING_CONFIRMATION',
    'CONFIRMED',
    'PREPARING',
    'SHIPPING',
    'DELIVERED',
    'DELIVERY_FAILED',
    'CANCELLED',
  ]),
  returnStatus: z.enum(['NONE', 'REQUESTED', 'REVIEWING', 'APPROVED', 'REJECTED', 'REFUNDED']),
  timeline: z.array(z.object({ status: z.string(), at: z.string() })),
  createdAt: z.string(),
  deliveredAt: z.string().optional(),
  source: z.enum(['CART', 'BUY_NOW']),
  consumed: z.boolean(),
});
interface State {
  orders: Order[];
  place: (
    intent: Intent,
    address: Address,
    pricing: Pricing,
    shipping: Shipping,
    payment: Payment,
    guest: string,
  ) => Order;
  pay: (owner: string, id: string, outcome: 'success' | 'failure' | 'cancel' | 'retry') => void;
  transition: (owner: string, id: string, status: Fulfillment | ReturnStatus) => void;
}
function consume(order: Order) {
  if (!order.consumed) {
    if (order.source === 'CART') useCart.getState().consume(order.ownerId, order.items);
    else useCart.setState({ intent: null });
  }
  return { ...order, consumed: true };
}
export const useOrders = create<State>()(
  persist(
    (set, get) => ({
      orders: seedOrders(),
      place: (intent, address, pricing, shipping, payment, guest) => {
        const existing = get().orders.find(
          (o) => o.intentId === intent.id && o.ownerId === intent.ownerId,
        );
        if (existing) return existing;
        let order = createOrderSnapshot(intent, address, pricing, shipping, payment, guest);
        if (payment === 'COD') order = consume(order);
        set((s) => ({ orders: [order, ...s.orders] }));
        if (payment === 'ONLINE_DEMO') useCart.getState().linkOrder(order.id);
        return order;
      },
      pay: (owner, id, outcome) => {
        const order = get().orders.find((o) => o.id === id && o.ownerId === owner);
        if (
          !order ||
          order.fulfillmentStatus !== 'AWAITING_PAYMENT' ||
          order.paymentMethod !== 'ONLINE_DEMO'
        )
          return;
        let next: Order = {
          ...order,
          paymentStatus:
            outcome === 'success' ? 'PAID' : outcome === 'retry' ? 'PENDING' : 'FAILED',
          fulfillmentStatus: outcome === 'success' ? 'PENDING_CONFIRMATION' : 'AWAITING_PAYMENT',
          timeline: [
            ...order.timeline,
            {
              status: outcome === 'success' ? 'PAID' : outcome === 'retry' ? 'PENDING' : 'FAILED',
              at: new Date().toISOString(),
            },
          ],
        };
        if (outcome === 'success') next = consume(next);
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? next : o)) }));
      },
      transition: (owner, id, status) => {
        const order = get().orders.find((o) => o.id === id && o.ownerId === owner);
        if (!order) throw new Error('notFound');
        const next = transitionOrder(order, status);
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? next : o)) }));
      },
    }),
    persistOptions('orders', z.object({ orders: z.array(orderSchema) }), (s) => ({
      orders: s.orders,
    })),
  ),
);
