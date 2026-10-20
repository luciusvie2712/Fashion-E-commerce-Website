import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';
import { Link, Navigate, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocale } from '../i18n';
import { useAuth } from './store';
import { sanitizeInternalRedirect } from '../../lib/urls';
import { Button } from '../../components/ui';
import { DemoNotice, LocalImage } from '../../components/shared';
import { collectionPhoto } from '../../data/photography';
import { collections } from '../../data/catalog';
export function Protected() {
  const auth = useAuth(),
    location = useLocation();
  return auth.session && auth.profiles.some((p) => p.id === auth.session) ? (
    <Outlet />
  ) : (
    <Navigate
      replace
      to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
    />
  );
}
const schema = z.object({
  fullName: z.string(),
  email: z.email('emailError'),
  password: z.string(),
  confirmation: z.string(),
});
type Fields = z.infer<typeof schema>;
function PasswordField({
  id,
  label,
  registration,
  invalid,
}: {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  invalid: boolean;
}) {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input">
        <LockKeyhole size={18} aria-hidden="true" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete="off"
          {...registration}
          aria-invalid={invalid}
          aria-describedby={invalid ? 'auth-form-error auth-password-note' : 'auth-password-note'}
        />
        <button
          type="button"
          className="auth-password-toggle"
          aria-label={`${t(visible ? 'hidePassword' : 'showPassword')} · ${label}`}
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
export function AuthPage() {
  const { t, locale } = useLocale(),
    location = useLocation(),
    navigate = useNavigate(),
    [params] = useSearchParams(),
    auth = useAuth();
  const mode =
    location.pathname === '/register'
      ? 'register'
      : location.pathname === '/forgot-password'
        ? 'forgot'
        : 'login';
  const [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const shellRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const measure = () =>
      shell.style.setProperty(
        '--auth-top',
        `${shell.getBoundingClientRect().top + window.scrollY}px`,
      );
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    for (const element of document.querySelectorAll('.announcement, .header-dock'))
      observer?.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [mode, locale]);
  const form = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '', confirmation: '' },
  });
  const { reset } = form;
  useEffect(() => {
    reset();
    setError('');
    setNotice('');
  }, [mode, reset]);
  const authLink = (path: string) =>
    params.has('redirect')
      ? `${path}?redirect=${encodeURIComponent(sanitizeInternalRedirect(params.get('redirect')))}`
      : path;
  function submit(data: Fields) {
    setError('');
    if (
      mode !== 'forgot' &&
      (data.password.length < 8 || (mode === 'register' && data.password !== data.confirmation))
    ) {
      setError('passwordError');
      return;
    }
    if (mode === 'register' && data.fullName.trim().length < 2) {
      setError('invalid');
      return;
    }
    try {
      if (mode === 'forgot') {
        setNotice('resetNotice');
        form.reset();
        return;
      }
      if (mode === 'register') auth.register(data.fullName, data.email);
      else auth.login(data.email);
      form.reset();
      navigate(sanitizeInternalRedirect(params.get('redirect')));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'invalid');
    }
  }
  return (
    <section className="auth-page auth-shell" data-mode={mode} ref={shellRef}>
      <aside className="auth-visual">
        <div className="auth-photo">
          <LocalImage
            src={collectionPhoto('studio')}
            alt={collections.find((c) => c.id === 'studio')!.name[locale]}
            width="1536"
            height="1024"
          />
        </div>
        <div className="auth-visual-copy">
          <p className="eyebrow">FLUIVIX / STUDIO</p>
          <h2>{t('hero')}</h2>
          <p>{t('heroBody')}</p>
          <Link to="/collections/studio">
            {t('explore')} <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </aside>
      <div className="auth-form-panel">
        <header className="auth-heading">
          <span className="auth-heading-icon">
            <UserRound size={22} aria-hidden="true" />
          </span>
          <p className="eyebrow">FLUIVIX / DEMO</p>
          <h1>{t(mode)}</h1>
          <p className="auth-intro">
            {t(
              mode === 'register'
                ? 'registerIntro'
                : mode === 'forgot'
                  ? 'forgotIntro'
                  : 'loginIntro',
            )}
          </p>
        </header>
        <nav className="auth-tabs" aria-label={t('account')}>
          <Link to={authLink('/login')} aria-current={mode === 'login' ? 'page' : undefined}>
            {t('login')}
          </Link>
          <Link to={authLink('/register')} aria-current={mode === 'register' ? 'page' : undefined}>
            {t('register')}
          </Link>
        </nav>
        {mode === 'login' && (
          <div className="auth-demo-profile">
            <div>
              <span>{t('demoProfile')}</span>
              <span>demo@fluivix.local</span>
            </div>
            <button
              type="button"
              onClick={() => {
                form.setValue('email', 'demo@fluivix.local', { shouldValidate: true });
                form.setFocus('password');
              }}
            >
              {t('useDemoProfile')} <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        )}
        <form className="form" noValidate onSubmit={form.handleSubmit(submit)}>
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-name">{t('fullName')}</label>
              <div className="auth-input">
                <UserRound size={18} aria-hidden="true" />
                <input
                  id="auth-name"
                  autoComplete="name"
                  {...form.register('fullName')}
                  aria-invalid={error === 'invalid'}
                  aria-describedby={error === 'invalid' ? 'auth-form-error' : undefined}
                />
              </div>
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="auth-email">{t('email')}</label>
            <div className="auth-input">
              <Mail size={18} aria-hidden="true" />
              <input
                id="auth-email"
                aria-label={t('email')}
                autoComplete="email"
                type="email"
                {...form.register('email')}
                aria-invalid={!!form.formState.errors.email}
                aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
              />
            </div>
            {form.formState.errors.email && (
              <span className="field-error" id="email-error">
                {t(form.formState.errors.email.message ?? 'emailError')}
              </span>
            )}
          </div>
          {mode !== 'forgot' && (
            <PasswordField
              key={`${mode}-password`}
              id="auth-password"
              label={t('password')}
              registration={form.register('password')}
              invalid={error === 'passwordError'}
            />
          )}
          {mode === 'register' && (
            <PasswordField
              id="auth-confirmation"
              label={t('passwordConfirm')}
              registration={form.register('confirmation')}
              invalid={error === 'passwordError'}
            />
          )}
          {error && (
            <p className="field-error auth-feedback" id="auth-form-error" role="alert">
              <CircleAlert size={18} aria-hidden="true" />
              <span>{t(error)}</span>
            </p>
          )}
          {notice && (
            <p className="auth-feedback auth-success" role="status">
              {t(notice)}
            </p>
          )}
          <Button disabled={form.formState.isSubmitting}>
            {t(mode)} <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </form>
        <div className="auth-links">
          {mode !== 'forgot' && <Link to={authLink('/forgot-password')}>{t('forgot')}</Link>}
          <Link to="/shop">
            {t('continue')} <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="auth-disclosure">
          <p id="auth-password-note">{t('authCompactNote')}</p>
          <details>
            <summary>{t('demoDetails')}</summary>
            <DemoNotice />
            {mode !== 'forgot' && <p>{t('authNote')}</p>}
          </details>
        </div>
      </div>
    </section>
  );
}
