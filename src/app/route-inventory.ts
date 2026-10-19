export const routeInventory = [
  ['/', 'home'],
  ['/shop', 'shop'],
  ['/category/:slug', 'category'],
  ['/collections', 'collections'],
  ['/collections/:slug', 'collections'],
  ['/new-arrivals', 'new'],
  ['/best-sellers', 'best'],
  ['/sale', 'sale'],
  ['/search', 'search'],
  ['/product/:slug', 'description'],
  ['/wishlist', 'wishlist'],
  ['/cart', 'cart'],
  ['/checkout', 'checkout'],
  ['/checkout/payment', 'payment'],
  ['/checkout/success', 'success'],
  ['/track-order', 'track'],
  ['/login', 'login'],
  ['/register', 'register'],
  ['/forgot-password', 'forgot'],
  ['/account', 'account'],
  ['/account/profile', 'profile'],
  ['/account/addresses', 'addresses'],
  ['/account/orders', 'orders'],
  ['/account/orders/:id', 'receipt'],
  ['/account/vouchers', 'vouchers'],
  ['/about', 'about'],
  ['/lookbook', 'lookbook'],
  ['/contact', 'contact'],
  ['/size-guide', 'sizeGuide'],
  ['/faq', 'faq'],
  ['/shipping-policy', 'shippingPolicy'],
  ['/return-policy', 'returnPolicy'],
  ['/privacy-policy', 'privacyPolicy'],
  ['/terms', 'terms'],
] as const;
export function routeTitle(path: string) {
  return (
    routeInventory.find(([pattern]) =>
      new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$').test(path),
    )?.[1] ?? 'notFound'
  );
}
