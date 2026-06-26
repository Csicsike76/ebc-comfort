import type { Metadata } from 'next';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';

export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ebc-comfort.netlify.app';

/**
 * Path-aware hreflang alternates + canonical for a public page. `path` is the
 * locale-less route (e.g. '' for home, '/termek'). Every page must set its OWN
 * canonical — otherwise all pages inherit the layout's homepage canonical and
 * Google treats sub-pages as duplicates of the home page.
 */
export function pageAlternates(locale: string, path: string): NonNullable<Metadata['alternates']> {
  const loc = (SUPPORTED_LOCALES as readonly string[]).includes(locale) ? locale : DEFAULT_LOCALE;
  const languages: Record<string, string> = {};
  for (const l of SUPPORTED_LOCALES) languages[l] = `${SITE}/${l}${path}`;
  languages['x-default'] = `${SITE}/${DEFAULT_LOCALE}${path}`;
  return { canonical: `${SITE}/${loc}${path}`, languages };
}
