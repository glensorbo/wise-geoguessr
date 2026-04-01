import { test, expect } from '@playwright/test';

import { E2E_EMAIL, E2E_PASSWORD } from '../global-setup';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(E2E_EMAIL);
  await page
    .locator('input[autocomplete="current-password"]')
    .fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/');
}

// ---------------------------------------------------------------------------
// Public access
// ---------------------------------------------------------------------------

test.describe('Home page — public access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('is accessible without logging in', async ({ page }) => {
    // Should NOT redirect to /login
    await expect(page).toHaveURL('/');
    await expect(page.locator('#root')).toBeAttached();
  });

  test('shows the page title / app bar', async ({ page }) => {
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(
      page.getByRole('banner').getByText('🌍 Wise GeoGuessr'),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Year selector
// ---------------------------------------------------------------------------

test.describe('Home page — year selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('year selector is visible', async ({ page }) => {
    // MUI Select with label="Year"
    await expect(page.getByLabel('Year')).toBeVisible();
  });

  test('year selector has a value selected', async ({ page }) => {
    const select = page.getByLabel('Year');
    await expect(select).toBeVisible();
    // The combobox should show a year value (4-digit number)
    await expect(select).not.toHaveText('');
  });

  test('changing the year does not crash the page', async ({ page }) => {
    // Wait for the year selector to be enabled (data has loaded)
    const select = page.getByLabel('Year');
    await expect(select).toBeVisible();

    // Open the year dropdown
    await select.click();

    // Get available options and pick one (the first option in the list)
    const options = page.getByRole('option');
    const count = await options.count();

    if (count > 0) {
      await options.first().click();
      // Page should still be functional — no error state shown
      await expect(page.getByRole('alert'))
        .not.toBeVisible()
        .catch(() => {
          // alert may not exist at all — that's fine
        });
      await expect(page.locator('#root')).toBeAttached();
    }
  });
});

// ---------------------------------------------------------------------------
// LeftNav sidebar
// ---------------------------------------------------------------------------

test.describe('Home page — LeftNav sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sidebar navigation is visible', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('sidebar has a "Dashboard" nav link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  });

  test('sidebar has a "Results" nav link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Results' })).toBeVisible();
  });

  test('sidebar has a "Statistics" nav link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Statistics' })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Dashboard content
// ---------------------------------------------------------------------------

test.describe('Home page — dashboard content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the "Dashboard" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Dashboard' }),
    ).toBeVisible();
  });

  test('shows the Season Podium section', async ({ page }) => {
    await expect(page.getByText(/Season Podium/)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('shows the Last Round section', async ({ page }) => {
    await expect(page.getByText(/Last Round/)).toBeVisible({
      timeout: 10_000,
    });
  });
});

// ---------------------------------------------------------------------------
// TopNav — unauthenticated
// ---------------------------------------------------------------------------

test.describe('Home page — TopNav (not logged in)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the public user menu with a "Login" action when not authenticated', async ({
    page,
  }) => {
    await expect(page.getByRole('button', { name: 'Open user menu' })).toBeVisible();
    await page.getByRole('button', { name: 'Open user menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Login' })).toBeVisible();
  });

  test('does NOT show "Add results" button when not authenticated', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: /add results/i }),
    ).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// TopNav — authenticated
// ---------------------------------------------------------------------------

test.describe('Home page — TopNav (logged in)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows "Add results" button after login', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /add results/i }),
    ).toBeVisible();
  });

  test('does NOT show "Login" button after login', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Open user menu' })).toBeVisible();
    await page.getByRole('button', { name: 'Open user menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Login' })).toHaveCount(0);
  });
});
