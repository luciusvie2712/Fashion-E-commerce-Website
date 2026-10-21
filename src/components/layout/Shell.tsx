import { z } from 'zod';
import { applyPageMetadata, pageMetadata } from '../../app/metadata';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import {
  Search,
  UserRound,
  Heart,
  ShoppingBag,
  Menu,
  ArrowUpRight,
  Globe2,
  ChevronDown,
  ArrowRight,
  Package,
} from 'lucide-react';
import { useLocale } from '../../features/i18n';
import { useCart } from '../../features/cart/store';
import { useWishlist } from '../../features/wishlist/store';
import { useOwner } from '../../features/auth/store';
import { Modal, Button, Confirm } from '../ui';
import { products } from '../../data/catalog';
import { normalizeVietnameseSearch } from '../../lib/urls';
import { resetFluivixStorage, storageFailed } from '../../lib/storage';
import { DemoNotice } from '../shared';
import { useScrollHeader } from './useScrollHeader';
import { usePageMotion } from './usePageMotion';
export const nav = [
  ['/shop', 'shop'],
  ['/new-arrivals', 'new'],
  ['/collections', 'collections'],
  ['/best-sellers', 'best'],
  ['/sale', 'sale'],
] as const;
export const supportNav = [
  ['/about', 'about'],
  ['/lookbook', 'lookbook'],
  ['/contact', 'contact'],
  ['/size-guide', 'sizeGuide'],
  ['/faq', 'faq'],
  ['/shipping-policy', 'shippingPolicy'],
  ['/return-policy', 'returnPolicy'],
  ['/privacy-policy', 'privacyPolicy'],
  ['/terms', 'terms'],
  ['/track-order', 'track'],
] as const;
function Language() {
  const { t, locale, changeLanguage } = useLocale();
  return (
    <div className="language-picker">
      <Globe2 size={16} aria-hidden="true" />
      <select
        className="language"
        aria-label={t('language')}
        value={locale}
        onChange={(e) => void changeLanguage(e.target.value)}
      >
        {[
          ['vi', 'Tiếng Việt'],
          ['en', 'English'],
          ['ko', '한국어'],
          ['zh-CN', '简体中文'],
          ['ja', '日本語'],
        ].map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown size={13} aria-hidden="true" />
    </div>
  );
}
function SearchBox() {
  const { t, locale } = useLocale(),
    navigate = useNavigate();
  const [q, setQ] = useState(''),
    [open, setOpen] = useState(false);
  const matches = q.trim()
    ? products
        .filter((p) =>
          normalizeVietnameseSearch(p.name[locale] + ' ' + p.name.vi).includes(
            normalizeVietnameseSearch(q),
          ),
        )
        .slice(0, 5)
    : [];
  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title={t('search')}
      trigger={
        <button className="icon header-search" aria-label={t('search')}>
          <Search size={21} />
          <span>{t('search')}</span>
        </button>
      }
    >
      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          setOpen(false);
          navigate(`/search?q=${encodeURIComponent(q)}`);
        }}
      >
        <label>
          {t('search')}
          <input value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <Button>{t('search')}</Button>
      </form>
      <ul className="suggestions">
        {matches.map((p) => (
          <li key={p.id}>
            <Link onClick={() => setOpen(false)} to={`/product/${p.slug}`}>
              {p.name[locale]} <ArrowUpRight size={14} />
            </Link>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
export function Newsletter() {
  const { t } = useLocale();
  const [sent, setSent] = useState(false),
    [error, setError] = useState('');
  return (
    <section className="newsletter">
      <div>
        <p className="eyebrow">FLUIVIX / DEMO</p>
        <h2>{t('newsletter')}</h2>
        <p>{t('localOnly')}</p>
      </div>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!z.email().safeParse(new FormData(e.currentTarget).get('newsletter')).success) {
            setError('emailError');
            return;
          }
          setError('');
          setSent(true);
        }}
      >
        <label>
          {t('email')}
          <input type="email" required name="newsletter" autoComplete="off" />
        </label>
        <Button className="light">
          {t('subscribe')} <ArrowUpRight size={18} />
        </Button>
        {error && (
          <p className="field-error" role="alert">
            {t(error)}
          </p>
        )}
        {sent && <p role="status">{t('formSent')}</p>}
      </form>
    </section>
  );
}
export function Shell() {
  const { t, locale } = useLocale(),
    owner = useOwner(),
    cart = useCart(),
    favorites = useWishlist(),
    location = useLocation();
  const headerRef = useScrollHeader(location.key);
  usePageMotion(location.key);
  const [storageWarning, setStorageWarning] = useState(storageFailed);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const warn = () => setStorageWarning(true);
    window.addEventListener('fluivix:storage-error', warn);
    return () => window.removeEventListener('fluivix:storage-error', warn);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    applyPageMetadata(pageMetadata(location.pathname, locale, t), locale);
  }, [location.pathname, t, locale]);
  const count = (cart.carts[owner] ?? []).reduce((n, l) => n + l.quantity, 0);
  return (
    <>
      <a className="skip" href="#main">
        {t('skip')}
      </a>
      <div className="announcement">{t('announcement')}</div>
      <div className="header-dock" ref={headerRef}>
        <header className="header">
          <Modal
            open={menu}
            onOpenChange={setMenu}
            title={t('menu')}
            className="nav-drawer"
            trigger={
              <button className="icon mobile-menu" aria-label={t('menu')}>
                <Menu size={22} />
              </button>
            }
          >
            <p className="nav-drawer-intro">{t('heroBody')}</p>
            <nav className="mobile-links" aria-label={t('menu')}>
              {nav.map(([path, key]) => (
                <NavLink key={path} to={path} onClick={() => setMenu(false)}>
                  <span>{t(key)}</span>
                  <ArrowUpRight size={21} aria-hidden="true" />
                </NavLink>
              ))}
            </nav>
            <div className="nav-drawer-utilities">
              <Link to="/account" onClick={() => setMenu(false)}>
                <UserRound size={20} aria-hidden="true" />
                {t('account')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/track-order" onClick={() => setMenu(false)}>
                <Package size={20} aria-hidden="true" />
                {t('track')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="nav-drawer-language">
              <span>{t('language')}</span>
              <Language />
            </div>
          </Modal>
          <Link className="wordmark" to="/" onClick={() => window.scrollTo(0, 0)}>
            FLUIVIX<span>®</span>
          </Link>
          <nav className="desktop-nav" aria-label={t('menu')}>
            {nav.map(([path, key]) => (
              <NavLink key={path} to={path} className={key === 'sale' ? 'nav-sale' : undefined}>
                {t(key)}
              </NavLink>
            ))}
          </nav>
          <Language />
          <div className="header-actions">
            <SearchBox />
            <Link className="icon account-icon" aria-label={t('account')} to="/account">
              <UserRound size={21} />
            </Link>
            <Link
              className="icon"
              aria-label={`${t('wishlist')} · ${favorites.lists[owner]?.length ?? 0}`}
              to="/wishlist"
            >
              <Heart size={21} />
              {!!favorites.lists[owner]?.length && (
                <span className="badge" aria-hidden="true">
                  {favorites.lists[owner]?.length ?? 0}
                </span>
              )}
            </Link>
            <Link className="icon" aria-label={`${t('cart')} · ${count}`} to="/cart">
              <ShoppingBag size={21} />
              {count > 0 && (
                <span className="badge" aria-hidden="true">
                  {count}
                </span>
              )}
            </Link>
          </div>
          <Link className="header-tracking" to="/track-order">
            <Package size={16} aria-hidden="true" />
            {t('track')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </header>
      </div>
      {storageWarning && (
        <p className="warning" role="alert">
          {t('storageWarning')}
        </p>
      )}
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer>
        <div className="footer-top">
          <Link to="/" className="wordmark">
            FLUIVIX<span>®</span>
          </Link>
          <p>{t('heroBody')}</p>
          <div className="footer-links">
            {supportNav.map(([path, key]) => (
              <Link key={path} to={path}>
                {t(key)}
              </Link>
            ))}
          </div>
        </div>
        <DemoNotice />
        <div className="footer-bottom">
          <span>© 2026 FLUIVIX · DEMO</span>
          <Confirm
            title={t('confirmDelete')}
            onConfirm={() => {
              resetFluivixStorage();
              window.location.assign('/');
            }}
            trigger={<button className="text-button">{t('reset')}</button>}
          />
        </div>
      </footer>
    </>
  );
}
