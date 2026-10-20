import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowUpRight,
  Minus,
  PencilLine,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { useLocale, money } from '../i18n';
import { useCart } from './store';
import { useOwner } from '../auth/store';
import { useWishlist } from '../wishlist/store';
import {
  findProduct,
  findVariant,
  products,
  colors,
  unitPrice,
  variantImage,
} from '../../data/catalog';
import { calculateSubtotal, validLine } from './domain';
import { calculateTotal } from '../checkout/pricing';
import { Empty, LocalImage, ProductGrid, Summary } from '../../components/shared';
import { Button, Confirm, Modal } from '../../components/ui';
export function Wishlist() {
  const { t } = useLocale(),
    owner = useOwner(),
    ids = useWishlist().lists[owner] ?? [];
  return (
    <section className="container section">
      <h1>{t('wishlist')}</h1>
      <ProductGrid items={products.filter((p) => ids.includes(p.id))} />
    </section>
  );
}
function VariantEditor({ productId, variantId }: { productId: string; variantId: string }) {
  const { t, locale } = useLocale(),
    owner = useOwner(),
    cart = useCart(),
    p = findProduct(productId);
  const [selected, setSelected] = useState(variantId),
    [open, setOpen] = useState(false);
  if (!p) return null;
  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title={t('edit')}
      trigger={
        <Button className="secondary cart-edit">
          <PencilLine size={16} aria-hidden="true" />
          {t('edit')}
        </Button>
      }
    >
      <label>
        {t('color')} / {t('size')}
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {p.variants.map((v) => (
            <option key={v.id} value={v.id} disabled={!v.stock}>
              {colors.find((c) => c.id === v.colorId)!.name[locale]} / {v.size} —{' '}
              {v.stock ? `${t('inStock')} ${v.stock}` : t('soldOut')}
            </option>
          ))}
        </select>
      </label>
      <Button
        onClick={() => {
          try {
            cart.changeVariant(owner, variantId, selected);
            setOpen(false);
            toast.success(t('updated'));
          } catch (e) {
            toast.error(t(e instanceof Error ? e.message : 'stockError'));
          }
        }}
      >
        {t('save')}
      </Button>
    </Modal>
  );
}
export function Cart() {
  const { t, locale } = useLocale(),
    owner = useOwner(),
    cart = useCart(),
    navigate = useNavigate(),
    lines = cart.carts[owner] ?? [];
  function updateQuantity(variantId: string, quantity: number) {
    try {
      cart.setQty(owner, variantId, quantity);
    } catch {
      toast.error(t('stockError'));
    }
  }
  function checkout() {
    try {
      const intent = cart.start(owner, 'CART');
      navigate(intent.orderId ? `/checkout/payment?orderId=${intent.orderId}` : '/checkout');
    } catch (e) {
      toast.error(t(e instanceof Error ? e.message : 'unavailable'));
    }
  }
  return (
    <section className="container section cart-page">
      <div className="section-heading cart-heading">
        <div>
          <p className="eyebrow">
            FLUIVIX / <ShoppingBag size={16} aria-hidden="true" />
          </p>
          <h1>{t('cart')}</h1>
          {lines.length > 0 && (
            <p className="cart-count">
              {t('results', { count: lines.reduce((sum, line) => sum + line.quantity, 0) })}
            </p>
          )}
        </div>
        {lines.length > 0 && (
          <Confirm
            trigger={
              <Button className="secondary cart-clear">
                <Trash2 size={16} aria-hidden="true" />
                {t('clearCart')}
              </Button>
            }
            onConfirm={() => cart.remove(owner)}
          />
        )}
      </div>
      {!lines.length ? (
        <div className="cart-empty">
          <ShoppingBag size={38} aria-hidden="true" />
          <Empty />
        </div>
      ) : (
        <div className="two-column cart-layout">
          <div className="cart-items">
            {lines.map((line) => {
              const p = findProduct(line.productId),
                v = findVariant(line.variantId),
                color = colors.find((c) => c.id === v?.colorId);
              return (
                <article
                  key={line.variantId}
                  className="cart-row"
                  aria-labelledby={`cart-product-${line.variantId}`}
                >
                  {p && (
                    <Link className="cart-product-image" to={`/product/${p.slug}`}>
                      <LocalImage
                        src={variantImage(p, line.variantId)}
                        alt={p.name[locale]}
                        width="160"
                        height="200"
                      />
                    </Link>
                  )}
                  <div className="cart-product-info">
                    <p className="cart-sku">{v?.sku}</p>
                    <h2 id={`cart-product-${line.variantId}`}>
                      {p ? (
                        <Link to={`/product/${p.slug}`}>{p.name[locale]}</Link>
                      ) : (
                        t('unavailable')
                      )}
                    </h2>
                    <div className="cart-variant">
                      <span>
                        {color && (
                          <span
                            className="swatch"
                            style={{ background: color.hex }}
                            aria-hidden="true"
                          />
                        )}
                        {color?.name[locale]}
                      </span>
                      <span>
                        {t('size')} / {v?.size}
                      </span>
                    </div>
                    {!validLine(line) && <p className="field-error">{t('unavailable')}</p>}
                  </div>
                  <div className="cart-line-total">
                    <span>{t('subtotal')}</span>
                    <strong>
                      {money(p ? unitPrice(p, line.variantId) * line.quantity : 0, locale)}
                    </strong>
                  </div>
                  <div className="cart-row-footer">
                    <div className="cart-quantity-control">
                      <label htmlFor={`cart-quantity-${line.variantId}`}>{t('quantity')}</label>
                      <div className="cart-stepper">
                        <button
                          type="button"
                          aria-label={t('decreaseQuantity')}
                          disabled={line.quantity <= 1 || !v?.stock}
                          onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                        >
                          <Minus size={16} aria-hidden="true" />
                        </button>
                        <input
                          id={`cart-quantity-${line.variantId}`}
                          className="quantity"
                          type="number"
                          min="1"
                          max={v?.stock ?? 1}
                          value={line.quantity}
                          onChange={(e) => updateQuantity(line.variantId, Number(e.target.value))}
                        />
                        <button
                          type="button"
                          aria-label={t('increaseQuantity')}
                          disabled={!v || line.quantity >= v.stock}
                          onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                        >
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div className="cart-row-actions">
                      <VariantEditor productId={line.productId} variantId={line.variantId} />
                      <Button
                        className="secondary cart-remove"
                        onClick={() => cart.remove(owner, line.variantId)}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        {t('remove')}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
            <Link className="button secondary cart-continue" to="/shop">
              <ArrowLeft size={18} aria-hidden="true" />
              {t('continue')}
            </Link>
          </div>
          <aside className="summary-panel cart-summary">
            <h2>{t('total')}</h2>
            <Summary pricing={calculateTotal(calculateSubtotal(lines))} />
            <div className="cart-shipping-note">
              <Truck size={22} aria-hidden="true" />
              <p>{t('freeThreshold')}</p>
            </div>
            <Button className="full" disabled={!lines.every(validLine)} onClick={checkout}>
              {t('checkout')} <ArrowUpRight size={20} aria-hidden="true" />
            </Button>
          </aside>
        </div>
      )}
    </section>
  );
}
