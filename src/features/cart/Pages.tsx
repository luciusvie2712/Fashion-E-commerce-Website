import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useLocale, money } from '../i18n';
import { useCart } from './store';
import { useOwner } from '../auth/store';
import { useWishlist } from '../wishlist/store';
import { findProduct, findVariant, products, colors, unitPrice } from '../../data/catalog';
import { calculateSubtotal, validLine } from './domain';
import { calculateTotal } from '../checkout/pricing';
import { Empty, ProductGrid, Summary } from '../../components/shared';
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
      trigger={<button className="text-button">{t('edit')}</button>}
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
  function checkout() {
    try {
      const intent = cart.start(owner, 'CART');
      navigate(intent.orderId ? `/checkout/payment?orderId=${intent.orderId}` : '/checkout');
    } catch (e) {
      toast.error(t(e instanceof Error ? e.message : 'unavailable'));
    }
  }
  return (
    <section className="container section">
      <div className="section-heading">
        <h1>{t('cart')}</h1>
        {lines.length > 0 && (
          <Confirm
            trigger={<button className="text-button">{t('clearCart')}</button>}
            onConfirm={() => cart.remove(owner)}
          />
        )}
      </div>
      {!lines.length ? (
        <Empty />
      ) : (
        <div className="two-column">
          <div>
            {lines.map((line) => {
              const p = findProduct(line.productId),
                v = findVariant(line.variantId);
              return (
                <article key={line.variantId} className="cart-row">
                  {p && (
                    <Link to={`/product/${p.slug}`}>
                      <img src={p.imageUrls[0]} alt={p.name[locale]} width="120" height="150" />
                    </Link>
                  )}
                  <div>
                    <h2>{p?.name[locale] ?? t('unavailable')}</h2>
                    <p className="small">{v?.sku}</p>
                    <p>
                      {colors.find((c) => c.id === v?.colorId)?.name[locale]} / {v?.size}
                    </p>
                    {!validLine(line) && <p className="field-error">{t('unavailable')}</p>}
                    <VariantEditor productId={line.productId} variantId={line.variantId} />
                    <label>
                      {t('quantity')}
                      <input
                        className="quantity"
                        type="number"
                        min="1"
                        max={v?.stock ?? 1}
                        value={line.quantity}
                        onChange={(e) => {
                          try {
                            cart.setQty(owner, line.variantId, Number(e.target.value));
                          } catch {
                            toast.error(t('stockError'));
                          }
                        }}
                      />
                    </label>
                    <button
                      className="text-button"
                      onClick={() => cart.remove(owner, line.variantId)}
                    >
                      {t('remove')}
                    </button>
                  </div>
                  <strong>
                    {money(p ? unitPrice(p, line.variantId) * line.quantity : 0, locale)}
                  </strong>
                </article>
              );
            })}
            <Link to="/shop">← {t('continue')}</Link>
          </div>
          <aside className="summary-panel">
            <h2>{t('total')}</h2>
            <Summary pricing={calculateTotal(calculateSubtotal(lines))} />
            <p>{t('freeThreshold')}</p>
            <Button className="full" disabled={!lines.every(validLine)} onClick={checkout}>
              {t('checkout')} ↗
            </Button>
          </aside>
        </div>
      )}
    </section>
  );
}
