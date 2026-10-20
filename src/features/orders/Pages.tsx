import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowUpRight, Clock3, MapPin, Package, Search, Truck } from 'lucide-react';
import { useLocale, money } from '../i18n';
import { useOwner, useAuth } from '../auth/store';
import { useOrders } from './store';
import { flow, returnFlow, canRequestReturn } from './domain';
import { useCart } from '../cart/store';
import { DemoNotice, Empty, Summary, OrderProduct, LocalImage } from '../../components/shared';
import { Button, Confirm } from '../../components/ui';
import type { Order } from '../../types/domain';
function OrderStatuses({ order: o }: { order: Order }) {
  const { t } = useLocale();
  return (
    <div className="order-statuses">
      <span className="status" data-status={o.fulfillmentStatus}>
        {t(o.fulfillmentStatus)}
      </span>
      <span className="status" data-status={o.paymentStatus}>
        {t(o.paymentStatus)}
      </span>
      {o.returnStatus !== 'NONE' && (
        <span className="status" data-status={o.returnStatus}>
          {t(o.returnStatus)}
        </span>
      )}
    </div>
  );
}
export function Receipt({ order: o }: { order: Order }) {
  const { t, locale } = useLocale();
  return (
    <>
      <OrderStatuses order={o} />
      <div className="receipt-layout">
        <section className="order-surface receipt-products">
          <h2>
            <Package size={22} aria-hidden="true" />
            {t('cart')}
          </h2>
          {o.items.map((item) => (
            <OrderProduct
              key={item.variantId}
              image={item.imageUrl}
              name={item.nameAtPurchase[locale]}
              color={item.colorNameAtPurchase[locale]}
              size={item.size}
              sku={item.sku}
              quantity={item.quantity}
              total={item.unitPriceVnd * item.quantity}
            />
          ))}
        </section>
        <div className="receipt-side">
          <section className="order-surface receipt-total">
            <h2>{t('total')}</h2>
            <Summary pricing={o.pricingSnapshot} />
          </section>
          <section className="order-surface order-address">
            <h2>
              <MapPin size={22} aria-hidden="true" />
              {t('recipient')}
            </h2>
            <p>
              <strong>{o.addressSnapshot.recipient}</strong>
              <br />
              {o.addressSnapshot.phone}
            </p>
            <p>
              {o.addressSnapshot.street}, {o.addressSnapshot.district}, {o.addressSnapshot.province}
            </p>
            <dl className="order-methods">
              <div>
                <dt>{t('shipping')}</dt>
                <dd>{t(o.shippingMethod === 'STANDARD' ? 'standard' : 'express')}</dd>
              </div>
              <div>
                <dt>{t('payment')}</dt>
                <dd>{t(o.paymentMethod === 'COD' ? 'cod' : 'online')}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
export function OrderDetail({ order, embedded = false }: { order: Order; embedded?: boolean }) {
  const { t, locale } = useLocale(),
    store = useOrders(),
    owner = useOwner(),
    cart = useCart(),
    navigate = useNavigate();
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    );
  function advance(status: Parameters<typeof store.transition>[2]) {
    try {
      store.transition(order.ownerId, order.id, status);
      toast.success(t('updated'));
    } catch (e) {
      toast.error(t(e instanceof Error ? e.message : 'transitionError'));
    }
  }
  const cancellable = flow[order.fulfillmentStatus].includes('CANCELLED');
  const Heading = embedded ? 'h2' : 'h1';
  return (
    <article className="order-detail">
      <header className="order-detail-heading">
        <div>
          <p className="eyebrow">
            {t('orderId')} / {order.id}
          </p>
          <Heading>{t('receipt')}</Heading>
        </div>
        <p className="order-date">
          <Clock3 size={17} aria-hidden="true" />
          <time dateTime={order.createdAt}>{date(order.createdAt)}</time>
        </p>
      </header>
      <Receipt order={order} />
      <section className="order-surface tracking-panel">
        <h2>
          <Truck size={23} aria-hidden="true" />
          {t('track')}
        </h2>
        <ol className="timeline">
          {order.timeline.map((event, i) => (
            <li key={i} aria-current={i === order.timeline.length - 1 ? 'step' : undefined}>
              <strong>{t(event.status)}</strong>
              <time dateTime={event.at}>{date(event.at)}</time>
            </li>
          ))}
        </ol>
      </section>
      {order.fulfillmentStatus === 'AWAITING_PAYMENT' && (
        <Link className="button" to={`/checkout/payment?orderId=${order.id}`}>
          {t('retry')}
        </Link>
      )}
      <div className="panel order-simulation">
        <h2>{t('simulate')}</h2>
        <p className="small">{t('localOnly')}</p>
        <div className="actions">
          {flow[order.fulfillmentStatus]
            .filter((s) => s !== 'CANCELLED')
            .map((s) => (
              <Button key={s} className="secondary" onClick={() => advance(s)}>
                {t(s)}
              </Button>
            ))}
        </div>
        <div className="actions">
          {cancellable ? (
            <Confirm
              title={t('cancelOrder')}
              onConfirm={() => advance('CANCELLED')}
              trigger={<Button className="secondary">{t('cancelOrder')}</Button>}
            />
          ) : (
            <div>
              <Button disabled className="secondary">
                {t('cancelOrder')}
              </Button>
              <p className="small">{t('cannotCancel')}</p>
            </div>
          )}
          {order.returnStatus === 'NONE' ? (
            <Button
              className="secondary"
              disabled={!canRequestReturn(order)}
              onClick={() => advance('REQUESTED')}
            >
              {t('return')}
            </Button>
          ) : (
            returnFlow[order.returnStatus].map((s) => (
              <Button className="secondary" key={s} onClick={() => advance(s)}>
                {t(s)}
              </Button>
            ))
          )}
        </div>
        <p className="small">{t('returnWindow')}</p>
      </div>
      <Button
        onClick={() => {
          let failed = false;
          for (const item of order.items) {
            try {
              cart.add(owner, {
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
              });
            } catch {
              failed = true;
            }
          }
          if (failed) toast.warning(t('unavailable'));
          navigate('/cart');
        }}
      >
        {t('reorder')}
      </Button>
    </article>
  );
}
export function OrderCard({ order: o }: { order: Order }) {
  const { t, locale } = useLocale();
  return (
    <Link className="order-card" to={`/account/orders/${o.id}`}>
      <div className="order-card-heading">
        <strong>{o.id}</strong>
        <time dateTime={o.createdAt}>
          {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(o.createdAt))}
        </time>
      </div>
      <OrderStatuses order={o} />
      <div className="order-card-body">
        {o.items[0] && (
          <LocalImage
            className="order-product-image"
            src={o.items[0].imageUrl}
            alt={o.items[0].nameAtPurchase[locale]}
            width="80"
            height="100"
          />
        )}
        <div className="order-card-info">
          <h2>{o.items[0]?.nameAtPurchase[locale]}</h2>
          <p>{t('results', { count: o.items.reduce((sum, item) => sum + item.quantity, 0) })}</p>
        </div>
        <div className="order-card-total">
          <span>{t('total')}</span>
          <strong>{money(o.pricingSnapshot.totalVnd, locale)}</strong>
        </div>
        <ArrowUpRight size={21} aria-hidden="true" />
      </div>
    </Link>
  );
}
export function Orders() {
  const { t } = useLocale(),
    owner = useOwner(),
    [status, setStatus] = useState(''),
    orders = useOrders().orders.filter((o) => o.ownerId === owner && o.ownerType === 'USER');
  const visible = orders.filter((o) => !status || o.fulfillmentStatus === status);
  return (
    <>
      <div className="orders-heading">
        <h1>{t('orders')}</h1>
        <label>
          {t('filters')}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t('all')}</option>
            {Object.keys(flow).map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!visible.length ? <Empty /> : visible.map((o) => <OrderCard key={o.id} order={o} />)}
    </>
  );
}
export function AccountOrder() {
  const { id } = useParams(),
    owner = useOwner(),
    order = useOrders((s) =>
      s.orders.find((o) => o.id === id && o.ownerId === owner && o.ownerType === 'USER'),
    );
  return order ? <OrderDetail order={order} /> : <Empty message="notFound" />;
}
export function Track() {
  const { t } = useLocale(),
    guest = useAuth((s) => s.guestId),
    [params, setParams] = useSearchParams(),
    [id, setId] = useState(params.get('orderId') ?? '');
  const order = useOrders((s) =>
    s.orders.find(
      (o) => o.id === params.get('orderId') && o.ownerId === guest && o.ownerType === 'GUEST',
    ),
  );
  return (
    <section className="container section tracking-page">
      <div className="tracking-hero">
        <div>
          <p className="eyebrow">
            FLUIVIX / <Package size={18} aria-hidden="true" />
          </p>
          <h1>{t('track')}</h1>
          <p className="muted">{t('trackingHint')}</p>
        </div>
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault();
            setParams({ orderId: id.trim() });
          }}
        >
          <label>
            {t('orderId')}
            <input value={id} onChange={(e) => setId(e.target.value)} required />
          </label>
          <Button>
            <Search size={18} aria-hidden="true" />
            {t('search')}
          </Button>
        </form>
      </div>
      <DemoNotice />
      {order ? (
        <div className="tracking-result">
          <OrderDetail order={order} embedded />
        </div>
      ) : params.has('orderId') ? (
        <Empty message="notFound" />
      ) : (
        <div className="tracking-empty">
          <Truck size={42} aria-hidden="true" />
          <p>{t('orderId')}</p>
          <span>{t('localOnly')}</span>
        </div>
      )}
    </section>
  );
}
