import { beforeEach, it, expect } from 'vitest';
import { useCart } from '../features/cart/store';
import { useAuth } from '../features/auth/store';
import { useWishlist } from '../features/wishlist/store';
import { products } from '../data/catalog';
const line = { productId: products[0].id, variantId: products[0].variants[0].id, quantity: 1 };
beforeEach(() => {
  useCart.setState({ carts: {}, intent: null });
  useWishlist.setState({ lists: {}, recent: {} });
  useAuth.setState({ session: null });
});
it('buy now persists an isolated intent', () => {
  const c = useCart.getState();
  c.add('guest', line);
  const intent = c.start('guest', 'BUY_NOW', [
    { ...line, variantId: products[1].variants[0].id, productId: products[1].id },
  ]);
  expect(intent.items[0].productId).toBe(products[1].id);
  expect(useCart.getState().carts.guest).toEqual([line]);
  expect(localStorage.getItem('fluivix:v1:shopping')).toContain('BUY_NOW');
});
it('merges guest shopping but keeps owner histories separate', () => {
  const guest = useAuth.getState().guestId;
  useCart.getState().add(guest, line);
  useWishlist.getState().toggle(guest, line.productId);
  useAuth.getState().login('demo@fluivix.local');
  expect(useCart.getState().carts['demo-user']).toEqual([line]);
  expect(useCart.getState().carts[guest]).toEqual([]);
  expect(useWishlist.getState().lists['demo-user']).toContain(line.productId);
  useAuth.getState().logout();
  expect(useCart.getState().carts['demo-user']).toEqual([line]);
});
it('never persists a password when creating a demo identity', () => {
  useAuth.getState().register('Example', 'sample@local.test');
  const raw = localStorage.getItem('fluivix:v1:identity')!;
  expect(raw).not.toContain('password');
  expect(
    JSON.parse(raw).state.profiles.some((p: { email: string }) => p.email === 'sample@local.test'),
  ).toBe(true);
});
it('deleting a default address selects another address for that owner', () => {
  const auth = useAuth.getState();
  const address = {
    id: 'a1',
    ownerId: 'demo-user',
    recipient: 'Sample',
    phone: '0900000000',
    province: 'Sample',
    district: 'Sample',
    street: 'Sample street',
    isDefault: true,
  };
  auth.saveAddress(address);
  auth.saveAddress({ ...address, id: 'a2', isDefault: false });
  auth.removeAddress('a1');
  expect(useAuth.getState().addresses.find((a) => a.id === 'a2')?.isDefault).toBe(true);
});
it('rejects duplicate demo identities', () =>
  expect(() => useAuth.getState().register('Demo', 'demo@fluivix.local')).toThrow('duplicate'));
