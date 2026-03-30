import { test, expect } from '@playwright/test';

import { E2E_EMAIL, E2E_PASSWORD } from '../global-setup';

/**
 * Login page E2E tests
 * Route: /login
 *
 * Covers:
 *  - Page structure (form elements visible)
 *  - Client-side validation (empty fields, invalid email, field-level errors)
 *  - Error clearing on input change
 *  - Password visibility toggle
 *  - Remember me checkbox
 *  - Loading state during submission
 *  - Wrong credentials → toast error
 *  - Successful login → redirect to /
 *  - Authenticated users redirected away from /login
 *  - Remember me persistence across page reloads
 */

test.describe('Login Page — layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders the "Sign in" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('has email field, password field, remember me checkbox and submit button', async ({
    page,
  }) => {
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(
      page.locator('input[autocomplete="current-password"]'),
    ).toBeVisible();
    await expect(
      page.getByRole('checkbox', { name: 'Remember me' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('email field has autocomplete="email"', async ({ page }) => {
    await expect(page.getByLabel('Email')).toHaveAttribute(
      'autocomplete',
      'email',
    );
  });

  test('password field has autocomplete="current-password"', async ({
    page,
  }) => {
    await expect(
      page.locator('input[autocomplete="current-password"]'),
    ).toHaveAttribute('autocomplete', 'current-password');
  });
});

test.describe('Login Page — client-side validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows email and password errors when submitting an empty form', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(
      page.getByText('Please enter a valid email address'),
    ).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('shows email error for an invalid email format', async ({ page }) => {
    // Disable browser-native email validation so our Zod handler runs instead.
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.noValidate = true;
      }
    });
    await page.getByLabel('Email').fill('not-an-email');
    await page
      .locator('input[autocomplete="current-password"]')
      .fill('somepassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(
      page.getByText('Please enter a valid email address'),
    ).toBeVisible();
  });

  test('shows only password error when email is valid but password is empty', async ({
    page,
  }) => {
    await page.getByLabel('Email').fill('valid@example.com');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(
      page.getByText('Please enter a valid email address'),
    ).not.toBeVisible();
  });

  test('clears the email error when the user starts typing in the email field', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(
      page.getByText('Please enter a valid email address'),
    ).toBeVisible();
    await page.getByLabel('Email').fill('t');
    await expect(
      page.getByText('Please enter a valid email address'),
    ).not.toBeVisible();
  });

  test('clears the password error when the user starts typing in the password field', async ({
    page,
  }) => {
    await page.getByLabel('Email').fill('valid@example.com');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Password is required')).toBeVisible();
    await page.locator('input[autocomplete="current-password"]').fill('p');
    await expect(page.getByText('Password is required')).not.toBeVisible();
  });
});

test.describe('Login Page — password visibility toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('password field defaults to type="password"', async ({ page }) => {
    await expect(
      page.locator('input[autocomplete="current-password"]'),
    ).toHaveAttribute('type', 'password');
  });

  test('clicking "Show password" reveals the password as plain text', async ({
    page,
  }) => {
    await page
      .locator('input[autocomplete="current-password"]')
      .fill('mysecret');
    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(
      page.locator('input[autocomplete="current-password"]'),
    ).toHaveAttribute('type', 'text');
  });

  test('clicking "Hide password" conceals the password again', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Show password' }).click();
    await page.getByRole('button', { name: 'Hide password' }).click();
    await expect(
      page.locator('input[autocomplete="current-password"]'),
    ).toHaveAttribute('type', 'password');
  });
});

test.describe('Login Page — remember me', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('"Remember me" is unchecked by default', async ({ page }) => {
    await expect(
      page.getByRole('checkbox', { name: 'Remember me' }),
    ).not.toBeChecked();
  });

  test('"Remember me" can be checked and unchecked', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: 'Remember me' });
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });
});

test.describe('Login Page — authentication', () => {
  test('shows a loading state on the submit button while the request is in flight', async ({
    page,
  }) => {
    // Delay the login API response so we can observe the loading state.
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page
      .locator('input[autocomplete="current-password"]')
      .fill(E2E_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // MUI Button sets aria-disabled while loading
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });

  test('shows an error toast for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page
      .locator('input[autocomplete="current-password"]')
      .fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.locator('.Toastify__toast--error')).toBeVisible();
  });

  test('redirects to "/" on successful login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page
      .locator('input[autocomplete="current-password"]')
      .fill(E2E_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/');
  });

  test('already-authenticated users are redirected from /login to /', async ({
    page,
  }) => {
    // Log in first to get a valid token.
    await page.goto('/login');
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page
      .locator('input[autocomplete="current-password"]')
      .fill(E2E_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/');

    // Visiting /login again should immediately redirect back.
    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Login Page — remember me persistence', () => {
  test('pre-fills the email field on the next visit when "Remember me" was checked', async ({
    page,
  }) => {
    // Log in with "Remember me" checked.
    await page.goto('/login');
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page
      .locator('input[autocomplete="current-password"]')
      .fill(E2E_PASSWORD);
    await page.getByRole('checkbox', { name: 'Remember me' }).check();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/');

    // Clear only the auth token from localStorage (keep rememberedEmail).
    await page.evaluate(() => {
      const raw = localStorage.getItem('redux_state');
      if (!raw) {
        return;
      }
      const state = JSON.parse(raw) as {
        auth?: { token?: string | null; rememberedEmail?: string | null };
      };
      if (state.auth) {
        state.auth.token = null;
      }
      localStorage.setItem('redux_state', JSON.stringify(state));
    });

    // Reload so Redux re-hydrates from localStorage with no token.
    await page.reload();
    await expect(page).toHaveURL('/login');
    await expect(page.getByLabel('Email')).toHaveValue(E2E_EMAIL);
  });

  test('does NOT pre-fill the email field when "Remember me" was not checked', async ({
    page,
  }) => {
    // Log in WITHOUT "Remember me".
    await page.goto('/login');
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page
      .locator('input[autocomplete="current-password"]')
      .fill(E2E_PASSWORD);
    // Ensure remember me is unchecked (default).
    await page.getByRole('checkbox', { name: 'Remember me' }).uncheck();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/');

    // Clear the auth token.
    await page.evaluate(() => {
      const raw = localStorage.getItem('redux_state');
      if (!raw) {
        return;
      }
      const state = JSON.parse(raw) as {
        auth?: { token?: string | null; rememberedEmail?: string | null };
      };
      if (state.auth) {
        state.auth.token = null;
      }
      localStorage.setItem('redux_state', JSON.stringify(state));
    });

    await page.reload();
    await expect(page).toHaveURL('/login');
    await expect(page.getByLabel('Email')).toHaveValue('');
  });
});
