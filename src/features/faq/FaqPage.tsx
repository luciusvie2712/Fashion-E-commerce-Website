import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  ArrowUpRight,
  CircleHelp,
  Grid2X2,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import { DemoNotice } from '../../components/shared';
import { faq } from '../../data/content';
import { normalizeVietnameseSearch } from '../../lib/urls';
import { useLocale } from '../i18n';
import { faqCopy as copy, faqMeta, faqTopics } from './content';

const icons = { all: Grid2X2, shopping: ShoppingBag, delivery: Package, demo: ShieldCheck };

export function FaqPage() {
  const { t, locale } = useLocale();
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState<number | null>(0);
  const searchInput = useRef<HTMLInputElement>(null);
  const triggers = useRef(new Map<number, HTMLButtonElement>());
  const query = params.get('q') ?? '';
  const topic = faqTopics.find((item) => item.id === params.get('topic'))?.id ?? 'all';
  const search = normalizeVietnameseSearch(query.trim());
  const visible = faq
    .map(([question, answer], id) => ({ question, answer, id, ...faqMeta[id] }))
    .filter(
      (item) =>
        (topic === 'all' || item.topic === topic) &&
        (!search ||
          normalizeVietnameseSearch(`${item.question[locale]} ${item.answer[locale]}`).includes(
            search,
          )),
    );

  const changeQuery = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set('q', value);
    else next.delete('q');
    setParams(next, { replace: true, preventScrollReset: true });
  };
  return (
    <div className="faq-page container">
      <header className="faq-heading">
        <p className="eyebrow">FLUIVIX / {t('faq')}</p>
        <h1>{t('faq')}</h1>
        <p>{copy.intro[locale]}</p>
        <div className="faq-search">
          <Search size={21} aria-hidden="true" />
          <input
            ref={searchInput}
            type="search"
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            aria-label={copy.search[locale]}
            placeholder={copy.placeholder[locale]}
          />
          {query && (
            <button
              type="button"
              aria-label={copy.clear[locale]}
              onClick={() => {
                changeQuery('');
                searchInput.current?.focus();
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <div className="faq-layout">
        <aside className="faq-sidebar">
          <p className="eyebrow" id="faq-topics-label">
            {copy.topics[locale]}
          </p>
          <div className="faq-topics" role="group" aria-labelledby="faq-topics-label">
            {faqTopics.map((item) => {
              const Icon = icons[item.icon];
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={topic === item.id}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    if (item.id === 'all') next.delete('topic');
                    else next.set('topic', item.id);
                    setParams(next, { preventScrollReset: true });
                  }}
                >
                  <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
                  <span>{copy[item.id][locale]}</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <div className="faq-sidebar-note">
            <ShieldCheck size={22} strokeWidth={1.4} aria-hidden="true" />
            <span>{t('samplePolicy')}</span>
          </div>
        </aside>

        <section className="faq-results" aria-labelledby="faq-results-title">
          <div className="faq-results-heading">
            <h2 id="faq-results-title">{copy.answers[locale]}</h2>
            <p role="status">
              {copy.count[locale]}:{' '}
              <span>{new Intl.NumberFormat(locale).format(visible.length)}</span>
            </p>
          </div>
          <div className="faq-list">
            {visible.map((item, index) => {
              const expanded = open === item.id;
              return (
                <article className="faq-item" key={item.id} data-open={expanded}>
                  <h3>
                    <button
                      id={`faq-question-${item.id}`}
                      aria-expanded={expanded}
                      aria-controls={`faq-answer-${item.id}`}
                      ref={(node) => {
                        if (node) triggers.current.set(item.id, node);
                        else triggers.current.delete(item.id);
                      }}
                      onClick={() => setOpen(expanded ? null : item.id)}
                      onKeyDown={(event) => {
                        const next =
                          event.key === 'ArrowDown'
                            ? (index + 1) % visible.length
                            : event.key === 'ArrowUp'
                              ? (index - 1 + visible.length) % visible.length
                              : event.key === 'Home'
                                ? 0
                                : event.key === 'End'
                                  ? visible.length - 1
                                  : null;
                        if (next !== null) {
                          event.preventDefault();
                          triggers.current.get(visible[next].id)?.focus();
                        }
                      }}
                    >
                      <span className="faq-number" aria-hidden="true">
                        {String(item.id + 1).padStart(2, '0')}
                      </span>
                      <span>{item.question[locale]}</span>
                      <span className="faq-toggle">
                        <Plus size={18} aria-hidden="true" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-answer-${item.id}`}
                    className="faq-answer"
                    role="region"
                    aria-labelledby={`faq-question-${item.id}`}
                    aria-hidden={!expanded}
                    inert={!expanded}
                  >
                    <div>
                      <div className="faq-answer-copy">
                        <p>{item.answer[locale]}</p>
                        <Link to={item.to}>
                          {t(item.label)} <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {!visible.length && (
            <div className="faq-empty">
              <Search size={32} strokeWidth={1.2} aria-hidden="true" />
              <h3>{copy.empty[locale]}</h3>
              <p>{copy.emptyHint[locale]}</p>
              <button
                className="button secondary"
                onClick={() => setParams({}, { preventScrollReset: true })}
              >
                {copy.reset[locale]}
              </button>
            </div>
          )}
        </section>
      </div>

      <section className="faq-help" aria-labelledby="faq-help-title">
        <div className="faq-help-icon">
          <CircleHelp size={32} strokeWidth={1.25} aria-hidden="true" />
        </div>
        <div>
          <h2 id="faq-help-title">{copy.help[locale]}</h2>
          <p>{copy.helpBody[locale]}</p>
        </div>
        <Link className="button light" to="/contact">
          {t('contact')}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </section>
      <div className="faq-disclosure">
        <DemoNotice />
      </div>
    </div>
  );
}
