/**
 * Hard-coded medical-claim red flags in HU/EN/DE for fast pre-check before
 * calling the AI nuance review. These are forbidden during the wellness-launch
 * phase. Adding more locales increases recall but should not cause
 * false-positive blocks on the wellness vocabulary (warmth, comfort, etc.).
 */
export const FORBIDDEN_KEYWORDS: readonly string[] = [
  // HU
  'UTI', 'húgyúti', 'húgyhólyag', 'E. coli', 'E.coli', 'baktérium',
  'antibiotikum', 'gyógyít', 'gyógyítás', 'kezel', 'kezelés',
  'orvosi eszköz', 'gyógyhatás', 'tünet enyhít', 'fertőzés', 'gyulladás',
  'orvosi szilikon', 'biokompatibilis', 'ISO 10993',
  // EN
  'urinary', 'bladder', 'bacteria', 'antibiotic', 'cure', 'treat',
  'medical device', 'therapeutic', 'symptom relief', 'infection', 'inflammation',
  'medical-grade silicone', 'biocompatible',
  // DE
  'Harnweg', 'Blase', 'Bakterium', 'Antibiotikum', 'heilen', 'Behandlung',
  'Medizinprodukt', 'therapeutisch', 'Infektion', 'Entzündung',
  'medizinisches Silikon', 'biokompatibel',
];

/**
 * Returns the list of forbidden keywords found in the given text
 * (case-insensitive). Empty array means no violation by hard-rule.
 */
export function findForbiddenKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return FORBIDDEN_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase()));
}
