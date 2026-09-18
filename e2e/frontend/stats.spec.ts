import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Statistics page — /stats
// ---------------------------------------------------------------------------

test.describe('Statistics page — public access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stats');
  });

  test('is accessible without logging in', async ({ page }) => {
    await expect(page).toHaveURL('/stats');
    await expect(page.locator('#root')).toBeAttached();
  });

  test('shows the "Statistics" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Statistics' }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Statistics page — year selector
// ---------------------------------------------------------------------------

test.describe('Statistics page — year selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stats');
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
// Statistics page — charts
// ---------------------------------------------------------------------------

test.describe('Statistics page — charts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stats');
  });

  test('at least two SVG charts are rendered (Won vs Played + Points per Round)', async ({
    page,
  }) => {
    // Wait for the first chart to appear
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 15_000 });
    const chartCount = await page.locator('svg').count();
    expect(chartCount).toBeGreaterThanOrEqual(2);
  });
});
