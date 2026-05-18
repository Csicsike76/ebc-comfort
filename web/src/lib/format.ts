import type { Locale } from './i18n/config';

/**
 * Maps a 2-letter locale to the BCP-47 tag we use for Intl.NumberFormat /
 * Intl.DateTimeFormat. Keeping a single source of truth so we never hardcode
 * `hu-HU` or `en-US` again.
 */
const BCP47: Record<Locale, string> = {
  hu: 'hu-HU',
  en: 'en-GB',
  de: 'de-DE',
  fr: 'fr-FR',
  it: 'it-IT',
  es: 'es-ES',
  pl: 'pl-PL',
  ro: 'ro-RO',
  nl: 'nl-NL',
  pt: 'pt-PT',
  cs: 'cs-CZ',
  sk: 'sk-SK',
  sv: 'sv-SE',
  da: 'da-DK',
  fi: 'fi-FI',
  bg: 'bg-BG',
  hr: 'hr-HR',
  et: 'et-EE',
  el: 'el-GR',
  ga: 'ga-IE',
  lv: 'lv-LV',
  lt: 'lt-LT',
  mt: 'mt-MT',
  sl: 'sl-SI',
};

export function bcp47(locale: Locale): string {
  return BCP47[locale] ?? 'en-GB';
}

export function formatMoney(amountCents: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(bcp47(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(bcp47(locale)).format(value);
}

export function formatDate(value: string | Date, locale: Locale): string {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(bcp47(locale), {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(d);
}
