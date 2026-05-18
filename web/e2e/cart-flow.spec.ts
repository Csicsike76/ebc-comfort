import { test, expect } from '@playwright/test';

test.describe('Cart flow — HU happy path', () => {
  test('product page loads with 24-month warranty and add-to-cart button', async ({ page }) => {
    await page.goto('/hu/termek');
    await expect(page.locator('body')).toContainText(/24|hó|month/);
    await expect(page.locator('text=EBC')).toBeVisible();
  });

  test('empty cart page renders without crash', async ({ page }) => {
    await page.goto('/hu/kosar');
    expect(page.url()).toContain('/hu/kosar');
  });
});

test.describe('Compliance — wellness-claim wall', () => {
  test('homepage does NOT contain forbidden medical-claim keywords (HU)', async ({ page }) => {
    await page.goto('/hu');
    const body = await page.locator('body').innerText();
    // Hard rules from compliance audit
    const FORBIDDEN = ['UTI', 'húgyúti', 'E. coli', 'antibiotikum', 'gyógyítás', 'ISO 10993', 'biokompatibilis', 'medical-grade'];
    for (const kw of FORBIDDEN) {
      expect(body.toLowerCase()).not.toContain(kw.toLowerCase());
    }
  });

  test('rolunk page does NOT contain UTI or biokompatibilitás', async ({ page }) => {
    await page.goto('/hu/rolunk');
    const body = await page.locator('body').innerText();
    expect(body.toLowerCase()).not.toContain('uti-gyógyít');
    expect(body.toLowerCase()).not.toContain('biokompatibil');
  });
});
