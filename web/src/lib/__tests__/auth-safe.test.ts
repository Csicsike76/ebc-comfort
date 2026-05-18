import { describe, it, expect } from 'vitest';
import { sanitizeNext, SAFE_DEFAULT_REDIRECT } from '@/lib/auth-safe';

describe('sanitizeNext', () => {
  it('returns SAFE_DEFAULT when input is null/undefined/empty', () => {
    expect(sanitizeNext(null)).toBe(SAFE_DEFAULT_REDIRECT);
    expect(sanitizeNext(undefined)).toBe(SAFE_DEFAULT_REDIRECT);
    expect(sanitizeNext('')).toBe(SAFE_DEFAULT_REDIRECT);
  });

  it('accepts a safe same-origin path', () => {
    expect(sanitizeNext('/hu/admin')).toBe('/hu/admin');
    expect(sanitizeNext('/en/admin/orders')).toBe('/en/admin/orders');
    expect(sanitizeNext('/de')).toBe('/de');
  });

  it('rejects protocol-relative URLs (//evil.com/x)', () => {
    expect(sanitizeNext('//evil.com/x')).toBe(SAFE_DEFAULT_REDIRECT);
    expect(sanitizeNext('//attacker.example')).toBe(SAFE_DEFAULT_REDIRECT);
  });

  it('rejects absolute URLs with any scheme', () => {
    expect(sanitizeNext('http://evil.com')).toBe(SAFE_DEFAULT_REDIRECT);
    expect(sanitizeNext('https://evil.com')).toBe(SAFE_DEFAULT_REDIRECT);
    expect(sanitizeNext('javascript:alert(1)')).toBe(SAFE_DEFAULT_REDIRECT);
    expect(sanitizeNext('/javascript:alert(1)')).toBe(SAFE_DEFAULT_REDIRECT);
  });

  it('rejects backslash-prefixed paths (Windows-style)', () => {
    expect(sanitizeNext('/\\evil.com')).toBe(SAFE_DEFAULT_REDIRECT);
  });

  it('rejects percent-encoded protocol-relative URLs', () => {
    expect(sanitizeNext('/%2F%2Fevil.com')).toBe(SAFE_DEFAULT_REDIRECT);
    expect(sanitizeNext('/%2f%2fevil.com')).toBe(SAFE_DEFAULT_REDIRECT);
  });

  it('rejects percent-encoded scheme in path', () => {
    expect(sanitizeNext('/x%3A//evil.com')).toBe(SAFE_DEFAULT_REDIRECT);
  });

  it('rejects malformed percent-encoding gracefully (returns default, not throws)', () => {
    expect(sanitizeNext('/%')).toBe(SAFE_DEFAULT_REDIRECT);
    expect(sanitizeNext('/%ZZ')).toBe(SAFE_DEFAULT_REDIRECT);
  });

  it('rejects non-string input shapes', () => {
    // @ts-expect-error — runtime safety check
    expect(sanitizeNext(123)).toBe(SAFE_DEFAULT_REDIRECT);
    // @ts-expect-error — runtime safety check
    expect(sanitizeNext({})).toBe(SAFE_DEFAULT_REDIRECT);
  });
});
