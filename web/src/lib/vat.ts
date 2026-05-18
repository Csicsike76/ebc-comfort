/**
 * EU VAT rates per destination country (B2C, standard rate).
 * Source: European Commission VAT rates database, valid 2026-05.
 * Updated when EU member states change their standard rate.
 *
 * NOTE: this is the standard rate for general consumer goods. Reduced rates
 * (medical devices, food, books) are NOT modeled here — EBC Comfort is a
 * wellness consumer good and uses the standard rate.
 */
export const EU_VAT_RATES: Record<string, number> = {
  AT: 0.20,
  BE: 0.21,
  BG: 0.20,
  CY: 0.19,
  CZ: 0.21,
  DE: 0.19,
  DK: 0.25,
  EE: 0.22,
  ES: 0.21,
  FI: 0.255,
  FR: 0.20,
  GR: 0.24,
  HR: 0.25,
  HU: 0.27,
  IE: 0.23,
  IT: 0.22,
  LT: 0.21,
  LU: 0.17,
  LV: 0.21,
  MT: 0.18,
  NL: 0.21,
  PL: 0.23,
  PT: 0.23,
  RO: 0.19,
  SE: 0.25,
  SI: 0.22,
  SK: 0.23,
};

export const DEFAULT_COUNTRY = 'HU';

/**
 * VAT rate for the given ISO-3166-1 alpha-2 country code (uppercase).
 * Unknown country → falls back to Hungarian rate (seller's home rate per
 * VAT-OSS pre-registration mode).
 */
export function getVatRate(country: string | null | undefined): number {
  if (!country) return EU_VAT_RATES[DEFAULT_COUNTRY];
  const code = country.toUpperCase();
  return EU_VAT_RATES[code] ?? EU_VAT_RATES[DEFAULT_COUNTRY];
}

/**
 * Compute VAT amount in cents from a NET base, rounded half-up. Returns
 * integer cents. Uses Number.EPSILON to avoid IEEE-754 round-off for
 * .005 boundaries.
 */
export function vatCentsFromNet(netCents: number, rate: number): number {
  return Math.round(netCents * rate + Number.EPSILON);
}

/**
 * Compute the NET portion of a GROSS (VAT-inclusive) amount.
 */
export function netCentsFromGross(grossCents: number, rate: number): number {
  return Math.round(grossCents / (1 + rate) + Number.EPSILON);
}

/**
 * Free-shipping threshold in cents. Above this gross subtotal, shipping is
 * free; below, the flat SHIPPING_CENTS applies.
 */
export const SHIPPING_CENTS = 1500;
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000;

export function shippingCents(subtotalCents: number, itemCount: number): number {
  if (itemCount === 0) return 0;
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
  return SHIPPING_CENTS;
}
