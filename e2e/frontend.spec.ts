import { test, expect } from '@playwright/test';

test.describe('Frontend', () => {
  test('page loads and has a title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });

  test('page has a root element', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('#root');
    await expect(root).toBeAttached();
  });

  test('unknown routes fall back to the SPA, not a server 404', async ({
    page,
  }) => {
    const res = await page.goto('/some/deep/route');
    // The server serves index.html (SPA fallback) — not a 404
    expect(res?.status()).not.toBe(404);
    // React mounts and handles routing client-side (may redirect, e.g. to /login)
    await expect(page.locator('#root')).toBeAttached();
  });
});
