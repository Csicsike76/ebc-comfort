import { test, expect } from '@playwright/test';

test.describe('Security — open-redirect mitigation', () => {
  test('auth/callback rejects protocol-relative redirect', async ({ request }) => {
    const res = await request.get('/auth/callback?next=//evil.example/x', {
      maxRedirects: 0,
    });
    expect([301, 302, 307, 308]).toContain(res.status());
    const location = res.headers()['location'];
    expect(location).toBeDefined();
    expect(location).not.toMatch(/^https?:\/\/evil\.example/);
    expect(location).toMatch(/\/hu\/admin$|\/hu\/admin\?/);
  });

  test('auth/callback rejects absolute scheme redirect', async ({ request }) => {
    const res = await request.get('/auth/callback?next=https://evil.example', {
      maxRedirects: 0,
    });
    const location = res.headers()['location'];
    expect(location).not.toMatch(/evil\.example/);
  });

  test('auth/callback accepts safe same-origin path', async ({ request }) => {
    const res = await request.get('/auth/callback?next=/en/admin/orders', {
      maxRedirects: 0,
    });
    const location = res.headers()['location'];
    expect(location).toMatch(/\/en\/admin\/orders$/);
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
