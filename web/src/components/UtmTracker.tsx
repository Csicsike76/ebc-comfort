'use client';
import { useEffect } from 'react';

/**
 * UTM tracker — captures utm_* query params on first visit
 * and stores them in a cookie for cross-page attribution.
 * Forwarded to /api/checkout via metadata for marketing_campaigns linkage.
 */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const COOKIE_NAME = 'ebc_utm';
const TTL_DAYS = 30;

export default function UtmTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
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
    if (!hasUtm) return;

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
  }, []);
  return null;
}
