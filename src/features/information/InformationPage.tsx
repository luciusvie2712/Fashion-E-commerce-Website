import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  Ruler,
  ShieldCheck,
  Truck,
  Undo2,
} from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { DemoNotice, SizeTable } from '../../components/shared';
import { stories } from '../../data/content';
import { money, useLocale } from '../i18n';
import { informationCopy as copy } from './content';

export type InformationKind =
  'shippingPolicy' | 'returnPolicy' | 'privacyPolicy' | 'terms' | 'sizeGuide';
const definitions = {
  shippingPolicy: { icon: Truck, intro: 'shippingIntro' },
  returnPolicy: { icon: Undo2, intro: 'returnIntro' },
  privacyPolicy: { icon: ShieldCheck, intro: 'privacyIntro' },
  terms: { icon: FileText, intro: 'termsIntro' },
  sizeGuide: { icon: Ruler, intro: 'sizeIntro' },
} as const;
const links = [
  ['/shipping-policy', 'shippingPolicy'],
  ['/return-policy', 'returnPolicy'],
  ['/size-guide', 'sizeGuide'],
  ['/privacy-policy', 'privacyPolicy'],
  ['/terms', 'terms'],
] as const;

export function InformationPage({ kind }: { kind: InformationKind }) {
  const { t, locale } = useLocale();
  const { icon: Icon, intro } = definitions[kind];
  const story = kind === 'sizeGuide' ? null : stories[kind];
  const headings = story
    ? [story[0][locale], story[2][locale]]
    : [copy.howMeasure[locale], copy.sizeChart[locale]];
  const facts =
    kind === 'shippingPolicy'
      ? [
          [money(30000, locale), copy.standardName[locale]],
          [money(49000, locale), copy.expressName[locale]],
          [money(599000, locale), `${copy.freeThreshold[locale]} · ${copy.afterDiscount[locale]}`],
        ]
      : kind === 'returnPolicy'
        ? [
            [copy.sevenDays[locale], copy.fromDelivery[locale]],
            [copy.deliveredOnly[locale], copy.eligible[locale]],
            [copy.noTransfer[locale], copy.refundDemo[locale]],
          ]
        : kind === 'privacyPolicy'
          ? [
              [copy.browser[locale], copy.localData[locale]],
              [copy.noPasswords[locale], copy.noCards[locale]],
              [copy.control[locale], copy.resetHint[locale]],
            ]
          : [
              [copy.demoOnly[locale], copy.noContract[locale]],
              [copy.sampleData[locale], copy.sampleDetails[locale]],
              [copy.localLimit[locale], copy.localLimitHint[locale]],
            ];
  return (
    <div className="information-page container">
      <header className="information-heading">
        <p className="eyebrow">FLUIVIX / {t('footerSupport')}</p>
        <div className="information-title">
          <div>
            <h1>{t(kind)}</h1>
            <p>{copy[intro][locale]}</p>
          </div>
          <span className="information-mark">
            <Icon size={38} strokeWidth={1.2} aria-hidden="true" />
          </span>
        </div>
        <DemoNotice />
      </header>
      <div className="information-layout">
        <aside className="information-sidebar">
          <nav aria-label={copy.contents[locale]} className="information-toc">
            <p className="eyebrow">{copy.contents[locale]}</p>
            {headings.map((heading, index) => (
              <a key={index} href={`#info-section-${index}`}>
                <span aria-hidden="true">0{index + 1}</span>
                {heading}
              </a>
            ))}
          </nav>
          <nav className="information-related" aria-label={copy.related[locale]}>
            <p className="eyebrow">{copy.related[locale]}</p>
            {links.map(([to, key]) => (
              <NavLink key={to} to={to}>
                {t(key)}
                <ArrowUpRight size={14} aria-hidden="true" />
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="information-content">
          {kind === 'sizeGuide' ? (
            <>
              <section className="information-section" id="info-section-0">
                <p className="eyebrow">01 /</p>
                <h2>{copy.howMeasure[locale]}</h2>
                <div className="measurement-guide">
                  <svg viewBox="0 0 240 360" role="img" aria-label={copy.measureAlt[locale]}>
                    <title>{copy.measureAlt[locale]}</title>
                    <rect width="240" height="360" rx="8" fill="#eaece3" />
                    <circle cx="120" cy="51" r="23" fill="none" stroke="#65765e" strokeWidth="2" />
                    <path
                      d="M102 80 72 97 51 170 66 177 88 124 94 163 85 219 88 320 109 320 120 238 131 320 152 320 155 219 146 163 152 124 174 177 189 170 168 97 138 80"
                      fill="#d7dfcb"
                      stroke="#65765e"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    {[125, 165, 214].map((y, i) => (
                      <g key={y}>
                        <path
                          d={`M77 ${y}h86`}
                          stroke="#963f2b"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                        />
                        <circle cx="190" cy={y} r="12" fill="#354739" />
                        <text x="190" y={y + 4} fill="#fff" textAnchor="middle" fontSize="12">
                          {i + 1}
                        </text>
                      </g>
                    ))}
                  </svg>
                  <ol>
                    {(['chestHint', 'waistHint', 'hipsHint'] as const).map((hint, i) => (
                      <li key={hint}>
                        <span aria-hidden="true">0{i + 1}</span>
                        <div>
                          <h3>{t(['chest', 'waist', 'hips'][i])}</h3>
                          <p>{copy[hint][locale]}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
              <section className="information-section size-chart-panel" id="info-section-1">
                <p className="eyebrow">02 /</p>
                <h2>{copy.sizeChart[locale]}</h2>
                <p>{copy.sizeNote[locale]}</p>
                <SizeTable showIntro={false} scrollHint={copy.scrollHint[locale]} />
                <div className="information-tip">
                  <Check size={21} aria-hidden="true" />
                  <div>
                    <h3>{copy.fitTip[locale]}</h3>
                    <p>{t('measure')}</p>
                  </div>
                </div>
                <Link className="button" to="/shop">
                  {t('shop')}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </section>
            </>
          ) : (
            <>
              <section className="information-overview" aria-label={copy.overview[locale]}>
                {facts.map(([title, body]) => (
                  <div key={title}>
                    <Check size={18} aria-hidden="true" />
                    <h2>{title}</h2>
                    <p>{body}</p>
                  </div>
                ))}
              </section>
              {headings.map((heading, index) => (
                <section className="information-section" id={`info-section-${index}`} key={index}>
                  <p className="eyebrow">0{index + 1} /</p>
                  <h2>{heading}</h2>
                  <p className="policy-body">{story![index * 2 + 1][locale]}</p>
                  {kind === 'shippingPolicy' && index === 1 && (
                    <div
                      className="information-table"
                      role="region"
                      aria-label={copy.fees[locale]}
                      tabIndex={0}
                    >
                      <p className="table-scroll-hint">{copy.scrollHint[locale]}</p>
                      <table>
                        <caption>{copy.fees[locale]}</caption>
                        <thead>
                          <tr>
                            <th scope="col">{copy.method[locale]}</th>
                            <th scope="col">{copy.fee[locale]}</th>
                            <th scope="col">{copy.condition[locale]}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row">{copy.standardName[locale]}</th>
                            <td>{money(30000, locale)}</td>
                            <td>
                              {copy.freeThreshold[locale]}: {copy.afterDiscount[locale]}{' '}
                              {money(599000, locale)}
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">{copy.expressName[locale]}</th>
                            <td>{money(49000, locale)}</td>
                            <td>{copy.expressNote[locale]}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  {kind === 'returnPolicy' && index === 0 && (
                    <div className="return-process">
                      <h3>{copy.returnSteps[locale]}</h3>
                      <ol>
                        {(['request', 'review', 'decision', 'refund'] as const).map((step, i) => (
                          <li key={step}>
                            <span aria-hidden="true">0{i + 1}</span>
                            {copy[step][locale]}
                          </li>
                        ))}
                      </ol>
                      <p>{copy.stepsHint[locale]}</p>
                      <Link to="/track-order">
                        {t('track')}
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                  {kind === 'privacyPolicy' && index === 0 && (
                    <ul className="privacy-data-list">
                      {['cart', 'wishlist', 'profile', 'addresses', 'orders'].map((key) => (
                        <li key={key}>
                          <Check size={15} aria-hidden="true" />
                          {t(key)}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
              <p className="information-sample">
                <ShieldCheck size={20} aria-hidden="true" />
                {t('samplePolicy')}
              </p>
            </>
          )}
          <section className="information-help">
            <div>
              <h2>{copy.help[locale]}</h2>
              <p>{copy.helpBody[locale]}</p>
            </div>
            <div>
              <Link to="/faq">
                {t('faq')}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
              <Link to="/contact">
                {t('contact')}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
