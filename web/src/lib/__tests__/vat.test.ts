import { describe, it, expect } from 'vitest';
import {
  getVatRate,
  vatCentsFromNet,
  netCentsFromGross,
  shippingCents,
  EU_VAT_RATES,
  SHIPPING_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
} from '@/lib/vat';

describe('getVatRate', () => {
  it('returns Hungarian 27% for HU', () => {
    expect(getVatRate('HU')).toBe(0.27);
  });

  it('returns Romanian 19% for RO', () => {
    expect(getVatRate('RO')).toBe(0.19);
  });

  it('is case-insensitive', () => {
    expect(getVatRate('hu')).toBe(0.27);
    expect(getVatRate('Hu')).toBe(0.27);
  });

  it('falls back to HU for unknown country', () => {
    expect(getVatRate('XX')).toBe(0.27);
    expect(getVatRate(null)).toBe(0.27);
    expect(getVatRate(undefined)).toBe(0.27);
    expect(getVatRate('')).toBe(0.27);
  });

  it('covers all 27 EU member states', () => {
    const expected = [
      'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
      'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
      'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
    ];
    for (const c of expected) {
      expect(EU_VAT_RATES[c]).toBeGreaterThan(0);
    }
  });
});

describe('vatCentsFromNet', () => {
  it('computes 27% VAT on 10000 cents net = 2700 cents', () => {
    expect(vatCentsFromNet(10000, 0.27)).toBe(2700);
  });

  it('handles fractional rates without IEEE-754 drift', () => {
    // Finland 25.5%
    expect(vatCentsFromNet(10000, 0.255)).toBe(2550);
  });

  it('rounds .5 cents up (banker-safe, not banker-round)', () => {
    // 0.005 boundary, EPSILON tweak ensures consistent half-up.
    expect(vatCentsFromNet(2, 0.25)).toBe(1); // 0.50 → 1 (half-up via EPSILON)
  });
});

describe('netCentsFromGross', () => {
  it('inverts vatCentsFromNet for 27% rate', () => {
    const net = 10000;
    const rate = 0.27;
    const gross = net + vatCentsFromNet(net, rate);
    expect(netCentsFromGross(gross, rate)).toBe(net);
  });
});

describe('shippingCents', () => {
  it('is 0 when cart is empty', () => {
    expect(shippingCents(0, 0)).toBe(0);
    expect(shippingCents(99999, 0)).toBe(0);
  });

  it('charges flat SHIPPING_CENTS below threshold', () => {
    expect(shippingCents(1000, 1)).toBe(SHIPPING_CENTS);
    expect(shippingCents(FREE_SHIPPING_THRESHOLD_CENTS - 1, 1)).toBe(SHIPPING_CENTS);
  });

  it('is free at or above threshold', () => {
    expect(shippingCents(FREE_SHIPPING_THRESHOLD_CENTS, 1)).toBe(0);
    expect(shippingCents(FREE_SHIPPING_THRESHOLD_CENTS + 1, 1)).toBe(0);
    expect(shippingCents(100000, 5)).toBe(0);
  });
});
