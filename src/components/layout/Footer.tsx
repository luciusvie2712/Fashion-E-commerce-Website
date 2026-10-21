import { ArrowRight, ArrowUp, ArrowUpRight, RotateCcw, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { useLocale } from '../../features/i18n';
import { resetFluivixStorage } from '../../lib/storage';
import { Confirm } from '../ui';

const groups = [
  {
    title: 'footerShopping',
    links: [
      ['/shop', 'shop'],
      ['/new-arrivals', 'new'],
      ['/collections', 'collections'],
      ['/best-sellers', 'best'],
      ['/sale', 'sale'],
      ['/lookbook', 'lookbook'],
    ],
  },
  {
    title: 'footerSupport',
    links: [
      ['/contact', 'contact'],
      ['/faq', 'faq'],
      ['/size-guide', 'sizeGuide'],
      ['/track-order', 'track'],
    ],
  },
  {
    title: 'footerInformation',
    links: [
      ['/about', 'about'],
      ['/shipping-policy', 'shippingPolicy'],
      ['/return-policy', 'returnPolicy'],
      ['/privacy-policy', 'privacyPolicy'],
      ['/terms', 'terms'],
    ],
  },
] as const;

export function Footer() {
  const { t } = useLocale();
  const backToTop = () => {
    document.querySelector<HTMLAnchorElement>('.header .wordmark')?.focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer-invitation">
          <div>
            <p className="eyebrow">FLUIVIX / {t('footerShopping')}</p>
            <h2>{t('hero')}</h2>
          </div>
          <Link className="site-footer-cta" to="/collections">
            <span>{t('explore')}</span>
            <ArrowUpRight size={23} aria-hidden="true" />
          </Link>
        </div>
        <div className="site-footer-main">
          <div className="site-footer-brand">
            <Link to="/" className="wordmark">
              FLUIVIX<span>®</span>
            </Link>
            <p>{t('heroBody')}</p>
            <Link className="site-footer-story" to="/about">
              {t('about')}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          {groups.map((group) => (
            <div className="site-footer-column" key={group.title}>
              <h3 id={`footer-${group.title}`}>{t(group.title)}</h3>
              <nav aria-labelledby={`footer-${group.title}`}>
                {group.links.map(([to, key]) => (
                  <Link key={to} to={to}>
                    {t(key)}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
        <div className="site-footer-disclosure">
          <ShieldCheck size={23} strokeWidth={1.4} aria-hidden="true" />
          <div>
            <p className="site-footer-disclosure-title">{t('footerLocal')}</p>
            <p>DEMO · {t('demo')}</p>
          </div>
        </div>
        <div className="site-footer-bottom">
          <span>© 2026 FLUIVIX · DEMO</span>
          <div className="site-footer-tools">
            <Confirm
              title={t('confirmDelete')}
              onConfirm={() => {
                resetFluivixStorage();
                window.location.assign('/');
              }}
              trigger={
                <button className="site-footer-reset">
                  <RotateCcw size={14} aria-hidden="true" />
                  {t('reset')}
                </button>
              }
            />
            <button className="site-footer-back" onClick={backToTop}>
              {t('footerBackTop')}
              <ArrowUp size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
