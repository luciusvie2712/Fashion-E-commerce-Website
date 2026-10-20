import { z } from 'zod';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useLocale } from '../features/i18n';
import { stories, faq } from '../data/content';
import { products, collections } from '../data/catalog';
import { aboutPhoto, collectionPhoto } from '../data/photography';
import { DemoNotice, SizeTable } from '../components/shared';
import { Button } from '../components/ui';
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
  const [sent, setSent] = useState(false),
    [error, setError] = useState('');
  return (
    <section className={`container section ${key === 'lookbook' ? '' : 'reading'}`}>
      <p className="eyebrow">FLUIVIX / DEMO</p>
      <h1>{t(key)}</h1>
      <DemoNotice />
      {story && (
        <>
          <p className="muted">{t('samplePolicy')}</p>
          {key === 'about' && (
            <img src={aboutPhoto} alt={t('atelierImageAlt')} width="1600" height="1000" />
          )}
          {story.map((text, i) =>
            i % 2 === 0 ? <h2 key={i}>{text[locale]}</h2> : <p key={i}>{text[locale]}</p>,
          )}
          {key === 'about' && (
            <Link className="button" to="/collections">
              {t('explore')} ↗
            </Link>
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
      {key === 'contact' && (
        <>
          <p>{t('localOnly')}</p>
          <form
            className="form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              if (
                !z
                  .object({
                    name: z.string().trim().min(2),
                    email: z.email(),
                    message: z.string().trim().min(10),
                  })
                  .safeParse(Object.fromEntries(data)).success
              ) {
                setError('invalid');
                return;
              }
              setError('');
              setSent(true);
              e.currentTarget.reset();
            }}
          >
            <label>
              {t('fullName')}
              <input name="name" required minLength={2} />
            </label>
            <label>
              {t('email')}
              <input type="email" name="email" required />
            </label>
            <label>
              {t('message')}
              <textarea name="message" required minLength={10} />
            </label>
            <Button>{t('send')}</Button>
            {error && (
              <p className="field-error" role="alert">
                {t(error)}
              </p>
            )}
            {sent && <p role="status">{t('formSent')}</p>}
          </form>
          <p className="section">
            <Link to="/faq">{t('faq')} ↗</Link>
          </p>
        </>
      )}
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
