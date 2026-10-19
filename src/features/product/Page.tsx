import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { products, colors, unitPrice } from '../../data/catalog';
import { useLocale, money } from '../i18n';
import { useCart } from '../cart/store';
import { useOwner } from '../auth/store';
import { useWishlist } from '../wishlist/store';
import { Button, Modal } from '../../components/ui';
import { Empty, Favorite, ProductGrid, SizeTable, LocalImage } from '../../components/shared';
import { Reviews } from '../reviews/Reviews';
export function ProductPage() {
  const { slug } = useParams(),
    p = products.find((p) => p.slug === slug),
    { t, locale } = useLocale(),
    owner = useOwner(),
    cart = useCart(),
    navigate = useNavigate();
  const [color, setColor] = useState(''),
    [size, setSize] = useState(''),
    [quantity, setQuantity] = useState(1),
    [image, setImage] = useState(0),
    [error, setError] = useState('');
  const view = useWishlist((s) => s.view);
  useEffect(() => {
    if (p) view(owner, p.id);
  }, [p, owner, view]);
  if (!p) return <Empty message="notFound" />;
  const activeImage = Math.min(image, p.imageUrls.length - 1);
  const variant =
    p.variants.length === 1
      ? p.variants[0]
      : p.variants.find((v) => v.colorId === color && v.size === size);
  function buy(now: boolean) {
    if (!variant) {
      setError('choose');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > variant.stock) {
      setError('stockError');
      return;
    }
    const line = { productId: p!.id, variantId: variant.id, quantity };
    try {
      if (now) {
        cart.start(owner, 'BUY_NOW', [line]);
        navigate('/checkout');
      } else {
        cart.add(owner, line);
        setError('');
        toast.success(t('added', { product: p!.name[locale] }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'stockError');
    }
  }
  return (
    <>
      <section className="container section">
        <nav className="breadcrumb">
          <Link to="/shop">{t('shop')}</Link> / {p.name[locale]}
        </nav>
        <div className="pdp">
          <div className="gallery">
            <Modal
              title={p.name[locale]}
              trigger={
                <button className="gallery-main" aria-label={t('zoom')}>
                  <LocalImage
                    src={p.imageUrls[activeImage]}
                    alt={`${p.name[locale]} — ${t('illustration')}`}
                    width="400"
                    height="500"
                  />
                </button>
              }
            >
              <LocalImage
                className="zoom-image"
                src={p.imageUrls[activeImage]}
                alt={p.name[locale]}
              />
            </Modal>
            <div className="thumbnails">
              {p.imageUrls.map((url, i) => (
                <button
                  key={url}
                  aria-label={`${t('zoom')} ${i + 1}`}
                  aria-pressed={activeImage === i}
                  onClick={() => setImage(i)}
                >
                  <LocalImage src={url} alt={p.name[locale]} width="80" height="100" />
                </button>
              ))}
            </div>
            <p className="muted small">{t('illustration')}</p>
          </div>
          <div className="purchase">
            <p className="eyebrow">FLUIVIX / {p.sku}</p>
            <h1>{p.name[locale]}</h1>
            <p className="large-price">
              {money(variant ? unitPrice(p, variant.id) : p.basePriceVnd, locale)}{' '}
              {p.compareAtPriceVnd && <del>{money(p.compareAtPriceVnd, locale)}</del>}
            </p>
            <p>{p.description[locale]}</p>
            <fieldset>
              <legend>{t('color')}</legend>
              <div className="chips">
                {[...new Set(p.variants.map((v) => v.colorId))].map((id, i) => {
                  const c = colors.find((c) => c.id === id)!;
                  return (
                    <button
                      key={id}
                      className={color === id ? 'selected' : ''}
                      aria-pressed={color === id}
                      onClick={() => {
                        setColor(id);
                        setImage(i);
                        setError('');
                      }}
                    >
                      <span className="swatch" style={{ background: c.hex }} />
                      {c.name[locale]}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className="section-heading">
              <span>{t('size')}</span>
              <Modal
                title={t('sizeGuide')}
                trigger={<button className="text-button">{t('sizeGuide')}</button>}
              >
                <SizeTable />
              </Modal>
            </div>
            <div className="chips">
              {[...new Set(p.variants.map((v) => v.size))].map((s) => (
                <button
                  key={s}
                  className={size === s ? 'selected' : ''}
                  aria-pressed={size === s}
                  onClick={() => {
                    setSize(s);
                    setError('');
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <p role="status">
              {variant
                ? variant.stock
                  ? `${t('inStock')} · ${variant.stock}`
                  : t('soldOut')
                : t('choose')}
            </p>
            <label>
              {t('quantity')}
              <input
                className="quantity"
                type="number"
                min="1"
                max={variant?.stock ?? 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>
            {error && (
              <p className="field-error" role="alert">
                {t(error)}
              </p>
            )}
            <div className="actions purchase-actions">
              <Button disabled={variant?.stock === 0} onClick={() => buy(false)}>
                {t('add')}
              </Button>
              <Favorite id={p.id} />
            </div>
            <Button
              className="secondary full"
              disabled={variant?.stock === 0}
              onClick={() => buy(true)}
            >
              {t('buy')}
            </Button>
            <p className="muted small">{t('freeThreshold')}</p>
            {[
              ['description', p.description[locale]],
              ['material', p.materials[locale]],
              ['care', p.care[locale]],
            ].map(([key, body]) => (
              <details key={key}>
                <summary>{t(key)}</summary>
                <p>{body}</p>
              </details>
            ))}
            <Link to="/return-policy">{t('returnPolicy')} ↗</Link>
          </div>
        </div>
        <Reviews productId={p.id} />
        <div className="section">
          <h2>{t('related')}</h2>
          <ProductGrid
            items={products
              .filter((x) => x.categoryId === p.categoryId && x.id !== p.id)
              .slice(0, 4)}
          />
        </div>
        <Recent />
      </section>
    </>
  );
}
export function Recent() {
  const { t } = useLocale(),
    owner = useOwner(),
    ids = useWishlist().recent[owner] ?? [];
  return ids.length ? (
    <section className="section">
      <h2>{t('recent')}</h2>
      <ProductGrid
        items={ids
          .map((id) => products.find((p) => p.id === id))
          .filter((p) => p !== undefined)
          .slice(0, 4)}
      />
    </section>
  ) : null;
}
