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
  priceValidUntil: string;     // YYYY-MM-DD
  freeShipping: boolean;       // true when price is above the free-shipping threshold
}

// EU markets the shop ships to + applies the 14-day withdrawal right.
const EU_COUNTRIES = ['HU', 'RO', 'DE', 'AT', 'SK', 'FR', 'IT', 'ES', 'PL', 'NL', 'PT', 'CZ', 'SE', 'DK', 'FI', 'BG', 'HR', 'EE', 'GR', 'IE', 'LV', 'LT', 'MT', 'SI'];

export function productLd(p: ProductLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    ...(p.sku ? { sku: p.sku, mpn: p.sku } : {}),
    ...(p.image ? { image: p.image.startsWith('http') ? p.image : `${SITE}${p.image}` } : { image: LOGO }),
    brand: { '@type': 'Brand', name: ORG_NAME },
    offers: {
      '@type': 'Offer',
      url: `${SITE}/${p.locale}${p.path}`,
      priceCurrency: p.currency,
      price: (p.priceCents / 100).toFixed(2),
      priceValidUntil: p.priceValidUntil,
      availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: ORG_NAME },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: p.freeShipping ? '0' : '15.00',
          currency: p.currency,
        },
        shippingDestination: EU_COUNTRIES.map((c) => ({ '@type': 'DefinedRegion', addressCountry: c })),
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: EU_COUNTRIES,
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnShippingFees',
      },
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
