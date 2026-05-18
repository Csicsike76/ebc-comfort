'use client';
import { useEffect } from 'react';
import { readConsentFromCookie } from '@/lib/cookie-consent';

/**
 * UTM tracker — captures utm_* query params and stores them in a cookie.
 * GDPR/ePrivacy: marketing-attribution cookies require marketing consent.
 * If the visitor has not consented yet (or has explicitly refused marketing
 * cookies), we do nothing. The cookie banner offers re-consent.
 */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const COOKIE_NAME = 'ebc_utm';
const TTL_DAYS = 30;

function tryCapture(): boolean {
  if (typeof window === 'undefined') return false;
  const consent = readConsentFromCookie();
  if (!consent || !consent.marketing) return false;

  const params = new URLSearchParams(window.location.search);
  const captured: Record<string, string> = {};
  let hasUtm = false;
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) {
      captured[k] = v;
      hasUtm = true;
    }
  }
  if (!hasUtm) return true; // consent OK, just no UTM on this URL — nothing to store

  const referrer = document.referrer || null;
  const payload = {
    ...captured,
    referrer,
    landing_path: window.location.pathname,
    first_seen: new Date().toISOString(),
  };
  const value = encodeURIComponent(JSON.stringify(payload));
  const maxAge = TTL_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
  return true;
}

export default function UtmTracker() {
  useEffect(() => {
    // First attempt — if user already had consent on landing.
    if (tryCapture()) return;
    // Listen for the cookie-consent event fired by CookieConsent.tsx after
    // the user decides. If marketing was accepted in the same session as the
    // UTM-landing, the UTM params are still on `window.location` so we can
    // capture them retroactively.
    function onConsent() { tryCapture(); }
    window.addEventListener('ebc:consent-changed', onConsent);
    return () => window.removeEventListener('ebc:consent-changed', onConsent);
  }, []);
  return null;
}
