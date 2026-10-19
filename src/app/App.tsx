import { BrowserRouter, Routes, Route } from 'react-router';
import { Component, lazy, Suspense, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { Shell } from '../components/layout/Shell';
import { Home, Catalog, CollectionList } from '../features/catalog/Pages';
const ProductPage = lazy(() =>
  import('../features/product/Page').then((m) => ({ default: m.ProductPage })),
);
const Cart = lazy(() => import('../features/cart/Pages').then((m) => ({ default: m.Cart })));
const Wishlist = lazy(() =>
  import('../features/cart/Pages').then((m) => ({ default: m.Wishlist })),
);
import { Empty } from '../components/shared';
import i18n, { useLocale } from '../features/i18n';
const AuthPage = lazy(() =>
  import('../features/auth/Pages').then((m) => ({ default: m.AuthPage })),
);
const Protected = lazy(() =>
  import('../features/auth/Pages').then((m) => ({ default: m.Protected })),
);
const AccountLayout = lazy(() =>
  import('../features/account/Pages').then((m) => ({ default: m.AccountLayout })),
);
const AccountHome = lazy(() =>
  import('../features/account/Pages').then((m) => ({ default: m.AccountHome })),
);
const ProfilePage = lazy(() =>
  import('../features/account/Pages').then((m) => ({ default: m.ProfilePage })),
);
const Addresses = lazy(() =>
  import('../features/account/Pages').then((m) => ({ default: m.Addresses })),
);
const Vouchers = lazy(() =>
  import('../features/account/Pages').then((m) => ({ default: m.Vouchers })),
);
const Checkout = lazy(() =>
  import('../features/checkout/Pages').then((m) => ({ default: m.Checkout })),
);
const PaymentPage = lazy(() =>
  import('../features/checkout/Pages').then((m) => ({ default: m.PaymentPage })),
);
const SuccessPage = lazy(() =>
  import('../features/checkout/Pages').then((m) => ({ default: m.SuccessPage })),
);
const Orders = lazy(() => import('../features/orders/Pages').then((m) => ({ default: m.Orders })));
const AccountOrder = lazy(() =>
  import('../features/orders/Pages').then((m) => ({ default: m.AccountOrder })),
);
const Track = lazy(() => import('../features/orders/Pages').then((m) => ({ default: m.Track })));
const ContentPage = lazy(() =>
  import('../pages/Content').then((m) => ({ default: m.ContentPage })),
);
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="container section">
        <h1>FLUIVIX</h1>
        <p>{i18n.t('error')}</p>
        <button className="button" onClick={() => window.location.reload()}>
          {i18n.t('retry')}
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
function Loading() {
  const { t } = useLocale();
  return (
    <div className="container section" role="status">
      <p>{t('loading')}</p>
      <div className="skeleton-grid" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} />
        ))}
      </div>
    </div>
  );
}
function Notices() {
  const { t } = useLocale();
  return (
    <Toaster
      richColors
      position="bottom-right"
      containerAriaLabel={t('notifications')}
      toastOptions={{ closeButtonAriaLabel: t('close') }}
    />
  );
}
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<Home />} />
              {[
                'shop',
                'category/:slug',
                'collections/:slug',
                'new-arrivals',
                'best-sellers',
                'sale',
                'search',
              ].map((path) => (
                <Route key={path} path={path} element={<Catalog />} />
              ))}
              <Route path="collections" element={<CollectionList />} />
              <Route path="product/:slug" element={<ProductPage />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="cart" element={<Cart />} />
              {['login', 'register', 'forgot-password'].map((path) => (
                <Route key={path} path={path} element={<AuthPage />} />
              ))}
              <Route element={<Protected />}>
                <Route path="account" element={<AccountLayout />}>
                  <Route index element={<AccountHome />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="addresses" element={<Addresses />} />
                  <Route path="vouchers" element={<Vouchers />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="orders/:id" element={<AccountOrder />} />
                </Route>
              </Route>
              <Route path="checkout" element={<Checkout />} />
              <Route path="checkout/payment" element={<PaymentPage />} />
              <Route path="checkout/success" element={<SuccessPage />} />
              <Route path="track-order" element={<Track />} />
              {[
                'about',
                'lookbook',
                'contact',
                'size-guide',
                'faq',
                'shipping-policy',
                'return-policy',
                'privacy-policy',
                'terms',
              ].map((path) => (
                <Route key={path} path={path} element={<ContentPage />} />
              ))}
              <Route
                path="*"
                element={
                  <section className="container section">
                    <h1>404</h1>
                    <Empty message="notFound" />
                  </section>
                }
              />
            </Route>
          </Routes>
        </Suspense>
        <Notices />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
