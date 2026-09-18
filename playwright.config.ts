import { defineConfig, devices } from '@playwright/test';

/**
 * E2E test configuration.
 * Spins up the dev server automatically before running tests.
 * Set E2E_BASE_URL to test against a running server instead.
 *
 * Projects:
 *   api     — pure HTTP tests, no browser required (default: bun e2e)
 *   browser — full browser tests, requires Chromium  (opt-in: bun e2e:browser)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'api',
      testMatch: ['**/api/**/*.spec.ts', '**/healthcheck.spec.ts'],
    },
    {
      name: 'browser',
      testMatch: ['**/frontend.spec.ts', '**/frontend/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'x-e2e-test': 'true',
        },
      },
    },
  ],

  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'bun run dev',
        url: 'http://localhost:3000/healthcheck',
        reuseExistingServer: !process.env.CI,
        timeout: 15_000,
      },
});
