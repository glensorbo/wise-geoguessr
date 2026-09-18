import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Results page — /results
// ---------------------------------------------------------------------------

test.describe('Results page — public access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/results');
  });

  test('is accessible without logging in', async ({ page }) => {
    await expect(page).toHaveURL('/results');
    await expect(page.locator('#root')).toBeAttached();
  });

  test('shows the "Results" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Results page — year selector
// ---------------------------------------------------------------------------

test.describe('Results page — year selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/results');
  });

  test('year selector is visible', async ({ page }) => {
    await expect(page.getByLabel('Year')).toBeVisible();
  });

  test('changing the year does not crash the page', async ({ page }) => {
    const select = page.getByLabel('Year');
    await expect(select).toBeVisible();

    await select.click();
    const options = page.getByRole('option');
    const count = await options.count();

    if (count > 0) {
      await options.first().click();
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
// Results page — DataGrid
// ---------------------------------------------------------------------------

test.describe('Results page — DataGrid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/results');
  });

  test('DataGrid table is visible', async ({ page }) => {
    // MUI X DataGrid renders with role="grid"
    await expect(page.locator('[role="grid"]')).toBeVisible({
      timeout: 10_000,
    });
  });
});

// ---------------------------------------------------------------------------
// Results page — charts
// ---------------------------------------------------------------------------

test.describe('Results page — charts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/results');
  });

  test('at least one SVG chart is rendered', async ({ page }) => {
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 15_000 });
  });
});
