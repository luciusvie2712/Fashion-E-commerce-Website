import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CheckCircle2, TicketPercent, X } from 'lucide-react';
import { useLocale, money } from '../i18n';
import { useAuth, useOwner } from '../auth/store';
import { useCart } from '../cart/store';
import { useOrders } from '../orders/store';
import { calculateSubtotal, validLine } from '../cart/domain';
import { calculateTotal, coupons } from './pricing';
import { contactSchema, addressFields, type ContactFields } from '../account/Pages';
import type { Payment, Shipping } from '../../types/domain';
import { Empty, Summary, DemoNotice, OrderProduct } from '../../components/shared';
import { Button } from '../../components/ui';
import { findProduct, findVariant, colors, unitPrice, variantImage } from '../../data/catalog';
import { Receipt } from '../orders/Pages';
export function Checkout() {
  const { t, locale } = useLocale(),
    owner = useOwner(),
    auth = useAuth(),
    cart = useCart(),
    orders = useOrders(),
    navigate = useNavigate();
  const intent = cart.intent;
  const [shipping, setShipping] = useState<Shipping>('STANDARD'),
    [payment, setPayment] = useState<Payment>('COD'),
    [coupon, setCoupon] = useState(''),
    [applied, setApplied] = useState(''),
    [error, setError] = useState('');
  const locked = useRef(false);
  const form = useForm<ContactFields>({
    resolver: zodResolver(contactSchema),
    defaultValues: { recipient: '', phone: '', province: '', district: '', street: '' },
  });
  if (!intent || intent.ownerId !== owner || !intent.items.length)
    return (
      <section className="container section">
        <h1>{t('checkout')}</h1>
        <Empty message="checkoutEmpty" to="/cart" />
      </section>
    );
  const subtotal = calculateSubtotal(intent.items),
    pricing = calculateTotal(subtotal, shipping, applied);
  function submit(values: ContactFields) {
    if (locked.current) return;
    if (!intent || !intent.items.every(validLine)) {
      setError('unavailable');
      return;
    }
    if (pricing.error) {
      setError(pricing.error);
      return;
    }
    locked.current = true;
    try {
      const order = orders.place(
        intent,
        { ...values, id: crypto.randomUUID(), ownerId: owner, isDefault: false },
        pricing,
        shipping,
        payment,
        auth.guestId,
      );
      navigate(
        `${order.paymentMethod === 'COD' ? '/checkout/success' : '/checkout/payment'}?orderId=${order.id}`,
      );
    } catch (e) {
      locked.current = false;
      setError(e instanceof Error ? e.message : 'invalid');
    }
  }
  return (
    <section className="container section checkout-page">
      <h1>{t('checkout')}</h1>
      <DemoNotice />
      <form className="two-column" noValidate onSubmit={form.handleSubmit(submit)}>
        <div className="form">
          <h2>{t('recipient')}</h2>
          {auth.session && (
            <label>
              {t('savedAddress')}
              <select
                defaultValue=""
                onChange={(e) => {
                  const a = auth.addresses.find(
                    (a) => a.id === e.target.value && a.ownerId === owner,
                  );
                  if (a) addressFields.forEach((k) => form.setValue(k, a[k]));
                }}
              >
                <option value="">—</option>
                {auth.addresses
                  .filter((a) => a.ownerId === owner)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.recipient} — {a.street}
                    </option>
                  ))}
              </select>
            </label>
          )}
          {addressFields.map((key) => (
            <label key={key}>
              {t(key)}
              <input
                aria-label={t(key)}
                {...form.register(key)}
                inputMode={key === 'phone' ? 'tel' : 'text'}
                aria-invalid={!!form.formState.errors[key]}
                aria-describedby={`checkout-${key}`}
              />
              {form.formState.errors[key] && (
                <span id={`checkout-${key}`} className="field-error">
                  {t(form.formState.errors[key]?.message ?? 'invalid')}
                </span>
              )}
            </label>
          ))}
          <fieldset>
            <legend>{t('shipping')}</legend>
            {(['STANDARD', 'EXPRESS'] as const).map((s) => (
              <label className="check" key={s}>
                <input
                  type="radio"
                  name="shipping"
                  checked={shipping === s}
                  onChange={() => {
                    setShipping(s);
                    setError('');
                  }}
                />
                {t(s === 'STANDARD' ? 'standard' : 'express')}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>{t('payment')}</legend>
            {(['COD', 'ONLINE_DEMO'] as const).map((p) => (
              <label className="check" key={p}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === p}
                  onChange={() => setPayment(p)}
                />
                {t(p === 'COD' ? 'cod' : 'online')}
              </label>
            ))}
          </fieldset>
        </div>
        <aside className="summary-panel checkout-summary">
          <h2>{t('cart')}</h2>
          <div className="checkout-products">
            {intent.items.map((line) => {
              const product = findProduct(line.productId),
                variant = findVariant(line.variantId);
              return product && variant ? (
                <OrderProduct
                  key={line.variantId}
                  image={variantImage(product, variant.id)}
                  name={product.name[locale]}
                  color={colors.find((c) => c.id === variant.colorId)!.name[locale]}
                  size={variant.size}
                  quantity={line.quantity}
                  sku={variant.sku}
                  total={unitPrice(product, variant.id) * line.quantity}
                />
              ) : (
                <p className="field-error" key={line.variantId}>
                  {t('unavailable')}
                </p>
              );
            })}
          </div>
          <section className="coupon-panel" aria-labelledby="coupon-heading">
            <h3 id="coupon-heading">
              <TicketPercent size={21} aria-hidden="true" />
              {t('coupon')}
            </h3>
            <div className="coupon-form">
              <label>
                <span className="sr-only">{t('coupon')}</span>
                <input
                  aria-describedby={`coupon-suggestions${(error || pricing.error)?.startsWith('coupon') ? ' checkout-pricing-error' : ''}`}
                  aria-invalid={!!(error || pricing.error)?.startsWith('coupon')}
                  value={coupon}
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => setCoupon(e.target.value)}
                />
              </label>
              <Button
                type="button"
                className="secondary"
                onClick={() => {
                  const result = calculateTotal(subtotal, shipping, coupon);
                  if (result.error) {
                    setApplied('');
                    setError(result.error);
                  } else {
                    setApplied(result.couponCode ?? '');
                    setError('');
                    toast.success(t('couponApplied'));
                  }
                }}
              >
                {t('apply')}
              </Button>
            </div>
            <p id="coupon-suggestions" className="coupon-suggestions-label">
              {t('couponSuggestions')}
            </p>
            <div className="coupon-suggestions">
              {coupons
                .filter((c) => ['FLUIVIX10', 'FREESHIP'].includes(c.code))
                .map((c) => (
                  <button
                    type="button"
                    key={c.code}
                    className="coupon-ticket"
                    aria-pressed={coupon.trim().toUpperCase() === c.code}
                    onClick={() => {
                      setCoupon(c.code);
                      setError('');
                    }}
                  >
                    <span>{c.code}</span>
                    <small>
                      {t(c.type === 'SHIPPING' ? 'couponShippingHint' : 'couponPercentHint', {
                        min: money(c.min, locale),
                        cap: money(c.cap, locale),
                      })}
                    </small>
                  </button>
                ))}
            </div>
            {applied && (
              <div className="coupon-applied" data-invalid={!!pricing.error} role="status">
                {!pricing.error && <CheckCircle2 size={18} aria-hidden="true" />}
                <span>
                  {t(pricing.error ? 'coupon' : 'couponApplied')} <strong>{applied}</strong>
                </span>
                <button
                  type="button"
                  className="icon"
                  aria-label={`${t('remove')} ${applied}`}
                  onClick={() => {
                    setApplied('');
                    setCoupon('');
                    setError('');
                  }}
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </div>
            )}
          </section>
          {(error || pricing.error) && (
            <p className="field-error" id="checkout-pricing-error" role="alert">
              {t(error || pricing.error!)}
            </p>
          )}
          <Summary pricing={pricing} />
          <p>{t('freeThreshold')}</p>
          <Button
            type="submit"
            className="full"
            disabled={form.formState.isSubmitting || !!pricing.error}
          >
            {t('placeOrder')}
          </Button>
          <p>{t('localOnly')}</p>
        </aside>
      </form>
    </section>
  );
}
export function PaymentPage() {
  const { t } = useLocale(),
    owner = useOwner(),
    [params] = useSearchParams(),
    orders = useOrders(),
    navigate = useNavigate();
  const order = orders.orders.find(
    (o) =>
      o.id === params.get('orderId') && o.ownerId === owner && o.paymentMethod === 'ONLINE_DEMO',
  );
  if (!order || order.fulfillmentStatus !== 'AWAITING_PAYMENT')
    return (
      <section className="container section">
        <h1>{t('payment')}</h1>
        <Empty message="notFound" />
      </section>
    );
  function pay(outcome: 'success' | 'failure' | 'cancel' | 'retry') {
    orders.pay(owner, order!.id, outcome);
    if (outcome === 'success') navigate(`/checkout/success?orderId=${order!.id}`);
  }
  return (
    <section className="container section reading">
      <h1>{t('online')}</h1>
      <DemoNotice />
      <p>
        {t('orderId')}: <strong>{order.id}</strong>
      </p>
      <p className="status" role="status">
        {t(order.paymentStatus)}
      </p>
      <Summary pricing={order.pricingSnapshot} />
      {order.paymentStatus === 'FAILED' ? (
        <Button onClick={() => pay('retry')}>{t('retry')}</Button>
      ) : (
        <div className="actions">
          <Button onClick={() => pay('success')}>{t('simulateSuccess')}</Button>
          <Button className="secondary" onClick={() => pay('failure')}>
            {t('simulateFailure')}
          </Button>
          <Button className="secondary" onClick={() => pay('cancel')}>
            {t('cancelPayment')}
          </Button>
        </div>
      )}
      <p className="section">
        <Link to={authOrderLink(order.ownerType, order.id)}>{t('receipt')} ↗</Link>
      </p>
    </section>
  );
}
export const authOrderLink = (type: string, id: string) =>
  type === 'USER' ? `/account/orders/${id}` : `/track-order?orderId=${id}`;
export function SuccessPage() {
  const { t, locale } = useLocale(),
    owner = useOwner(),
    [params] = useSearchParams(),
    order = useOrders((s) =>
      s.orders.find((o) => o.id === params.get('orderId') && o.ownerId === owner),
    );
  if (!order || !order.consumed)
    return (
      <section className="container section">
        <h1>{t('receipt')}</h1>
        <Empty message="notFound" />
      </section>
    );
  return (
    <section className="container section order-success">
      <p className="eyebrow">FLUIVIX / DEMO</p>
      <h1>{t('success')}</h1>
      <DemoNotice />
      <p>
        {t('orderId')}: <strong>{order.id}</strong>
      </p>
      <p>{money(order.pricingSnapshot.totalVnd, locale)}</p>
      <Receipt order={order} />
      <Link className="button" to={authOrderLink(order.ownerType, order.id)}>
        {t('track')} ↗
      </Link>
    </section>
  );
}
