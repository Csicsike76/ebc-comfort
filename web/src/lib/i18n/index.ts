import { hu } from './locales/hu';
import { en } from './locales/en';
import { de } from './locales/de';
import { fr } from './locales/fr';
import { it } from './locales/it';
import { es } from './locales/es';
import { pl } from './locales/pl';
import { ro } from './locales/ro';
import { nl } from './locales/nl';
import { pt } from './locales/pt';
import { cs } from './locales/cs';
import { sk } from './locales/sk';
import { sv } from './locales/sv';
import { da } from './locales/da';
import { fi } from './locales/fi';
import { bg } from './locales/bg';
import { hr } from './locales/hr';
import { et } from './locales/et';
import { el } from './locales/el';
import { ga } from './locales/ga';
import { lv } from './locales/lv';
import { lt } from './locales/lt';
import { mt } from './locales/mt';
import { sl } from './locales/sl';
import { Locale, DEFAULT_LOCALE, FALLBACK_LOCALE } from './config';

type Dict = typeof hu;

const dictionaries: Partial<Record<Locale, Dict>> = {
  hu,
  en: en as Dict,
  de: de as Dict,
  fr: fr as Dict,
  it: it as Dict,
  es: es as Dict,
  pl: pl as Dict,
  ro: ro as Dict,
  nl: nl as Dict,
  pt: pt as Dict,
  cs: cs as Dict,
  sk: sk as Dict,
  sv: sv as Dict,
  da: da as Dict,
  fi: fi as Dict,
  bg: bg as Dict,
  hr: hr as Dict,
  et: et as Dict,
  el: el as Dict,
  ga: ga as Dict,
  lv: lv as Dict,
  lt: lt as Dict,
  mt: mt as Dict,
  sl: sl as Dict,
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
