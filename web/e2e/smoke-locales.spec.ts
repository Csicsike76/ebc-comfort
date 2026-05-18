import { test, expect } from '@playwright/test';

/**
 * Smoke test: every public locale homepage must respond 200 and contain the
 * EBC brand mention. Catches deploy regressions where a locale file fails
 * to load (404 / 500) or the dict falls back to a stub.
 */
const LOCALES = [
  'hu', 'en', 'de', 'fr', 'it', 'es', 'pl', 'ro', 'nl', 'pt',
  'cs', 'sk', 'sv', 'da', 'fi',
  'bg', 'hr', 'et', 'el', 'ga', 'lv', 'lt', 'mt', 'sl',
] as const;

for (const locale of LOCALES) {
  test(`locale ${locale} home renders 200 with EBC brand`, async ({ page }) => {
    const response = await page.goto(`/${locale}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toContainText(/EBC/i);
    await expect(page).toHaveTitle(/EBC|Comfort/i);
  });
}

test('sitemap.xml lists 216 URLs (24 locales × 9 paths)', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const body = await res.text();
  const urlMatches = body.match(/<url>/g);
  // 24 locales × 9 paths = 216
  expect(urlMatches?.length ?? 0).toBeGreaterThanOrEqual(216);
});

test('robots.txt disallows /admin and /api', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/Disallow:.*\/admin/);
  expect(body).toMatch(/Disallow:.*\/api/);
});
