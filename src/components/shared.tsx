import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'react-router';
import { Heart, ArrowUpRight, Check, Layers, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale, money } from '../features/i18n';
import type { Product, Pricing } from '../types/domain';
import { useOwner } from '../features/auth/store';
import { useWishlist } from '../features/wishlist/store';
import { displayPrice, categories, colors, unitPrice, variantImage } from '../data/catalog';
import { productCopy, quickViewCopy } from '../features/product/content';
import { useState, type ImgHTMLAttributes } from 'react';
import { Modal, Button } from './ui';
export function LocalImage({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <svg className={props.className} role="img" aria-label={alt} viewBox="0 0 400 500">
      <title>{alt}</title>
      <path fill="#e4e2d6" d="M0 0h400v500H0z" />
      <path fill="#7d8873" d="M100 140l60-40q40 30 80 0l60 40-25 70-30-20v160h-90V190l-30 20z" />
    </svg>
  ) : (
    <img alt={alt} {...props} onError={() => setFailed(true)} />
  );
}
export function DemoNotice() {
  const { t } = useLocale();
  return <p className="demo-notice">DEMO · {t('demo')}</p>;
}
export function Empty({ message = 'empty', to = '/shop' }: { message?: string; to?: string }) {
  const { t } = useLocale();
  return (
    <div className="empty">
      <p>{t(message)}</p>
      <Link className="button" to={to}>
        {t(to === '/cart' ? 'cart' : 'continue')} <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
export function Favorite({ id }: { id: string }) {
  const { t } = useLocale(),
    owner = useOwner(),
    store = useWishlist();
  const saved = store.lists[owner]?.includes(id) ?? false;
  return (
    <button
      className="icon favorite"
      aria-label={t('wishlist')}
      aria-pressed={saved}
      onClick={() => {
        store.toggle(owner, id);
        toast.success(t('saved'));
      }}
    >
      <Heart size={19} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}
export function ProductCard({ product: p }: { product: Product }) {
  const { t, locale } = useLocale();
  const badge = !p.variants.some((v) => v.stock > 0)
    ? 'soldOut'
    : p.compareAtPriceVnd
      ? 'sale'
      : p.createdAt >= '2026-09-10'
        ? 'new'
        : p.popularity >= 900
          ? 'best'
          : null;
  return (
    <article className="product-card">
      <div className="product-image">
        <Link to={`/product/${p.slug}`}>
          <LocalImage
            width="400"
            height="500"
            loading="lazy"
            src={p.imageUrls[0]}
            alt={p.name[locale]}
          />
        </Link>
        <Favorite id={p.id} />
        {badge && (
          <span className="product-badge" data-badge={badge}>
            {t(badge)}
          </span>
        )}
        <Modal
          title={p.name[locale]}
          className="quick-view-dialog"
          trigger={<Button className="quick-view">{t('quickView')}</Button>}
        >
          <QuickViewPreview product={p} />
        </Modal>
      </div>
      <Link to={`/product/${p.slug}`} className="product-name">
        {p.name[locale]}
      </Link>
      <p className="price">
        {money(displayPrice(p), locale)}{' '}
        {p.compareAtPriceVnd && <del>{money(p.compareAtPriceVnd, locale)}</del>}
      </p>
    </article>
  );
}
function QuickViewPreview({ product: p }: { product: Product }) {
  const { t, locale } = useLocale();
  const productColors = colors.filter((color) => p.variants.some((v) => v.colorId === color.id));
  const [colorId, setColorId] = useState(productColors[0].id);
  const color = productColors.find((c) => c.id === colorId)!;
  const variants = p.variants.filter((v) => v.colorId === colorId);
  const available = variants.some((v) => v.stock > 0);
  const pricedVariants = available ? variants.filter((v) => v.stock > 0) : variants;
  const price = Math.min(...pricedVariants.map((v) => unitPrice(p, v.id)));
  const compare = p.compareAtPriceVnd && p.compareAtPriceVnd > price ? p.compareAtPriceVnd : null;
  const category = categories.find((c) => c.id === p.categoryId);
  return (
    <div className="quick-preview">
      <section className="quick-preview-gallery" aria-label={t('color')}>
        <div className="quick-preview-photo">
          <LocalImage
            key={colorId}
            src={variantImage(p, variants[0].id)}
            alt={`${p.name[locale]} · ${color.name[locale]}`}
            width="600"
            height="750"
          />
          <span className="quick-preview-photo-label">
            FLUIVIX <span aria-hidden="true">/</span> {t('quickView')}
          </span>
          <Favorite id={p.id} />
        </div>
        <div className="quick-preview-palette">
          <p>
            {t('color')} <strong aria-live="polite">{color.name[locale]}</strong>
          </p>
          <div className="quick-preview-swatches" role="group" aria-label={t('color')}>
            {productColors.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-label={c.name[locale]}
                aria-pressed={colorId === c.id}
                onClick={() => setColorId(c.id)}
                style={{ backgroundColor: c.hex }}
              >
                {colorId === c.id && (
                  <Check
                    size={16}
                    aria-hidden="true"
                    style={{ color: c.id === 'sand' || c.id === 'cream' ? '#292c2d' : '#fff' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="quick-preview-info" aria-label={productCopy.information[locale]}>
        <div className="quick-preview-heading">
          <p className="quick-preview-eyebrow">{category?.name[locale]}</p>
          <h3>{p.name[locale]}</h3>
          <p className="quick-preview-code">
            {productCopy.productCode[locale]} · {p.sku}
          </p>
        </div>
        <div className="quick-preview-pricing" aria-live="polite">
          <span>{quickViewCopy.from[locale]}</span>
          <div>
            <strong>{money(price, locale)}</strong>
            {compare && <del>{money(compare, locale)}</del>}
          </div>
          <p className="quick-preview-stock" data-available={available}>
            <span aria-hidden="true" />
            {t(available ? 'inStock' : 'soldOut')} · {color.name[locale]}
          </p>
        </div>
        <p className="quick-preview-description">{p.description[locale]}</p>
        <div className="quick-preview-sizes">
          <p>
            {t('size')} <span>{quickViewCopy.sizePreview[locale]}</span>
          </p>
          <ul aria-label={t('size')}>
            {variants.map((v) => (
              <li key={v.id} data-unavailable={v.stock === 0}>
                {v.size}
                <span className="sr-only"> · {t(v.stock > 0 ? 'inStock' : 'soldOut')}</span>
              </li>
            ))}
          </ul>
          <small>{quickViewCopy.sizeHint[locale]}</small>
        </div>
        <div className="quick-preview-fabric">
          <Layers size={19} aria-hidden="true" />
          <div>
            <h4>{t('material')}</h4>
            <p>{p.materials[locale]}</p>
          </div>
        </div>
        <details className="quick-preview-care">
          <summary>
            {t('care')}
            <ChevronDown size={16} aria-hidden="true" />
          </summary>
          <p>{p.care[locale]}</p>
        </details>
        <div className="quick-preview-action">
          <Dialog.Close asChild>
            <Link className="button" to={`/product/${p.slug}`}>
              {quickViewCopy.details[locale]}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </Dialog.Close>
          <p>{productCopy.priceNote[locale]}</p>
        </div>
      </section>
    </div>
  );
}
export function ProductGrid({ items }: { items: Product[] }) {
  return items.length ? (
    <div className="product-grid">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  ) : (
    <Empty />
  );
}
export function OrderProduct({
  image,
  name,
  color,
  size,
  quantity,
  total,
  sku,
}: {
  image: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
  total: number;
  sku?: string;
}) {
  const { t, locale } = useLocale();
  return (
    <div className="order-product">
      <LocalImage className="order-product-image" src={image} alt={name} width="80" height="100" />
      <div className="order-product-info">
        {sku && <p className="order-product-sku">{sku}</p>}
        <h3>{name}</h3>
        <p>
          {color} <span aria-hidden="true">·</span> {t('size')} / {size}
        </p>
        <p className="order-product-quantity">
          {t('quantity')}: {quantity}
        </p>
      </div>
      <strong className="order-product-price">{money(total, locale)}</strong>
    </div>
  );
}
export function Summary({ pricing }: { pricing: Pricing }) {
  const { t, locale } = useLocale();
  return (
    <dl className="summary">
      {(['subtotalVnd', 'discountVnd', 'shippingFeeVnd', 'totalVnd'] as const).map((key, i) => (
        <div key={key} data-amount={key}>
          <dt>{t(['subtotal', 'discount', 'shipping', 'total'][i])}</dt>
          <dd>
            {key === 'discountVnd' ? '− ' : ''}
            {money(pricing[key], locale)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
export function SizeTable({
  showIntro = true,
  scrollHint,
}: { showIntro?: boolean; scrollHint?: string } = {}) {
  const { t, locale } = useLocale();
  const [category, setCategory] = useState('tshirts');
  return (
    <>
      {showIntro && <p>{t('measure')}</p>}
      <label>
        {t('category')}
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories
            .filter((c) => ['tshirts', 'trousers', 'accessories'].includes(c.id))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name[locale]}
              </option>
            ))}
        </select>
      </label>
      {category === 'accessories' ? (
        <p>{t('oneSizeNote')}</p>
      ) : (
        <div className="table-wrap" role="region" aria-label={t('sizeGuide')} tabIndex={0}>
          {scrollHint && <p className="table-scroll-hint">{scrollHint}</p>}
          <table>
            <caption className="sr-only">{t('sizeGuide')}</caption>
            <thead>
              <tr>
                {['size', ...(category === 'tshirts' ? ['chest'] : []), 'waist', 'hips'].map(
                  (k) => (
                    <th scope="col" key={k}>
                      {t(k)}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {['S', 'M', 'L', 'XL', 'XXL'].map((s, i) => (
                <tr key={s}>
                  <th scope="row">{s}</th>
                  {category === 'tshirts' && (
                    <td>
                      {88 + i * 6}–{93 + i * 6}
                    </td>
                  )}
                  <td>
                    {68 + i * 6}–{73 + i * 6}
                  </td>
                  <td>
                    {90 + i * 6}–{95 + i * 6}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted">{t('samplePolicy')}</p>
    </>
  );
}
