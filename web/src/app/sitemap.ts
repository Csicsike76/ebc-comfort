import type { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ebc-comfort.netlify.app';

const PUBLIC_PATHS = [
  '',
  '/termek',
  '/edukacio',
  '/tamogatas',
  '/rolunk',
  '/gyik',
  '/aszf',
  '/adatvedelem',
  '/cookie-tajekoztato',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const path of PUBLIC_PATHS) {
      entries.push({
        url: `${SITE}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === '' || path === '/termek' ? 'weekly' : 'monthly',
        priority: path === '' ? 1.0 : path === '/termek' ? 0.9 : 0.6,
        alternates: {
          languages: {
            ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, `${SITE}/${l}${path}`])),
            'x-default': `${SITE}/${DEFAULT_LOCALE}${path}`,
          },
        },
      });
    }
  }

  return entries;
}
