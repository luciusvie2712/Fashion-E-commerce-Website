import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { locales, type Locale } from '../../types/domain';
import { resources } from './dictionaries';
let stored: string | null = null;
try {
  stored = localStorage.getItem('fluivix:v1:locale');
} catch {
  /* memory-only locale */
}
export const validLocale = (value: unknown): Locale =>
  locales.includes(value as Locale) ? (value as Locale) : 'vi';
void i18n.use(initReactI18next).init({
  resources,
  lng: validLocale(stored),
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});
const apply = (language: string) => {
  const locale = validLocale(language);
  document.documentElement.lang = locale;
  try {
    localStorage.setItem('fluivix:v1:locale', locale);
  } catch {
    /* UI remains usable */
  }
};
i18n.on('languageChanged', apply);
apply(i18n.language);
export function useLocale() {
  const { t, i18n } = useTranslation();
  return {
    t,
    locale: validLocale(i18n.language),
    changeLanguage: (value: string) => i18n.changeLanguage(validLocale(value)),
  };
}
export const money = (value: number, locale: Locale) =>
  new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
export default i18n;
