import { describe, it, expect } from 'vitest';
import {
  FORBIDDEN_KEYWORDS,
  findForbiddenKeywords,
} from '@/lib/compliance-keywords';

describe('findForbiddenKeywords', () => {
  it('finds nothing in clean wellness text', () => {
    const text = 'Diszkrét, hordozható hőmelegítés — 5 fokozat, 8000 mAh akku, USB-C tölthető.';
    expect(findForbiddenKeywords(text)).toEqual([]);
  });

  it('detects HU forbidden keywords (UTI, E. coli)', () => {
    const text = 'Segít a UTI panaszokon.';
    const hits = findForbiddenKeywords(text);
    expect(hits).toContain('UTI');
  });

  it('detects EN forbidden keywords (cure, treat, medical-grade silicone)', () => {
    const text = 'Cures urinary infections with medical-grade silicone.';
    const hits = findForbiddenKeywords(text);
    expect(hits.some((h) => h.toLowerCase() === 'cure')).toBe(true);
    expect(hits.some((h) => h.toLowerCase() === 'urinary')).toBe(true);
    expect(hits.some((h) => h.toLowerCase() === 'medical-grade silicone')).toBe(true);
  });

  it('detects DE forbidden keywords (Harnweg, biokompatibel)', () => {
    const text = 'Hilft bei Harnwegsbeschwerden. Material biokompatibel.';
    const hits = findForbiddenKeywords(text);
    expect(hits.some((h) => h.toLowerCase().includes('harnweg'))).toBe(true);
    expect(hits.some((h) => h.toLowerCase() === 'biokompatibel')).toBe(true);
  });

  it('is case-insensitive', () => {
    const text = 'orvosi szilikon ANTIBIOTIKUM kezelES';
    const hits = findForbiddenKeywords(text);
    expect(hits.length).toBeGreaterThanOrEqual(2);
  });

  it('detects every keyword when concatenated', () => {
    const text = FORBIDDEN_KEYWORDS.join(' ');
    const hits = findForbiddenKeywords(text);
    // Some keywords are substrings of others (e.g. "treat" inside "treatment"),
    // so we just verify all unique keywords surface.
    expect(hits.length).toBe(FORBIDDEN_KEYWORDS.length);
  });

  it('flags ISO 10993 even when surrounded by punctuation', () => {
    expect(findForbiddenKeywords('Tested per ISO 10993-5/-10 protocol.')).toContain('ISO 10993');
  });
});
