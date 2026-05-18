export type ConsentCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export interface ConsentState {
  necessary: true;       // always true (not user-controllable)
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  decided_at: string;    // ISO timestamp
  version: string;
}

export const CONSENT_VERSION = '1.0';
export const CONSENT_COOKIE = 'ebc_consent';
export const CONSENT_TTL_DAYS = 365;

export function defaultConsent(): ConsentState {
  return {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    decided_at: '',
    version: CONSENT_VERSION,
  };
}

export function parseCookie(raw: string | null | undefined): ConsentState | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      necessary: true,
      functional: !!parsed.functional,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      decided_at: parsed.decided_at ?? '',
      version: CONSENT_VERSION,
    };
  } catch {
    return null;
  }
}

export function readConsentFromCookie(): ConsentState | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  return parseCookie(match.slice(CONSENT_COOKIE.length + 1));
}

export function writeConsentCookie(state: ConsentState): void {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(JSON.stringify(state));
  const maxAge = CONSENT_TTL_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
}
