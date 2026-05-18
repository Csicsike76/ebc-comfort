import { hu } from './locales/hu';
import { en } from './locales/en';
import { de } from './locales/de';
import { Locale, DEFAULT_LOCALE, FALLBACK_LOCALE } from './config';

type Dict = typeof hu;

const dictionaries: Partial<Record<Locale, Dict>> = {
  hu,
  en: en as Dict,
  de: de as Dict,
  // Other locales fall back to EN for now; will be populated later
};

export function getDict(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries[FALLBACK_LOCALE] ?? hu;
}

/** Helper for nested key lookup, e.g. tt('home.hero.title_line_1') */
export function tt(dict: Dict, key: string): string {
  const parts = key.split('.');
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  return typeof cur === 'string' ? cur : key;
}

export { DEFAULT_LOCALE, FALLBACK_LOCALE };
export type { Locale };
