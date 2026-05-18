export const SUPPORTED_LOCALES = [
  'hu', 'en', 'de', 'fr', 'it', 'es',
  'pl', 'ro', 'nl', 'pt', 'cs', 'sk',
  'sv', 'da', 'fi',
] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'hu';
export const FALLBACK_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  hu: 'Magyar',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  es: 'Español',
  pl: 'Polski',
  ro: 'Română',
  nl: 'Nederlands',
  pt: 'Português',
  cs: 'Čeština',
  sk: 'Slovenčina',
  sv: 'Svenska',
  da: 'Dansk',
  fi: 'Suomi',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  hu: '🇭🇺',
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  it: '🇮🇹',
  es: '🇪🇸',
  pl: '🇵🇱',
  ro: '🇷🇴',
  nl: '🇳🇱',
  pt: '🇵🇹',
  cs: '🇨🇿',
  sk: '🇸🇰',
  sv: '🇸🇪',
  da: '🇩🇰',
  fi: '🇫🇮',
};

export function isValidLocale(loc: string): loc is Locale {
  return SUPPORTED_LOCALES.includes(loc as Locale);
}

export function resolveLocaleFromHeader(acceptLang: string | null): Locale {
  if (!acceptLang) return DEFAULT_LOCALE;
  const codes = acceptLang
    .split(',')
    .map((p) => p.split(';')[0].trim().toLowerCase().split('-')[0]);
  for (const c of codes) {
    if (isValidLocale(c)) return c;
  }
  return DEFAULT_LOCALE;
}
