/**
 * Transactional-email i18n. HU + EN are the source dictionaries; the other 22
 * EU locales live in ./email-locales.ts (machine-translated from EN, QA-reviewed).
 * Any missing locale falls back to EN. Placeholders: {name}, {order_number}.
 */
import type { Locale } from '@/lib/i18n/config';
import { emailLocales } from './email-locales';

const huEmail = {
  footer_tag: 'Wellness márka · NEM orvosi eszköz',
  footer_legal: 'EBC Comfort wellness-eszköz, nem orvosi eszköz. Egészségügyi panasz esetén keress szakorvost.',
  greeting: 'Kedves {name},',
  order_number_label: 'Rendelés-szám',
  order: {
    subject: 'EBC Comfort — Megrendelés rögzítve · {order_number}',
    title: 'Megrendelés rögzítve',
    heading: 'Köszönjük a megrendelést!',
    intro: 'A rendelésedet fogadtuk. Visszaigazolás a státusz-változásokról e-mailben érkezik.',
    payable: 'Fizetendő',
    shipping_address: 'Szállítási cím',
  },
  shipping: {
    subject: 'EBC Comfort — Csomagod elindult · {order_number}',
    title: 'Csomag feladva',
    heading: '📦 A csomagod elindult!',
    intro: 'A rendelésedet feladtuk. 2-5 munkanapon belül kézbesítik a megadott címre.',
    tracking_label: 'Követési szám',
    track_link: 'Csomag követése →',
    tracking_pending: 'A futárszolgálati követési szám hamarosan érkezik.',
  },
  nps: {
    subject: 'EBC Comfort — Hogy vált be? · 1 perces visszajelzés',
    title: 'Visszajelzés kérése',
    heading: 'Hogy tetszik az EBC Comfort?',
    intro: '30 napja, hogy megrendelted az EBC Comfortot. Szeretnénk megkérdezni, hogyan vált be neked. 1 percet vesz igénybe és sokat segít a fejlesztésben.',
    cta: 'Visszajelzés küldése →',
  },
  support: {
    subject: 'EBC Comfort — Támogatási kérvény fogadva',
    title: 'Támogatási kérvény fogadva',
    heading: 'A kérvényedet megkaptuk',
    intro: 'Köszönjük, hogy a támogatási programunkhoz fordultál. 7-14 munkanapon belül e-mailben válaszolunk.',
    excerpt_label: 'A kérvényed kivonata',
    reply_hint: 'Ha kérdésed van, válaszolj erre az e-mailre.',
  },
};

const enEmail: typeof huEmail = {
  footer_tag: 'Wellness brand · NOT a medical device',
  footer_legal: 'EBC Comfort is a wellness device, not a medical device. For any health concern, consult a doctor.',
  greeting: 'Dear {name},',
  order_number_label: 'Order number',
  order: {
    subject: 'EBC Comfort — Order placed · {order_number}',
    title: 'Order placed',
    heading: 'Thank you for your order!',
    intro: 'We have received your order. You will get email updates as its status changes.',
    payable: 'Total due',
    shipping_address: 'Shipping address',
  },
  shipping: {
    subject: 'EBC Comfort — Your package is on its way · {order_number}',
    title: 'Package shipped',
    heading: '📦 Your package is on its way!',
    intro: 'We have shipped your order. It will be delivered to your address within 2-5 business days.',
    tracking_label: 'Tracking number',
    track_link: 'Track package →',
    tracking_pending: 'The carrier tracking number will arrive shortly.',
  },
  nps: {
    subject: 'EBC Comfort — How is it working out? · 1-minute feedback',
    title: 'Feedback request',
    heading: 'How do you like EBC Comfort?',
    intro: 'It has been 30 days since you ordered EBC Comfort. We would love to know how it is working out for you. It takes 1 minute and really helps us improve.',
    cta: 'Send feedback →',
  },
  support: {
    subject: 'EBC Comfort — Support request received',
    title: 'Support request received',
    heading: 'We have received your request',
    intro: 'Thank you for reaching out to our support program. We will reply by email within 7-14 business days.',
    excerpt_label: 'Excerpt of your request',
    reply_hint: 'If you have any questions, just reply to this email.',
  },
};

export type EmailDict = typeof huEmail;

export function getEmailDict(locale: Locale): EmailDict {
  if (locale === 'hu') return huEmail;
  if (locale === 'en') return enEmail;
  return emailLocales[locale] ?? enEmail;
}

// Money formatting per locale (was hardcoded hu-HU). Falls back gracefully.
const MONEY_LOCALE: Partial<Record<Locale, string>> = {
  hu: 'hu-HU', en: 'en-IE', de: 'de-DE', fr: 'fr-FR', it: 'it-IT', es: 'es-ES',
  pl: 'pl-PL', ro: 'ro-RO', nl: 'nl-NL', pt: 'pt-PT', cs: 'cs-CZ', sk: 'sk-SK',
  sv: 'sv-SE', da: 'da-DK', fi: 'fi-FI', bg: 'bg-BG', hr: 'hr-HR', et: 'et-EE',
  el: 'el-GR', ga: 'ga-IE', lv: 'lv-LV', lt: 'lt-LT', mt: 'mt-MT', sl: 'sl-SI',
};

export function formatEmailMoney(cents: number, currency: string, locale: Locale): string {
  try {
    return new Intl.NumberFormat(MONEY_LOCALE[locale] ?? 'en-IE', { style: 'currency', currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}
