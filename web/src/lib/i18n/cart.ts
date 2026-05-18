/**
 * Cart / checkout i18n. Locale-isolated module so we can keep all cart
 * translations in one file and avoid bloating the public Dict shape.
 * Covers all 24 EU official languages — every key required.
 */
import type { Locale } from './config';

interface CartDict {
  empty_cart: string;
  view_product: string;
  product_col: string;
  qty_col: string;
  price_col: string;
  shipping_address: string;
  full_name: string;
  email: string;
  phone: string;
  street: string;
  postcode: string;
  city: string;
  country: string;
  clear_cart: string;
  pay: string;
  test_order: string;
  in_progress: string;
  subtotal: string;
  shipping: string;
  shipping_free: string;
  vat: string;
  total: string;
  stripe_disclaimer: string;
  remove_label: string;
  required: string;
  unknown_error: string;
  network_error: string;
  no_checkout_url: string;
  free_shipping_hint: string;
}

const en: CartDict = {
  empty_cart: 'Your cart is empty.',
  view_product: 'View product →',
  product_col: 'Product',
  qty_col: 'Quantity',
  price_col: 'Price',
  shipping_address: 'Shipping address',
  full_name: 'Full name',
  email: 'Email',
  phone: 'Phone',
  street: 'Street + number',
  postcode: 'Postal code',
  city: 'City',
  country: 'Country',
  clear_cart: 'Clear cart',
  pay: 'Pay',
  test_order: 'Test order',
  in_progress: 'Processing…',
  subtotal: 'Subtotal',
  shipping: 'Shipping (EU)',
  shipping_free: 'Free shipping',
  vat: 'VAT',
  total: 'Total',
  stripe_disclaimer: 'Payment is handled by Stripe. We do NOT store card data.',
  remove_label: 'Remove',
  required: '*',
  unknown_error: 'Unknown error',
  network_error: 'Network error',
  no_checkout_url: 'No checkout URL returned.',
  free_shipping_hint: 'Free shipping above {threshold}',
};

const hu: CartDict = {
  empty_cart: 'A kosár üres.',
  view_product: 'Termék megnézése →',
  product_col: 'Termék',
  qty_col: 'Mennyiség',
  price_col: 'Ár',
  shipping_address: 'Szállítási cím',
  full_name: 'Teljes név',
  email: 'E-mail',
  phone: 'Telefon',
  street: 'Utca + házszám',
  postcode: 'Irányítószám',
  city: 'Város',
  country: 'Ország',
  clear_cart: 'Kosár ürítése',
  pay: 'Fizetés',
  test_order: 'Teszt-rendelés',
  in_progress: 'Folyamatban…',
  subtotal: 'Részösszeg',
  shipping: 'Szállítás (EU)',
  shipping_free: 'Ingyenes szállítás',
  vat: 'ÁFA',
  total: 'Fizetendő',
  stripe_disclaimer: 'A fizetés Stripe biztonságos felületén történik. Kártya-adatokat NEM tárolunk.',
  remove_label: 'Eltávolít',
  required: '*',
  unknown_error: 'Ismeretlen hiba',
  network_error: 'Hálózati hiba',
  no_checkout_url: 'Nincs visszaadott checkout URL.',
  free_shipping_hint: 'Ingyenes szállítás {threshold} felett',
};

const de: CartDict = {
  empty_cart: 'Dein Warenkorb ist leer.',
  view_product: 'Produkt ansehen →',
  product_col: 'Produkt',
  qty_col: 'Menge',
  price_col: 'Preis',
  shipping_address: 'Lieferadresse',
  full_name: 'Vollständiger Name',
  email: 'E-Mail',
  phone: 'Telefon',
  street: 'Straße + Hausnummer',
  postcode: 'PLZ',
  city: 'Stadt',
  country: 'Land',
  clear_cart: 'Warenkorb leeren',
  pay: 'Bezahlen',
  test_order: 'Testbestellung',
  in_progress: 'Wird bearbeitet…',
  subtotal: 'Zwischensumme',
  shipping: 'Versand (EU)',
  shipping_free: 'Kostenloser Versand',
  vat: 'MwSt.',
  total: 'Gesamt',
  stripe_disclaimer: 'Die Zahlung erfolgt über Stripe. Wir speichern KEINE Kartendaten.',
  remove_label: 'Entfernen',
  required: '*',
  unknown_error: 'Unbekannter Fehler',
  network_error: 'Netzwerkfehler',
  no_checkout_url: 'Keine Checkout-URL zurückgegeben.',
  free_shipping_hint: 'Kostenloser Versand ab {threshold}',
};

const ro: CartDict = {
  empty_cart: 'Coșul este gol.',
  view_product: 'Vezi produsul →',
  product_col: 'Produs',
  qty_col: 'Cantitate',
  price_col: 'Preț',
  shipping_address: 'Adresă de livrare',
  full_name: 'Nume complet',
  email: 'E-mail',
  phone: 'Telefon',
  street: 'Stradă + număr',
  postcode: 'Cod poștal',
  city: 'Oraș',
  country: 'Țară',
  clear_cart: 'Golește coșul',
  pay: 'Plătește',
  test_order: 'Comandă-test',
  in_progress: 'Se procesează…',
  subtotal: 'Subtotal',
  shipping: 'Livrare (UE)',
  shipping_free: 'Livrare gratuită',
  vat: 'TVA',
  total: 'Total',
  stripe_disclaimer: 'Plata se procesează prin Stripe. NU stocăm datele cardului.',
  remove_label: 'Elimină',
  required: '*',
  unknown_error: 'Eroare necunoscută',
  network_error: 'Eroare de rețea',
  no_checkout_url: 'Nu există URL de checkout returnat.',
  free_shipping_hint: 'Livrare gratuită peste {threshold}',
};

const DICTS: Partial<Record<Locale, CartDict>> = { en, hu, de, ro };

export function getCartDict(locale: Locale): CartDict {
  return DICTS[locale] ?? en;
}

export type { CartDict };
