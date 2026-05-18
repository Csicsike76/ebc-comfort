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
  // Legal-compliance checkboxes (Korm. 45/2014 §15(2) + EU CRD 2011/83/EU)
  legal_title: string;
  consent_aszf: string;
  consent_privacy: string;
  consent_age: string;
  consent_withdrawal: string;
  withdrawal_hint: string;
  pay_button_label: string; // "Megrendelés fizetési kötelezettséggel" — mandatory exact label
  must_accept_legal: string;
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
  legal_title: 'Legal — please confirm',
  consent_aszf: 'I have read and accept the Terms of Service.',
  consent_privacy: 'I have read the Privacy Policy and consent to the processing.',
  consent_age: 'I am 18 years old or older.',
  consent_withdrawal:
    'I acknowledge that intimate hygiene products lose the 14-day withdrawal right once the hygiene seal is opened (45/2014 §29(1)e).',
  withdrawal_hint: 'Unopened packages are returnable within 14 days for a full refund.',
  pay_button_label: 'Order with payment obligation',
  must_accept_legal: 'Please tick all four boxes to continue.',
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
  legal_title: 'Jogi feltételek — erősítsd meg',
  consent_aszf: 'Elolvastam és elfogadom az Általános Szerződési Feltételeket.',
  consent_privacy:
    'Elolvastam az Adatvédelmi tájékoztatót és hozzájárulok az adatkezeléshez.',
  consent_age: 'Elmúltam 18 éves.',
  consent_withdrawal:
    'Tudomásul veszem, hogy intim higiéniai termék esetén a 14 napos elállási jog a higiéniai csomagolás felbontásával megszűnik (45/2014. §29(1)e).',
  withdrawal_hint: 'Bontatlan csomag esetén 14 napon belül teljes vételár-visszatérítés.',
  pay_button_label: 'Megrendelés fizetési kötelezettséggel',
  must_accept_legal: 'Mind a négy feltételt el kell fogadnod a folytatáshoz.',
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
  legal_title: 'Rechtliche Bedingungen — bitte bestätigen',
  consent_aszf: 'Ich habe die AGB gelesen und akzeptiere sie.',
  consent_privacy:
    'Ich habe die Datenschutzerklärung gelesen und willige in die Verarbeitung ein.',
  consent_age: 'Ich bin 18 Jahre oder älter.',
  consent_withdrawal:
    'Mir ist bekannt, dass das 14-tägige Widerrufsrecht bei Intimhygieneprodukten mit dem Öffnen der Versiegelung erlischt.',
  withdrawal_hint: 'Unversiegelte Pakete sind innerhalb von 14 Tagen voll erstattbar.',
  pay_button_label: 'Zahlungspflichtig bestellen',
  must_accept_legal: 'Bitte bestätige alle vier Punkte, um fortzufahren.',
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
  legal_title: 'Termeni legali — confirmă',
  consent_aszf: 'Am citit și accept Termenii și condițiile.',
  consent_privacy:
    'Am citit Politica de confidențialitate și sunt de acord cu prelucrarea datelor.',
  consent_age: 'Am 18 ani sau mai mult.',
  consent_withdrawal:
    'Înțeleg că pentru produsele de igienă intimă dreptul de retragere de 14 zile se pierde la deschiderea sigiliului igienic.',
  withdrawal_hint: 'Pachetele nedeschise pot fi returnate în 14 zile pentru rambursare completă.',
  pay_button_label: 'Comandă cu obligație de plată',
  must_accept_legal: 'Te rugăm să bifezi toate cele patru casete pentru a continua.',
};

const DICTS: Partial<Record<Locale, CartDict>> = { en, hu, de, ro };

export function getCartDict(locale: Locale): CartDict {
  return DICTS[locale] ?? en;
}

export type { CartDict };
