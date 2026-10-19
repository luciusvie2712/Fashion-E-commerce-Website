import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { persistOptions, lineSchema } from '../../lib/persist';
import {
  consumePurchased,
  mergeCartItems,
  updateCartVariant,
  validLine,
  getStockForVariant,
} from './domain';
import type { CartLine, Intent } from '../../types/domain';
const schema = z.object({
  carts: z.record(z.string(), z.array(lineSchema)),
  intent: z
    .object({
      id: z.string(),
      ownerId: z.string(),
      source: z.enum(['CART', 'BUY_NOW']),
      items: z.array(lineSchema),
      orderId: z.string().optional(),
    })
    .nullable(),
});
interface State {
  carts: Record<string, CartLine[]>;
  intent: Intent | null;
  add: (owner: string, line: CartLine) => void;
  setQty: (owner: string, id: string, quantity: number) => void;
  remove: (owner: string, id?: string) => void;
  changeVariant: (owner: string, oldId: string, newId: string) => void;
  mergeGuest: (guest: string, user: string) => void;
  start: (owner: string, source: Intent['source'], items?: CartLine[]) => Intent;
  linkOrder: (id: string) => void;
  consume: (owner: string, items: CartLine[]) => void;
}
export const useCart = create<State>()(
  persist(
    (set, get) => ({
      carts: {},
      intent: null,
      add: (owner, line) =>
        set((s) => ({
          carts: { ...s.carts, [owner]: mergeCartItems(s.carts[owner] ?? [], line) },
        })),
      setQty: (owner, id, quantity) => {
        const line = get().carts[owner]?.find((l) => l.variantId === id);
        if (!line || !validLine({ ...line, quantity })) throw new Error('stockError');
        set((s) => ({
          carts: {
            ...s.carts,
            [owner]: s.carts[owner].map((l) => (l.variantId === id ? { ...l, quantity } : l)),
          },
        }));
      },
      remove: (owner, id) =>
        set((s) => ({
          carts: {
            ...s.carts,
            [owner]: id ? (s.carts[owner] ?? []).filter((l) => l.variantId !== id) : [],
          },
        })),
      changeVariant: (owner, oldId, newId) =>
        set((s) => ({
          carts: { ...s.carts, [owner]: updateCartVariant(s.carts[owner] ?? [], oldId, newId) },
        })),
      mergeGuest: (guest, user) => {
        let cart = get().carts[user] ?? [];
        for (const line of get().carts[guest] ?? []) {
          try {
            cart = mergeCartItems(cart, line);
          } catch {
            const existing = cart.find((l) => l.variantId === line.variantId);
            const quantity = getStockForVariant(line.variantId);
            if (existing)
              cart = cart.map((l) => (l.variantId === line.variantId ? { ...l, quantity } : l));
            else if (quantity > 0)
              cart = [...cart, { ...line, quantity: Math.min(line.quantity, quantity) }];
          }
        }
        set((s) => ({ carts: { ...s.carts, [user]: cart, [guest]: [] }, intent: null }));
      },
      start: (owner, source, items) => {
        const current = get().intent;
        if (
          source === 'CART' &&
          current?.ownerId === owner &&
          current.source === 'CART' &&
          current.orderId
        )
          return current;
        const lines = items ?? get().carts[owner] ?? [];
        if (!lines.length || !lines.every(validLine)) throw new Error('unavailable');
        const intent = {
          id: crypto.randomUUID(),
          ownerId: owner,
          source,
          items: structuredClone(lines),
        };
        set({ intent });
        return intent;
      },
      linkOrder: (id) => set((s) => ({ intent: s.intent ? { ...s.intent, orderId: id } : null })),
      consume: (owner, items) =>
        set((s) => ({
          carts: { ...s.carts, [owner]: consumePurchased(s.carts[owner] ?? [], items) },
          intent: null,
        })),
    }),
    persistOptions('shopping', schema, (s) => ({ carts: s.carts, intent: s.intent })),
  ),
);
