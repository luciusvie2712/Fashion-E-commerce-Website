import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowUpRight,
  CheckCircle2,
  CircleHelp,
  LockKeyhole,
  MoveRight,
  Package,
  Ruler,
} from 'lucide-react';
import { DemoNotice, LocalImage } from '../../components/shared';
import { Button } from '../../components/ui';
import { aboutPhoto } from '../../data/photography';
import { useLocale } from '../i18n';
import { contactCopy as copy } from './content';

const schema = z.object({
  name: z.string().trim().min(2, 'nameError').max(100, 'nameError'),
  email: z.string().trim().pipe(z.email('emailError')),
  message: z.string().trim().min(10, 'messageError').max(2000, 'messageError'),
});
type Fields = z.infer<typeof schema>;
const helpLinks = [
  { to: '/faq', label: 'faq', hint: 'faqHint', icon: CircleHelp },
  { to: '/size-guide', label: 'sizeGuide', hint: 'sizeHint', icon: Ruler },
  { to: '/track-order', label: 'track', hint: 'orderHint', icon: Package },
] as const;

export function ContactPage() {
  const { t, locale } = useLocale();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: '' },
  });
  const errorText = (field: keyof Fields) =>
    field === 'email'
      ? t('emailError')
      : copy[field === 'name' ? 'nameError' : 'messageError'][locale];
  return (
    <div className="contact-page container">
      <header className="contact-heading">
        <p className="eyebrow">FLUIVIX / {t('contact')}</p>
        <div>
          <h1>{copy.heading[locale]}</h1>
          <p>{copy.intro[locale]}</p>
        </div>
      </header>
      <div className="contact-layout">
        <aside className="contact-studio">
          <LocalImage src={aboutPhoto} alt={t('atelierImageAlt')} width="1600" height="1000" />
          <div className="contact-studio-copy">
            <p className="eyebrow">FLUIVIX</p>
            <h2>{copy.studioTitle[locale]}</h2>
            <p>{copy.studioBody[locale]}</p>
            <Link to="/about">
              {t('about')} <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </aside>
        <section className="contact-form-panel" aria-labelledby="contact-form-title">
          <div className="contact-form-heading">
            <h2 id="contact-form-title">{copy.formTitle[locale]}</h2>
            <p>{copy.formIntro[locale]}</p>
          </div>
          <form
            className="form field-grid contact-form"
            noValidate
            aria-labelledby="contact-form-title"
            onChange={() => setSent(false)}
            onSubmit={handleSubmit(
              () => {
                reset();
                setSent(true);
              },
              () => setSent(false),
            )}
          >
            {(['name', 'email'] as const).map((field) => (
              <div className="contact-field" key={field}>
                <label htmlFor={`contact-${field}`}>
                  {t(field === 'name' ? 'fullName' : 'email')}
                </label>
                <input
                  id={`contact-${field}`}
                  type={field === 'email' ? 'email' : 'text'}
                  {...register(field)}
                  required
                  autoComplete="off"
                  aria-invalid={!!errors[field]}
                  aria-describedby={errors[field] ? `contact-${field}-error` : undefined}
                />
                {errors[field] && (
                  <span className="field-error" id={`contact-${field}-error`}>
                    {errorText(field)}
                  </span>
                )}
              </div>
            ))}
            <div className="contact-field contact-wide">
              <label htmlFor="contact-message">{t('message')}</label>
              <textarea
                id="contact-message"
                {...register('message')}
                required
                minLength={10}
                maxLength={2000}
                aria-invalid={!!errors.message}
                aria-describedby={`contact-message-hint${errors.message ? ' contact-message-error' : ''}`}
              />
              <p className="contact-hint" id="contact-message-hint">
                {copy.messageHint[locale]}
              </p>
              {errors.message && (
                <span className="field-error" id="contact-message-error">
                  {errorText('message')}
                </span>
              )}
            </div>
            {Object.keys(errors).length > 0 && (
              <p className="contact-feedback contact-wide field-error" role="alert">
                {t('invalid')}
              </p>
            )}
            {sent && (
              <p className="contact-feedback contact-success contact-wide" role="status">
                <CheckCircle2 size={19} aria-hidden="true" />
                {copy.success[locale]}
              </p>
            )}
            <Button className="contact-wide">
              {t('send')} <MoveRight size={19} aria-hidden="true" />
            </Button>
          </form>
          <p className="contact-privacy">
            <LockKeyhole size={16} aria-hidden="true" />
            <span>{copy.privacy[locale]}</span>
          </p>
        </section>
      </div>
      <section className="contact-help" aria-labelledby="contact-help-title">
        <h2 id="contact-help-title">{copy.support[locale]}</h2>
        <div className="contact-help-grid">
          {helpLinks.map(({ to, label, hint, icon: Icon }) => (
            <Link to={to} key={to}>
              <Icon size={23} strokeWidth={1.5} aria-hidden="true" />
              <span>
                <strong>{t(label)}</strong>
                <span>{copy[hint][locale]}</span>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
      <div className="contact-disclosure">
        <DemoNotice />
      </div>
    </div>
  );
}
