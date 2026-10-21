import { Link, useLocation } from 'react-router';
import { useLocale } from '../features/i18n';
import { stories, faq } from '../data/content';
import { products, collections } from '../data/catalog';
import { collectionPhoto } from '../data/photography';
import { AboutPage } from '../features/about/AboutPage';
import { ContactPage } from '../features/contact/ContactPage';
import { DemoNotice, SizeTable } from '../components/shared';
const pageKeys: Record<string, string> = {
  '/about': 'about',
  '/shipping-policy': 'shippingPolicy',
  '/return-policy': 'returnPolicy',
  '/privacy-policy': 'privacyPolicy',
  '/terms': 'terms',
  '/contact': 'contact',
  '/faq': 'faq',
  '/size-guide': 'sizeGuide',
  '/lookbook': 'lookbook',
};
export function ContentPage() {
  const { t, locale } = useLocale(),
    location = useLocation(),
    key = pageKeys[location.pathname],
    story = stories[key as keyof typeof stories];
  if (key === 'about') return <AboutPage />;
  if (key === 'contact') return <ContactPage />;
  return (
    <section className={`container section ${key === 'lookbook' ? '' : 'reading'}`}>
      <p className="eyebrow">FLUIVIX / DEMO</p>
      <h1>{t(key)}</h1>
      <DemoNotice />
      {story && (
        <>
          <p className="muted">{t('samplePolicy')}</p>
          {story.map((text, i) =>
            i % 2 === 0 ? <h2 key={i}>{text[locale]}</h2> : <p key={i}>{text[locale]}</p>,
          )}
        </>
      )}
      {key === 'sizeGuide' && (
        <>
          <SizeTable />
          <Link to="/shop" className="button">
            {t('continue')}
          </Link>
        </>
      )}
      {key === 'faq' &&
        faq.map(([q, a], i) => (
          <details key={i}>
            <summary>{q[locale]}</summary>
            <p>{a[locale]}</p>
          </details>
        ))}
      {key === 'lookbook' && (
        <div className="collection-grid">
          {collections.map((c) => (
            <article key={c.id}>
              <Link to={`/collections/${c.id}`}>
                <img src={collectionPhoto(c.id)} alt={c.name[locale]} />
                <h2>{c.name[locale]} ↗</h2>
              </Link>
              <p>{c.description[locale]}</p>
              {products
                .filter((p) => p.collectionIds.includes(c.id))
                .slice(0, 3)
                .map((p) => (
                  <p key={p.id}>
                    <Link to={`/product/${p.slug}`}>{p.name[locale]} ↗</Link>
                  </p>
                ))}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
