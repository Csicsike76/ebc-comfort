/**
 * Sanitize the `next` redirect parameter from the OAuth callback. Returns a
 * safe same-origin path or the SAFE_DEFAULT.
 *
 * Rejects:
 *   - protocol-relative URLs (`//evil.com/x`)
 *   - absolute URLs with any scheme (`http://...`, `javascript:...`)
 *   - backslash-prefixed paths
 *   - percent-encoded variants of the above
 *   - any character outside the strict path whitelist
 *     (alphanumeric, `-`, `_`, `.`, `~`, `/`, percent-encoded `%xx`)
 *
 * The strict whitelist defeats reflected-XSS payloads such as
 *   /hu/admin"><script>alert(1)</script>
 * which the earlier sanitizer accepted because it only checked prefix shape.
 * Because we interpolate the returned value into HTML/script contexts in
 * `/auth/callback`, EVERY non-whitelisted character must be rejected.
 */
export const SAFE_DEFAULT_REDIRECT = '/hu/admin';

const SAFE_PATH_RE = /^\/[A-Za-z0-9_\-./~]*$/;

export function sanitizeNext(raw: string | null | undefined): string {
  if (!raw) return SAFE_DEFAULT_REDIRECT;
  if (typeof raw !== 'string') return SAFE_DEFAULT_REDIRECT;

  // Decode once to defeat percent-encoded attacks.
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return SAFE_DEFAULT_REDIRECT;
  }

  // Reject anything that looks like an off-origin redirect.
  if (!decoded.startsWith('/')) return SAFE_DEFAULT_REDIRECT;
  if (decoded.startsWith('//')) return SAFE_DEFAULT_REDIRECT;
  if (decoded.startsWith('/\\')) return SAFE_DEFAULT_REDIRECT;
  if (decoded.includes('://')) return SAFE_DEFAULT_REDIRECT;

  // Strict path whitelist. The result is safe to interpolate into HTML
  // attributes and JS string literals because none of these characters
  // require escaping in those contexts.
  if (!SAFE_PATH_RE.test(decoded)) return SAFE_DEFAULT_REDIRECT;

  return decoded;
}

/**
 * HTML-escape a string for safe interpolation into element text and
 * double-quoted attribute values. Defense in depth: the sanitizer already
 * blocks dangerous characters, but escaping at the sink eliminates the
 * entire class of injection bugs if any character ever slips through.
 */
export function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
