import { test, expect } from '@playwright/test';

import { E2E_EMAIL, E2E_PASSWORD } from '../global-setup';

// ---------------------------------------------------------------------------
// Helper: log in via the UI
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

// Helper: open the Add results modal (assumes already logged in and on '/')
async function openAddResultsModal(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /add results/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

// Generate a unique far-future date to avoid 409 conflicts between test runs
function uniqueTestDate(): string {
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `2099-01-${day}`;
}

// ---------------------------------------------------------------------------
// Opening the modal
// ---------------------------------------------------------------------------

test.describe('Add results modal — opening', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('"Add results" button is visible in TopNav after login', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: /add results/i }),
    ).toBeVisible();
  });

  test('clicking "Add results" opens the modal dialog', async ({ page }) => {
    await openAddResultsModal(page);
    await expect(
      page.getByRole('heading', { name: 'Add game results' }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Modal content
// ---------------------------------------------------------------------------

test.describe('Add results modal — content', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openAddResultsModal(page);
  });

  test('modal has a date field', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Date')).toBeVisible();
  });

  test('date field defaults to today', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    const todayIso = new Date().toISOString().slice(0, 10);
    await expect(dialog.getByLabel('Date')).toHaveValue(todayIso);
  });

  test('modal has at least one player score row', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    // The modal initialises with KNOWN_PLAYERS pre-filled as rows
    const playerFields = dialog.getByLabel('Player');
    await expect(playerFields.first()).toBeVisible();
    expect(await playerFields.count()).toBeGreaterThanOrEqual(1);
  });

  test('modal has an "Add player" button', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByRole('button', { name: /add player/i }),
    ).toBeVisible();
  });

  test('modal has a "Cancel" button', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('modal has a "Save results" submit button', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByRole('button', { name: 'Save results' }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Add player row
// ---------------------------------------------------------------------------

test.describe('Add results modal — Add player button', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openAddResultsModal(page);
  });

  test('clicking "Add player" adds a new empty player row', async ({
    page,
  }) => {
    const dialog = page.getByRole('dialog');
    const before = await dialog.getByLabel('Player').count();

    await dialog.getByRole('button', { name: /add player/i }).click();

    await expect(dialog.getByLabel('Player')).toHaveCount(before + 1);
  });
});

// ---------------------------------------------------------------------------
// Cancel button
// ---------------------------------------------------------------------------

test.describe('Add results modal — Cancel', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openAddResultsModal(page);
  });

  test('Cancel button closes the modal without submitting', async ({
    page,
  }) => {
    const dialog = page.getByRole('dialog');

    // Intercept any POST to confirm it is NOT called
    let postCalled = false;
    await page.route('/api/results', (route) => {
      if (route.request().method() === 'POST') {
        postCalled = true;
      }
      void route.continue();
    });

    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).not.toBeVisible();
    expect(postCalled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Successful submission
// ---------------------------------------------------------------------------

test.describe('Add results modal — successful submission', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openAddResultsModal(page);
  });

  test('submitting valid data shows a success toast and closes the modal', async ({
    page,
  }) => {
    const dialog = page.getByRole('dialog');
    const testDate = uniqueTestDate();

    // Fill in the date
    await dialog.getByLabel('Date').fill(testDate);

    // Fill in a score for the first player row (Glen should be pre-filled)
    const firstScoreField = dialog.getByLabel('Score').first();
    await firstScoreField.fill('12000');

    // Submit
    await dialog.getByRole('button', { name: 'Save results' }).click();

    // Success toast should appear
    await expect(page.locator('.Toastify__toast--success')).toBeVisible({
      timeout: 10_000,
    });

    // Modal should close
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Duplicate date → 409 error
// ---------------------------------------------------------------------------

test.describe('Add results modal — duplicate date error', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('submitting a duplicate date shows an error toast', async ({ page }) => {
    const testDate = uniqueTestDate();

    // --- First submission (should succeed) ---
    await openAddResultsModal(page);
    const dialog = page.getByRole('dialog');

    await dialog.getByLabel('Date').fill(testDate);
    await dialog.getByLabel('Score').first().fill('10000');
    await dialog.getByRole('button', { name: 'Save results' }).click();

    await expect(page.locator('.Toastify__toast--success')).toBeVisible({
      timeout: 10_000,
    });
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // --- Second submission with same date (should fail with 409) ---
    await openAddResultsModal(page);
    const dialog2 = page.getByRole('dialog');

    await dialog2.getByLabel('Date').fill(testDate);
    await dialog2.getByLabel('Score').first().fill('9000');
    await dialog2.getByRole('button', { name: 'Save results' }).click();

    // Error toast should appear
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({
      timeout: 10_000,
    });

    // Modal should remain open
    await expect(dialog2).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Empty scores validation
// ---------------------------------------------------------------------------

test.describe('Add results modal — validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openAddResultsModal(page);
  });

  test('shows error toast when submitting with no scores filled in', async ({
    page,
  }) => {
    const dialog = page.getByRole('dialog');

    // All score fields are empty by default — just submit
    await dialog.getByRole('button', { name: 'Save results' }).click();

    // Should show a client-side error toast (no API call needed)
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({
      timeout: 5_000,
    });

    // Modal should remain open
    await expect(dialog).toBeVisible();
  });
});
