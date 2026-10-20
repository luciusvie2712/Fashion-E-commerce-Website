import { findProduct, colors, findVariant, unitPrice, variantImage } from '../../data/catalog';
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
import { validLine } from '../cart/domain';
export const flow: Record<Fulfillment, Fulfillment[]> = {
  AWAITING_PAYMENT: [],
  PENDING_CONFIRMATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['DELIVERED', 'DELIVERY_FAILED'],
  DELIVERED: [],
  DELIVERY_FAILED: ['SHIPPING', 'CANCELLED'],
  CANCELLED: [],
};
export const returnFlow: Record<ReturnStatus, ReturnStatus[]> = {
  NONE: ['REQUESTED'],
  REQUESTED: ['REVIEWING'],
  REVIEWING: ['APPROVED', 'REJECTED'],
  APPROVED: ['REFUNDED'],
  REJECTED: [],
  REFUNDED: [],
};
export const canTransitionFulfillment = (from: Fulfillment, to: Fulfillment) =>
  flow[from].includes(to);
export const canTransitionReturn = (from: ReturnStatus, to: ReturnStatus) =>
  returnFlow[from].includes(to);
export const canRequestReturn = (order: Order, now = new Date()) =>
  order.fulfillmentStatus === 'DELIVERED' &&
  !!order.deliveredAt &&
  now.getTime() - new Date(order.deliveredAt).getTime() <= 7 * 86400000 &&
  now.getTime() >= new Date(order.deliveredAt).getTime();
export function createOrderSnapshot(
  intent: Intent,
  address: Address,
  pricing: Pricing,
  shipping: Shipping,
  payment: Payment,
  guestId: string,
  now = new Date(),
): Order {
  if (!intent.items.length || !intent.items.every(validLine) || pricing.error)
    throw new Error('unavailable');
  const status = payment === 'COD' ? 'PENDING_CONFIRMATION' : 'AWAITING_PAYMENT';
  return {
    id: `FLX-${crypto.randomUUID().slice(0, 12).toUpperCase()}`,
    intentId: intent.id,
    ownerId: intent.ownerId,
    ownerType: intent.ownerId === guestId ? 'GUEST' : 'USER',
    items: intent.items.map((line) => {
      const p = findProduct(line.productId)!,
        v = findVariant(line.variantId)!;
      return {
        ...line,
        nameAtPurchase: structuredClone(p.name),
        colorNameAtPurchase: structuredClone(colors.find((c) => c.id === v.colorId)!.name),
        sku: v.sku,
        size: v.size,
        imageUrl: variantImage(p, v.id),
        unitPriceVnd: unitPrice(p, v.id),
      };
    }),
    addressSnapshot: structuredClone(address),
    pricingSnapshot: structuredClone(pricing),
    shippingMethod: shipping,
    paymentMethod: payment,
    paymentStatus: payment === 'COD' ? 'UNPAID' : 'PENDING',
    fulfillmentStatus: status,
    returnStatus: 'NONE',
    timeline: [{ status, at: now.toISOString() }],
    createdAt: now.toISOString(),
    source: intent.source,
    consumed: false,
  };
}
export function transitionOrder(
  order: Order,
  status: Fulfillment | ReturnStatus,
  now = new Date(),
): Order {
  const at = now.toISOString();
  if (status in flow && canTransitionFulfillment(order.fulfillmentStatus, status as Fulfillment))
    return {
      ...order,
      fulfillmentStatus: status as Fulfillment,
      ...(status === 'DELIVERED'
        ? {
            deliveredAt: at,
            paymentStatus: order.paymentMethod === 'COD' ? ('PAID' as const) : order.paymentStatus,
          }
        : {}),
      timeline: [...order.timeline, { status, at }],
    };
  if (
    status in returnFlow &&
    canTransitionReturn(order.returnStatus, status as ReturnStatus) &&
    (status !== 'REQUESTED' || canRequestReturn(order, now))
  )
    return {
      ...order,
      returnStatus: status as ReturnStatus,
      ...(status === 'REFUNDED' && order.paymentStatus === 'PAID'
        ? { paymentStatus: 'REFUNDED' as const }
        : {}),
      timeline: [...order.timeline, { status, at }],
    };
  throw new Error('transitionError');
}
