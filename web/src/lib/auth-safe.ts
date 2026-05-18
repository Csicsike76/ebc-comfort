/**
 * Sanitize the `next` redirect parameter from the OAuth callback. Returns a
 * safe same-origin path or the SAFE_DEFAULT.
 *
 * Rejects: protocol-relative URLs (`//evil.com/x`), absolute URLs with any
 * scheme (`http://...`, `javascript:...`), backslash-prefixed paths, and
 * percent-encoded variants of the above.
 */
export const SAFE_DEFAULT_REDIRECT = '/hu/admin';

export function sanitizeNext(raw: string | null | undefined): string {
  if (!raw) return SAFE_DEFAULT_REDIRECT;
  if (typeof raw !== 'string') return SAFE_DEFAULT_REDIRECT;
  if (!raw.startsWith('/')) return SAFE_DEFAULT_REDIRECT;
  if (raw.startsWith('//')) return SAFE_DEFAULT_REDIRECT;
  if (raw.startsWith('/\\')) return SAFE_DEFAULT_REDIRECT;
  if (/^\/[^/]*:/.test(raw)) return SAFE_DEFAULT_REDIRECT;
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.includes('://')) return SAFE_DEFAULT_REDIRECT;
    if (decoded.startsWith('//')) return SAFE_DEFAULT_REDIRECT;
  } catch {
    return SAFE_DEFAULT_REDIRECT;
  }
  return raw;
}
