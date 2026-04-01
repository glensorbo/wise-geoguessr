/**
 * Comprehensive browser workflow tests for the scores feature.
 *
 * These tests rely on the 48 canonical records seeded in global-setup.ts and
 * cover the full login → view → add → verify lifecycle, year-selector
 * behaviour, DataGrid content, and modal interactions not already covered by
 * addScore.spec.ts.
 *
 * Counts from the seeded dataset:
 *   2024 → 3 records   (all fit on one page)
 *   2025 → 35 records  (spans 4 pages at pageSize=10)
 *   2026 → 10 records  (fills one page exactly)
 */

import { test, expect } from '@playwright/test';

import { test as authedTest } from '../fixtures';
import { E2E_EMAIL, E2E_PASSWORD } from '../global-setup';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Page = import('@playwright/test').Page;

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(E2E_EMAIL);
  await page
    .locator('input[autocomplete="current-password"]')
    .fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/');
}

async function selectYear(page: Page, year: number) {
  const select = page.getByLabel('Year');
  await select.click();
  await page.getByRole('option', { name: String(year) }).click();
  // Wait for the grid to reflect the new year's data
  await expect(page.locator('[role="grid"]')).toBeVisible({ timeout: 10_000 });
}

const dateCell = (page: Page, date: string) =>
  page.locator('[role="gridcell"][data-field="date"]', { hasText: date });

async function openAddResultsModal(page: Page) {
  await page.getByRole('button', { name: /add results/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

async function injectAuthToken(page: Page, token: string) {
  await page.goto('/login');
  await page.evaluate((nextToken: string) => {
    const raw = localStorage.getItem('redux_state');
    const state = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const auth =
      state.auth && typeof state.auth === 'object'
        ? (state.auth as Record<string, unknown>)
        : {};

    localStorage.setItem(
      'redux_state',
      JSON.stringify({
        ...state,
        auth: {
          ...auth,
          token: nextToken,
        },
      }),
    );
  }, token);
}

const playerInputs = (dialog: import('@playwright/test').Locator) =>
  dialog.locator('input:not([type="date"]):not([type="number"])');

// ---------------------------------------------------------------------------
// Year selector — seeded-data content
// ---------------------------------------------------------------------------

test.describe('Home page — year selector content (seeded data)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('year dropdown lists 2026, 2025, and 2024', async ({ page }) => {
    await page.getByLabel('Year').click();
    await expect(page.getByRole('option', { name: '2026' })).toBeVisible();
    await expect(page.getByRole('option', { name: '2025' })).toBeVisible();
    await expect(page.getByRole('option', { name: '2024' })).toBeVisible();
  });

  test('year dropdown has exactly 3 options from the seeded data', async ({
    page,
  }) => {
    const select = page.getByLabel('Year');
    await select.click();
    // Allow a small wait for the dropdown to fully populate
    const yearOptions = page.getByRole('option').filter({ hasText: /^202\d$/ });
    await expect(yearOptions.first()).toBeVisible();
    const count = await yearOptions.count();
    expect(count).toBe(3);
  });

  test('year defaults to the current year (2026)', async ({ page }) => {
    // The year selector should show 2026 selected by default
    const select = page.getByLabel('Year');
    await expect(select).toContainText('2026');
  });
});

// ---------------------------------------------------------------------------
// Year selector — filtering changes the displayed data
// ---------------------------------------------------------------------------

test.describe('Results page — year filtering changes grid content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/results');
    await expect(page.locator('[role="grid"]')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('switching to 2024 shows the date 2024-11-22', async ({ page }) => {
    await selectYear(page, 2024);
    await expect(dateCell(page, '2024-11-22')).toBeVisible();
  });

  test('switching to 2024 shows the date 2024-12-06', async ({ page }) => {
    await selectYear(page, 2024);
    await expect(dateCell(page, '2024-12-06')).toBeVisible();
  });

  test('switching to 2025 shows a 2025 date in the grid', async ({ page }) => {
    await selectYear(page, 2025);
    await expect(dateCell(page, '2025-12-19')).toBeVisible({ timeout: 10_000 });
  });

  test('switching to 2026 shows the date 2026-03-27', async ({ page }) => {
    await selectYear(page, 2026);
    await expect(dateCell(page, '2026-03-27')).toBeVisible({ timeout: 10_000 });
  });

  test('switching to 2026 does not show a 2025 date on the first page', async ({
    page,
  }) => {
    await selectYear(page, 2026);
    // All 10 2026 records should fit on one page — no 2025 dates visible
    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible();
    await expect(grid.getByText(/^2025-/)).not.toBeVisible();
  });

  test('2025 grid shows pagination (more than 10 rows total)', async ({
    page,
  }) => {
    await selectYear(page, 2025);
    // MUI DataGrid renders pagination text like "1–10 of 35" in the footer
    await expect(page.getByText(/1.10 of 35/)).toBeVisible({ timeout: 10_000 });
  });

  test('2024 grid shows all 3 rows without pagination', async ({ page }) => {
    await selectYear(page, 2024);
    await expect(page.getByText('1–3 of 3')).toBeVisible({ timeout: 10_000 });
  });

  test('2026 grid shows all 10 rows on one page', async ({ page }) => {
    await selectYear(page, 2026);
    await expect(page.getByText('1–10 of 10')).toBeVisible({
      timeout: 10_000,
    });
  });
});

// ---------------------------------------------------------------------------
// URL year parameter
// ---------------------------------------------------------------------------

test.describe('Results page — ?year= URL parameter', () => {
  test('navigating to /results?year=2024 pre-selects 2024', async ({
    page,
  }) => {
    await page.goto('/results?year=2024');
    await expect(page.getByLabel('Year')).toContainText('2024');
    await expect(dateCell(page, '2024-11-22')).toBeVisible({ timeout: 10_000 });
  });

  test('navigating to /results?year=2025 pre-selects 2025', async ({
    page,
  }) => {
    await page.goto('/results?year=2025');
    await expect(page).toHaveURL(/\/results\?year=2025$/);
    await expect(dateCell(page, '2025-12-19')).toBeVisible({ timeout: 10_000 });
  });

  test('navigating to /results?year=2026 pre-selects 2026', async ({
    page,
  }) => {
    await page.goto('/results?year=2026');
    await expect(page.getByLabel('Year')).toContainText('2026');
    await expect(dateCell(page, '2026-03-27')).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Grid column headers
// ---------------------------------------------------------------------------

test.describe('Results page — DataGrid column headers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/results?year=2026');
    await expect(page.locator('[role="grid"]')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('DataGrid has a "Date" column header', async ({ page }) => {
    await expect(
      page.locator('[role="columnheader"]', { hasText: 'Date' }),
    ).toBeVisible();
  });

  test('DataGrid shows known player names from 2026 data as column headers', async ({
    page,
  }) => {
    // Players in 2026: Glen, Thorjan, Thomas, Tor Arve, Sigurd, Malin, Lotte
    const grid = page.locator('[role="grid"]');
    await expect(
      grid.locator('[role="columnheader"]', { hasText: 'Thomas' }),
    ).toBeVisible();
    await expect(
      grid.locator('[role="columnheader"]', { hasText: 'Glen' }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Full E2E workflow: login → add score → verify in grid
// ---------------------------------------------------------------------------

test.describe('Full workflow — login → add score → verify in grid', () => {
  test('score added for a far-future year appears in the grid after year switch', async ({
    page,
  }) => {
    await login(page);
    await page.goto('/results');

    // Use a year guaranteed to have no seeded data
    const testYear = 2097;
    const testDate = `${testYear}-06-15`;
    const testScore = 19876;

    // Open and fill the Add results modal
    await openAddResultsModal(page);
    const dialog = page.getByRole('dialog');

    await dialog.getByLabel('Date').fill(testDate);
    // Fill the first player's score (Glen is pre-populated)
    await dialog.getByLabel('Score').first().fill(String(testScore));

    // Submit
    await dialog.getByRole('button', { name: 'Save results' }).click();

    // Confirm success
    await expect(page.locator('.Toastify__toast--success')).toBeVisible({
      timeout: 10_000,
    });
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // Switch the year selector to 2097 (it should now be available)
    await page.getByLabel('Year').click();
    await page.getByRole('option', { name: String(testYear) }).click();

    // The new date should be visible in the grid
    await expect(dateCell(page, testDate)).toBeVisible({ timeout: 10_000 });
  });

  test('score with multiple players shows multiple columns in the grid', async ({
    page,
  }) => {
    await login(page);
    await page.goto('/results');

    const testDate = `2097-06-${String(16 + test.info().retry).padStart(2, '0')}`;

    await openAddResultsModal(page);
    const dialog = page.getByRole('dialog');

    await dialog.getByLabel('Date').fill(testDate);

    // Fill Glen (first) and Thomas (third) — they are pre-populated
    const scoreFields = dialog.getByLabel('Score');
    await scoreFields.nth(0).fill('18000'); // Glen
    await scoreFields.nth(2).fill('16500'); // Thomas

    await dialog.getByRole('button', { name: 'Save results' }).click();
    const submitResult = await Promise.race([
      page
        .locator('.Toastify__toast--success')
        .waitFor({ state: 'visible', timeout: 10_000 })
        .then(() => 'success' as const),
      page
        .locator('.Toastify__toast--error')
        .waitFor({ state: 'visible', timeout: 10_000 })
        .then(() => 'error' as const),
    ]);

    expect(submitResult).toBe('success');

    // Switch to 2097 to verify
    await page.getByLabel('Year').click();
    await page.getByRole('option', { name: '2097' }).click();

    await expect(dateCell(page, testDate)).toBeVisible({ timeout: 10_000 });

    // Both player columns should be present in the grid header
    const grid = page.locator('[role="grid"]');
    await expect(
      grid.locator('[role="columnheader"]', { hasText: 'Glen' }),
    ).toBeVisible();
    await expect(
      grid.locator('[role="columnheader"]', { hasText: 'Thomas' }),
    ).toBeVisible();
  });

  test('custom player name appears in the grid after submission', async ({
    page,
  }) => {
    await login(page);
    await page.goto('/results');

    const testDate = '2097-06-17';
    const customPlayer = 'NewCustomPlayer';

    await openAddResultsModal(page);
    const dialog = page.getByRole('dialog');

    await dialog.getByLabel('Date').fill(testDate);

    // Add a custom player row
    await dialog.getByRole('button', { name: /add player/i }).click();

    // The new empty row is the last one — fill in name and score
    const playerFields = playerInputs(dialog);
    const lastPlayerField = playerFields.last();
    await lastPlayerField.fill(customPlayer);

    const scoreFields = dialog.getByLabel('Score');
    await scoreFields.last().fill('14000');

    await dialog.getByRole('button', { name: 'Save results' }).click();
    await expect(page.locator('.Toastify__toast--success')).toBeVisible({
      timeout: 10_000,
    });

    // Switch to 2097 and verify the custom player column exists
    await page.getByLabel('Year').click();
    await page.getByRole('option', { name: '2097' }).click();

    await expect(dateCell(page, testDate)).toBeVisible({ timeout: 10_000 });

    const grid = page.locator('[role="grid"]');
    await expect(
      grid.locator('[role="columnheader"]', { hasText: customPlayer }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Full workflow — removing a player row
// ---------------------------------------------------------------------------

test.describe('Add results modal — remove player row', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openAddResultsModal(page);
  });

  test('clicking remove deletes the player row', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    const before = await playerInputs(dialog).count();

    // Remove the first player row
    await dialog.getByRole('button', { name: 'Remove player' }).first().click();

    await expect(playerInputs(dialog)).toHaveCount(before - 1);
  });

  test('removing all rows and then submitting shows a validation error', async ({
    page,
  }) => {
    const dialog = page.getByRole('dialog');

    // Remove every player row
    const removeButtons = dialog.getByRole('button', { name: 'Remove player' });
    const count = await removeButtons.count();
    for (let i = 0; i < count; i++) {
      await dialog
        .getByRole('button', { name: 'Remove player' })
        .first()
        .click();
    }

    await dialog.getByRole('button', { name: 'Save results' }).click();

    await expect(page.locator('.Toastify__toast--error')).toBeVisible({
      timeout: 5_000,
    });
    await expect(dialog).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Score values — edge cases
// ---------------------------------------------------------------------------

test.describe('Add results modal — score edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('score of 0 is accepted and submitted successfully', async ({
    page,
  }) => {
    await openAddResultsModal(page);
    const dialog = page.getByRole('dialog');

    await dialog.getByLabel('Date').fill('2097-07-01');
    await dialog.getByLabel('Score').first().fill('0');
    await dialog.getByRole('button', { name: 'Save results' }).click();

    await expect(page.locator('.Toastify__toast--success')).toBeVisible({
      timeout: 10_000,
    });
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
  });

  test('high score (25000) is accepted', async ({ page }) => {
    await openAddResultsModal(page);
    const dialog = page.getByRole('dialog');

    await dialog.getByLabel('Date').fill('2097-07-02');
    await dialog.getByLabel('Score').first().fill('25000');
    await dialog.getByRole('button', { name: 'Save results' }).click();

    await expect(page.locator('.Toastify__toast--success')).toBeVisible({
      timeout: 10_000,
    });
  });
});

// ---------------------------------------------------------------------------
// Modal state reset
// ---------------------------------------------------------------------------

test.describe('Add results modal — state reset', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('reopening the modal after close resets the date to today', async ({
    page,
  }) => {
    // Open, change date, close
    await openAddResultsModal(page);
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Date').fill('2097-01-01');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();

    // Reopen and verify date reset to today
    await openAddResultsModal(page);
    const todayIso = new Date().toISOString().slice(0, 10);
    await expect(page.getByRole('dialog').getByLabel('Date')).toHaveValue(
      todayIso,
    );
  });

  test('reopening the modal after success resets the scores to empty', async ({
    page,
  }) => {
    // Submit a valid score
    await openAddResultsModal(page);
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Date').fill('2097-07-03');
    await dialog.getByLabel('Score').first().fill('11111');
    await dialog.getByRole('button', { name: 'Save results' }).click();
    await expect(page.locator('.Toastify__toast--success')).toBeVisible({
      timeout: 10_000,
    });
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // Reopen — all score fields should be empty
    await openAddResultsModal(page);
    const scores = page.getByRole('dialog').getByLabel('Score');
    const count = await scores.count();
    for (let i = 0; i < count; i++) {
      await expect(scores.nth(i)).toHaveValue('');
    }
  });
});

// ---------------------------------------------------------------------------
// Grid data update after submission
// ---------------------------------------------------------------------------

test.describe('Home page grid — auto-refresh after adding a score', () => {
  test('grid shows the new date immediately after a successful submission without page reload', async ({
    page,
  }) => {
    await login(page);

    // Navigate to year 2097 view (empty before submission)
    await page.goto('/results?year=2097');

    // Add a score for 2097
    await page.getByRole('button', { name: /add results/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Date').fill('2097-08-08');
    await dialog.getByLabel('Score').first().fill('13000');
    await dialog.getByRole('button', { name: 'Save results' }).click();

    await expect(page.locator('.Toastify__toast--success')).toBeVisible({
      timeout: 10_000,
    });
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // Year should switch automatically to 2097 since the date is in 2097
    // OR we select it manually to verify the grid updated
    await page.getByLabel('Year').click();
    await page.getByRole('option', { name: '2097' }).click();

    await expect(dateCell(page, '2097-08-08')).toBeVisible({
      timeout: 10_000,
    });
  });
});

// ---------------------------------------------------------------------------
// Authenticated via injected token — year filter & grid spot-checks
// ---------------------------------------------------------------------------

authedTest.describe(
  'Home page — grid spot-checks (token injection, no UI login)',
  () => {
    authedTest(
      '2026 grid first row is the most recent seeded record',
      async ({ page, testUser }) => {
        // Inject auth token directly to skip UI login
        await injectAuthToken(page, testUser.token);
        await page.goto('/results?year=2026');

        await expect(page.locator('[role="grid"]')).toBeVisible({
          timeout: 10_000,
        });

        // The DataGrid sorts by date desc by default — first row should be 2026-03-27
        const firstDataCell = page
          .locator('[role="row"][data-rowindex="0"]')
          .locator('[role="gridcell"]')
          .first();
        await expect(firstDataCell).toHaveText('2026-03-27');
      },
    );

    authedTest(
      '2024 grid shows exactly 3 data rows',
      async ({ page, testUser }) => {
        await injectAuthToken(page, testUser.token);
        await page.goto('/results?year=2024');

        await expect(page.locator('[role="grid"]')).toBeVisible({
          timeout: 10_000,
        });

        // All 3 rows should be visible — no pagination needed
        const dataRows = page.locator('[role="row"][data-rowindex]');
        await expect(dataRows).toHaveCount(3, { timeout: 10_000 });
      },
    );
  },
);

// ---------------------------------------------------------------------------
// Logout clears authenticated state
// ---------------------------------------------------------------------------

test.describe('TopNav — logout clears Add results button', () => {
  test('logging out removes the "Add results" button', async ({ page }) => {
    await login(page);

    // Confirm the button is present
    await expect(
      page.getByRole('button', { name: /add results/i }),
    ).toBeVisible();

    // Open user menu and logout
    await page.getByRole('button', { name: 'Open user menu' }).click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    // After logout, the home-only controls disappear and the app stays on the public home page.
    await expect(
      page.getByRole('button', { name: /add results/i }),
    ).not.toBeVisible();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Open user menu' })).toBeVisible();
  });
});
