import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { DemoNotice, LocalImage } from '../../components/shared';
import { collections, products, displayPrice } from '../../data/catalog';
import { collectionPhoto } from '../../data/photography';
import { useLocale, money } from '../i18n';
import { informationCopy as copy } from './content';

export function LookbookPage() {
  const { t, locale } = useLocale();
  return (
    <div className="lookbook-page container">
      <header className="lookbook-heading">
        <p className="eyebrow">FLUIVIX / {copy.edit[locale]}</p>
        <div>
          <h1>{t('lookbook')}</h1>
          <p>{copy.lookIntro[locale]}</p>
        </div>
        <nav aria-label={copy.collectionIndex[locale]}>
          {collections.map((collection, i) => (
            <a key={collection.id} href={`#look-${collection.id}`}>
              <span aria-hidden="true">0{i + 1}</span>
              {collection.name[locale]}
              <ArrowDown size={15} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </header>
      <div className="lookbook-edits">
        {collections.map((collection, index) => (
          <section
            className="lookbook-edit"
            id={`look-${collection.id}`}
            key={collection.id}
            aria-labelledby={`look-title-${collection.id}`}
          >
            <Link className="lookbook-photo" to={`/collections/${collection.id}`}>
              <LocalImage
                src={collectionPhoto(collection.id)}
                alt={collection.name[locale]}
                width="1536"
                height="1024"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <span className="lookbook-photo-index" aria-hidden="true">
                0{index + 1} / FLUIVIX
              </span>
            </Link>
            <div className="lookbook-edit-copy">
              <p className="eyebrow">FLUIVIX / 0{index + 1}</p>
              <h2 id={`look-title-${collection.id}`}>{collection.name[locale]}</h2>
              <p>{collection.description[locale]}</p>
              <Link className="lookbook-collection-link" to={`/collections/${collection.id}`}>
                {t('explore')}
                <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
              <h3>{copy.pieces[locale]}</h3>
              <div className="lookbook-pieces">
                {products
                  .filter((product) => product.collectionIds.includes(collection.id))
                  .slice(0, 3)
                  .map((product) => (
                    <Link key={product.id} to={`/product/${product.slug}`}>
                      <LocalImage
                        src={product.imageUrls[index % product.imageUrls.length]}
                        alt={product.name[locale]}
                        width="400"
                        height="500"
                        loading="lazy"
                      />
                      <span>{product.name[locale]}</span>
                      <span>{money(displayPrice(product), locale)}</span>
                    </Link>
                  ))}
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="lookbook-disclosure">
        <DemoNotice />
      </div>
    </div>
  );
}
