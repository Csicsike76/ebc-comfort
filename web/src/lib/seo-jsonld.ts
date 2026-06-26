// schema.org JSON-LD builders — help search engines + AI assistants understand
// and surface the site. Each returns a plain object rendered via <JsonLd/>.
import { SITE } from '@/lib/seo';

const LOGO = `${SITE}/brand/logo-luxus.png`;
const ORG_NAME = 'EBC Comfort';

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    legalName: 'EBC Wellness',
    url: SITE,
    logo: LOGO,
    image: LOGO,
    description:
      'EBC Comfort — discreet, portable warmth for lower-abdominal comfort. A wellness device (not a medical device) with a supported-access NGO programme for low-income women.',
    knowsAbout: ["women's health", 'heat therapy', 'wellness', 'menstrual comfort'],
  };
}

export function websiteLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG_NAME,
    url: SITE,
    inLanguage: locale,
    publisher: { '@type': 'Organization', name: ORG_NAME, logo: LOGO },
  };
}

interface ProductLdInput {
  locale: string;
  path: string;          // e.g. '/termek'
  name: string;
  description: string;
  sku?: string | null;
  image?: string | null;
  priceCents: number;
  currency: string;
  inStock: boolean;      // false pre-launch -> PreOrder
}

export function productLd(p: ProductLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    ...(p.sku ? { sku: p.sku } : {}),
    ...(p.image ? { image: p.image.startsWith('http') ? p.image : `${SITE}${p.image}` } : { image: LOGO }),
    brand: { '@type': 'Brand', name: ORG_NAME },
    offers: {
      '@type': 'Offer',
      url: `${SITE}/${p.locale}${p.path}`,
      priceCurrency: p.currency,
      price: (p.priceCents / 100).toFixed(2),
      availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      seller: { '@type': 'Organization', name: ORG_NAME },
    },
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}
