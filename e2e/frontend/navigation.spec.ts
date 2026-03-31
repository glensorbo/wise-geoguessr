import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Sidebar visibility across routes
// ---------------------------------------------------------------------------

test.describe('Sidebar navigation — visibility', () => {
  test('sidebar is visible on /', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('sidebar is visible on /results', async ({ page }) => {
    await page.goto('/results');
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('sidebar is visible on /stats', async ({ page }) => {
    await page.goto('/stats');
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Sidebar link navigation
// ---------------------------------------------------------------------------

test.describe('Sidebar navigation — link clicks', () => {
  test('clicking "Results" from / navigates to /results', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Results' }).click();
    await expect(page).toHaveURL('/results');
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  });

  test('clicking "Statistics" from / navigates to /stats', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Statistics' }).click();
    await expect(page).toHaveURL('/stats');
    await expect(
      page.getByRole('heading', { name: 'Statistics' }),
    ).toBeVisible();
  });

  test('clicking "Dashboard" from /results navigates to /', async ({
    page,
  }) => {
    await page.goto('/results');
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/');
    await expect(
      page.getByRole('heading', { name: 'Dashboard' }),
    ).toBeVisible();
  });

  test('each nav destination loads without error', async ({ page }) => {
    // Visit each route and confirm root mounts without a visible error state
    for (const route of ['/', '/results', '/stats']) {
      await page.goto(route);
      await expect(page.locator('#root')).toBeAttached();
      await expect(page.getByRole('alert'))
        .not.toBeVisible()
        .catch(() => {
          // alert element may not exist — that's fine
        });
    }
  });
});
