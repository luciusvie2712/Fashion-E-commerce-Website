import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { products, categories, collections, colors, unitPrice } from '../../data/catalog';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Layers3,
  Minus,
  Package,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  WashingMachine,
  ZoomIn,
} from 'lucide-react';
import type { Product } from '../../types/domain';
import { productCopy as copy } from './content';
import { ProductImageViewer } from './ImageViewer';
import { mobileCopy } from '../../components/mobile-content';
import { useLocale, money } from '../i18n';
import { useCart } from '../cart/store';
import { useOwner } from '../auth/store';
import { useWishlist } from '../wishlist/store';
import { Button, Modal } from '../../components/ui';
import { Empty, Favorite, ProductGrid, SizeTable, LocalImage } from '../../components/shared';
import { Reviews } from '../reviews/Reviews';
export function ProductPage() {
  const { slug } = useParams();
  const product = products.find((item) => item.slug === slug);
  return product ? (
    <ProductDetails key={product.id} product={product} />
  ) : (
    <Empty message="notFound" />
  );
}
function ProductDetails({ product: p }: { product: Product }) {
  const { t, locale } = useLocale(),
    owner = useOwner(),
    cart = useCart(),
    navigate = useNavigate();
  const [color, setColor] = useState(p.variants.length === 1 ? p.variants[0].colorId : ''),
    [size, setSize] = useState(p.variants.length === 1 ? p.variants[0].size : ''),
    [quantity, setQuantity] = useState(1),
    [image, setImage] = useState(0),
    [error, setError] = useState('');
  const view = useWishlist((s) => s.view);
  useEffect(() => {
    if (p) view(owner, p.id);
  }, [p, owner, view]);
  const activeImage = Math.min(image, p.imageUrls.length - 1);
  const swipe = useRef({ x: 0, y: 0, moved: false });
  const variant =
    p.variants.length === 1
      ? p.variants[0]
      : p.variants.find((v) => v.colorId === color && v.size === size);
  const price = variant ? unitPrice(p, variant.id) : p.basePriceVnd;
  const compare = p.compareAtPriceVnd && p.compareAtPriceVnd > price ? p.compareAtPriceVnd : null;
  const category = categories.find((item) => item.id === p.categoryId)!;
  const sizeOptions = [...new Set(p.variants.map((v) => v.size))];
  const colorName = colors.find((item) => item.id === color)?.name[locale];
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
      <section className="container section product-page">
        <nav className="breadcrumb" aria-label={copy.navigation[locale]}>
          <Link to="/shop">{t('shop')}</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <Link to={`/category/${category.id}`}>{category.name[locale]}</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span aria-current="page">{p.name[locale]}</span>
        </nav>
        <nav className="product-section-links" aria-label={copy.information[locale]}>
          <a href="#product-information">{copy.information[locale]}</a>
          <a href="#product-reviews">{t('reviews')}</a>
        </nav>
        <div className="pdp">
          <div className="gallery">
            <div className="gallery-stage">
              <ProductImageViewer
                product={p}
                initialIndex={activeImage}
                trigger={
                  <button
                    className="gallery-main"
                    aria-label={t('zoom')}
                    onKeyDown={() => {
                      swipe.current.moved = false;
                    }}
                    onPointerDown={(event) => {
                      if (event.pointerType === 'mouse') swipe.current.moved = false;
                    }}
                    onTouchStart={(event) => {
                      swipe.current = {
                        x: event.touches[0].clientX,
                        y: event.touches[0].clientY,
                        moved: false,
                      };
                    }}
                    onTouchEnd={(event) => {
                      const dx = event.changedTouches[0].clientX - swipe.current.x;
                      const dy = event.changedTouches[0].clientY - swipe.current.y;
                      if (
                        Math.abs(dx) > 45 &&
                        Math.abs(dx) > Math.abs(dy) &&
                        p.imageUrls.length > 1
                      ) {
                        event.preventDefault();
                        swipe.current.moved = true;
                        setImage(
                          (current) =>
                            (current + (dx < 0 ? 1 : -1) + p.imageUrls.length) % p.imageUrls.length,
                        );
                      }
                    }}
                    onClickCapture={(event) => {
                      if (swipe.current.moved) {
                        event.preventDefault();
                        event.stopPropagation();
                        swipe.current.moved = false;
                      }
                    }}
                  >
                    <LocalImage
                      src={p.imageUrls[activeImage]}
                      alt={p.name[locale]}
                      width="400"
                      height="500"
                    />
                    <span className="gallery-zoom-hint">
                      <ZoomIn size={17} aria-hidden="true" />
                      {t('zoom')}
                    </span>
                  </button>
                }
              />
              <span className="mobile-gallery-count" aria-hidden="true">
                {activeImage + 1} / {p.imageUrls.length}
              </span>
            </div>
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
            {p.imageUrls.length > 1 && (
              <p className="mobile-gallery-swipe">{mobileCopy.swipe[locale]}</p>
            )}
          </div>
          <div className="purchase" id="product-options">
            <p className="eyebrow">FLUIVIX / {category.name[locale]}</p>
            <h1>{p.name[locale]}</h1>
            <p className="large-price">
              <strong>{money(price, locale)}</strong>
              {compare && (
                <>
                  <del>{money(compare, locale)}</del>
                  <span className="product-saving">
                    −
                    {new Intl.NumberFormat(locale).format(
                      Math.round(((compare - price) / compare) * 100),
                    )}
                    %
                  </span>
                </>
              )}
            </p>
            <p className="product-price-note">DEMO · {copy.priceNote[locale]}</p>
            <p className="product-intro">{p.description[locale]}</p>
            <fieldset>
              <legend>
                {t('color')}
                {colorName && <span> / {colorName}</span>}
              </legend>
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
                        if (color !== id) setQuantity(1);
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
              <span>
                {t('size')}
                {size && <span className="product-selected-size"> / {size}</span>}
              </span>
              <Modal
                title={t('sizeGuide')}
                trigger={
                  <button className="text-button">
                    <Ruler size={16} aria-hidden="true" />
                    {t('sizeGuide')}
                  </button>
                }
              >
                <SizeTable />
              </Modal>
            </div>
            <div className="chips product-sizes" role="group" aria-label={t('size')}>
              {sizeOptions.map((s) => {
                const unavailable = !p.variants.some(
                  (v) => v.size === s && (!color || v.colorId === color) && v.stock > 0,
                );
                return (
                  <button
                    key={s}
                    className={size === s ? 'selected' : ''}
                    aria-pressed={size === s}
                    disabled={unavailable}
                    title={unavailable ? t('soldOut') : s}
                    aria-describedby={unavailable ? 'product-size-hint' : undefined}
                    onClick={() => {
                      setSize(s);
                      if (size !== s) setQuantity(1);
                      setError('');
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="product-size-hint" id="product-size-hint">
              {copy.unavailable[locale]}
            </p>
            <p
              className="product-stock"
              data-stock={variant?.stock === 0 ? 'empty' : variant ? 'ready' : 'choose'}
              role="status"
            >
              {variant?.stock ? (
                <Check size={17} aria-hidden="true" />
              ) : (
                <Package size={17} aria-hidden="true" />
              )}
              {variant
                ? variant.stock
                  ? `${t('inStock')} · ${variant.stock}`
                  : t('soldOut')
                : t('choose')}
            </p>
            <div className="product-quantity-row">
              <label htmlFor="product-quantity">{t('quantity')}</label>
              <div className="product-quantity-control">
                <button
                  type="button"
                  aria-label={t('decreaseQuantity')}
                  disabled={!Number.isInteger(quantity) || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus size={17} aria-hidden="true" />
                </button>
                <input
                  id="product-quantity"
                  className="quantity"
                  type="number"
                  min="1"
                  max={variant?.stock ?? 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <button
                  type="button"
                  aria-label={t('increaseQuantity')}
                  disabled={!variant || !Number.isInteger(quantity) || quantity >= variant.stock}
                  onClick={() => setQuantity((q) => Math.min(variant?.stock ?? 1, q + 1))}
                >
                  <Plus size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
            {variant && (
              <dl className="product-selection">
                <dt>{copy.selection[locale]}</dt>
                <dd>
                  {colorName} / {variant.size} · {t('quantity')}: {quantity}
                </dd>
              </dl>
            )}
            {error && (
              <p className="field-error" role="alert">
                {t(error)}
              </p>
            )}
            <div className="actions purchase-actions">
              <Button disabled={variant?.stock === 0} onClick={() => buy(false)}>
                <ShoppingBag size={19} aria-hidden="true" />
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
              <ArrowRight size={19} aria-hidden="true" />
            </Button>
            <div className="product-service-links">
              <Link to="/shipping-policy">
                <Truck size={21} strokeWidth={1.4} aria-hidden="true" />
                <span>{t('freeThreshold')}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/return-policy">
                <ShieldCheck size={21} strokeWidth={1.4} aria-hidden="true" />
                <span>{t('returnPolicy')}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mobile-product-action">
          <div>
            <span>
              {variant?.stock === 0
                ? t('soldOut')
                : variant
                  ? `${colorName} / ${size}`
                  : t('choose')}
            </span>
            <strong>{money(price, locale)}</strong>
          </div>
          <Button
            aria-label={mobileCopy.quickAdd[locale]}
            disabled={variant?.stock === 0}
            onClick={() => {
              buy(false);
              if (!variant)
                document
                  .querySelector<HTMLButtonElement>(
                    color
                      ? '.product-sizes button:not(:disabled)'
                      : '#product-options fieldset button',
                  )
                  ?.focus();
              else if (!Number.isInteger(quantity) || quantity < 1 || quantity > variant.stock)
                document.getElementById('product-quantity')?.focus();
            }}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            {t('add')}
          </Button>
        </div>
        <section
          className="product-information"
          id="product-information"
          aria-labelledby="product-information-title"
        >
          <div className="section-heading">
            <h2 id="product-information-title">{copy.information[locale]}</h2>
            <span className="eyebrow">FLUIVIX / {p.sku}</span>
          </div>
          <div className="product-information-grid">
            <article>
              <Layers3 size={25} strokeWidth={1.4} aria-hidden="true" />
              <h3>{t('material')}</h3>
              <p>{p.materials[locale]}</p>
            </article>
            <article>
              <WashingMachine size={25} strokeWidth={1.4} aria-hidden="true" />
              <h3>{t('care')}</h3>
              <p>{p.care[locale]}</p>
            </article>
            <article>
              <Sparkles size={25} strokeWidth={1.4} aria-hidden="true" />
              <h3>{t('description')}</h3>
              <dl>
                <div>
                  <dt>{copy.productCode[locale]}</dt>
                  <dd>{p.sku}</dd>
                </div>
                {variant && (
                  <div>
                    <dt>{copy.variantCode[locale]}</dt>
                    <dd>{variant.sku}</dd>
                  </div>
                )}
                <div>
                  <dt>{t('category')}</dt>
                  <dd>{category.name[locale]}</dd>
                </div>
                <div>
                  <dt>{copy.availableSizes[locale]}</dt>
                  <dd>{sizeOptions.join(' / ')}</dd>
                </div>
              </dl>
            </article>
          </div>
          <div className="product-fit-note">
            <Ruler size={20} aria-hidden="true" />
            <span>{copy.fitHint[locale]}</span>
            <Link to="/size-guide">
              {t('sizeGuide')}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="product-collection-links">
            {collections
              .filter((collection) => p.collectionIds.includes(collection.id))
              .map((collection) => (
                <Link key={collection.id} to={`/collections/${collection.id}`}>
                  {t('collections')}: {collection.name[locale]}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              ))}
          </div>
        </section>
        <div id="product-reviews">
          <Reviews productId={p.id} />
        </div>
        <div className="section">
          <div className="section-heading">
            <h2>{t('related')}</h2>
            <Link to={`/category/${category.id}`}>
              {t('viewAll')}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
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
