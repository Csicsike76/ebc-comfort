import { test, expect } from '@playwright/test';

/**
 * The /auth/callback route was changed from a 302 Location-header redirect
 * to a 200 OK HTML page with <meta refresh> + <script>window.location.replace(...)>.
 * This was necessary because the Netlify Next.js plugin echoes the request
 * query string into outgoing Location headers, leaking attacker-controlled
 * values even after server-side path sanitization. The HTML body is the
 * authoritative source of truth for what the redirect target is.
 */

test.describe('Security — open-redirect mitigation', () => {
  test('auth/callback rejects protocol-relative redirect', async ({ request }) => {
    const res = await request.get('/auth/callback?next=//evil.example/x');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).not.toContain('evil.example');
    expect(body).toMatch(/\/hu\/admin/);
  });

  test('auth/callback rejects absolute scheme redirect', async ({ request }) => {
    const res = await request.get('/auth/callback?next=https://evil.example');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).not.toContain('evil.example');
    expect(body).toMatch(/\/hu\/admin/);
  });

  test('auth/callback rejects javascript: scheme', async ({ request }) => {
    const res = await request.get('/auth/callback?next=javascript:alert(1)');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).not.toContain('javascript:');
    expect(body).toMatch(/\/hu\/admin/);
  });

  test('auth/callback accepts safe same-origin path', async ({ request }) => {
    const res = await request.get('/auth/callback?next=/en/admin/orders');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('/en/admin/orders');
    expect(body).not.toContain('evil');
  });
});

test.describe('Security — sitemap excludes admin routes', () => {
  test('sitemap.xml does not list /admin paths', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    const body = await res.text();
    expect(body).not.toMatch(/\/admin/);
    expect(body).not.toMatch(/\/auth\/callback/);
  });
});
