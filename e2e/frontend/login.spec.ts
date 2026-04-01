import { test, expect } from '@playwright/test';

import { E2E_EMAIL, E2E_PASSWORD } from '../global-setup';

/**
 * Login E2E tests
 *
 * PRIMARY: Login Modal flow
 *  - TopNav user menu exposes a "Login" action that opens an inline MUI Dialog
 *  - Form validation (empty fields, invalid email, field-level errors)
 *  - Error clearing on input change
 *  - Password visibility toggle inside the modal
 *  - Remember me checkbox inside the modal
 *  - Loading state during submission
 *  - Wrong credentials → toast error
 *  - Successful login → modal closes, user stays on "/"
 *
 * BACKWARD COMPAT: Direct /login route
 *  - The /login page still renders the same LoginForm
 *  - Successful login redirects to /
 *  - Already-authenticated users are redirected away from /login
 *  - Remember me persistence across page reloads
 */

// ---------------------------------------------------------------------------
// Helper — open the login modal from the home page
// ---------------------------------------------------------------------------

async function openLoginModal(page: import('@playwright/test').Page) {
  await page.goto('/');
  await expect(page.getByRole('banner')).toBeVisible();
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('menuitem', { name: 'Login' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  return page.getByRole('dialog');
}

// ---------------------------------------------------------------------------
// Login Modal — layout
// ---------------------------------------------------------------------------

test.describe('Login Modal — layout', () => {
  test('opens when the user menu "Login" action is clicked', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
    await page.getByRole('button', { name: 'Open user menu' }).click();
    await page.getByRole('menuitem', { name: 'Login' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('renders the "Sign in" heading inside the modal', async ({ page }) => {
    const dialog = await openLoginModal(page);
    await expect(
      dialog.getByRole('heading', { name: 'Sign in' }),
    ).toBeVisible();
  });

  test('has email field, password field, remember me checkbox and submit button', async ({
    page,
  }) => {
    const dialog = await openLoginModal(page);
    await expect(dialog.getByLabel('Email')).toBeVisible();
    await expect(
      dialog.locator('input[autocomplete="current-password"]'),
    ).toBeVisible();
    await expect(
      dialog.getByRole('checkbox', { name: 'Remember me' }),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('email field has autocomplete="email"', async ({ page }) => {
    const dialog = await openLoginModal(page);
    await expect(dialog.getByLabel('Email')).toHaveAttribute(
      'autocomplete',
      'email',
    );
  });

  test('password field has autocomplete="current-password"', async ({
    page,
  }) => {
    const dialog = await openLoginModal(page);
    await expect(
      dialog.locator('input[autocomplete="current-password"]'),
    ).toHaveAttribute('autocomplete', 'current-password');
  });
});

// ---------------------------------------------------------------------------
// Login Modal — client-side validation
// ---------------------------------------------------------------------------

test.describe('Login Modal — client-side validation', () => {
  test('shows email and password errors when submitting an empty form', async ({
    page,
  }) => {
    const dialog = await openLoginModal(page);
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(
      dialog.getByText('Please enter a valid email address'),
    ).toBeVisible();
    await expect(dialog.getByText('Password is required')).toBeVisible();
  });

  test('shows email error for an invalid email format', async ({ page }) => {
    const dialog = await openLoginModal(page);
    // Disable browser-native email validation so our Zod handler runs instead.
    await page.evaluate(() => {
      document
        .querySelectorAll('form')
        .forEach((form) => (form.noValidate = true));
    });
    await dialog.getByLabel('Email').fill('not-an-email');
    await dialog
      .locator('input[autocomplete="current-password"]')
      .fill('somepassword');
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(
      dialog.getByText('Please enter a valid email address'),
    ).toBeVisible();
  });

  test('shows only password error when email is valid but password is empty', async ({
    page,
  }) => {
    const dialog = await openLoginModal(page);
    await dialog.getByLabel('Email').fill('valid@example.com');
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(dialog.getByText('Password is required')).toBeVisible();
    await expect(
      dialog.getByText('Please enter a valid email address'),
    ).not.toBeVisible();
  });

  test('clears the email error when the user starts typing in the email field', async ({
    page,
  }) => {
    const dialog = await openLoginModal(page);
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(
      dialog.getByText('Please enter a valid email address'),
    ).toBeVisible();
    await dialog.getByLabel('Email').fill('t');
    await expect(
      dialog.getByText('Please enter a valid email address'),
    ).not.toBeVisible();
  });

  test('clears the password error when the user starts typing in the password field', async ({
    page,
  }) => {
    const dialog = await openLoginModal(page);
    await dialog.getByLabel('Email').fill('valid@example.com');
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(dialog.getByText('Password is required')).toBeVisible();
    await dialog.locator('input[autocomplete="current-password"]').fill('p');
    await expect(dialog.getByText('Password is required')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Login Modal — password visibility toggle
// ---------------------------------------------------------------------------

test.describe('Login Modal — password visibility toggle', () => {
  test('password field defaults to type="password"', async ({ page }) => {
    const dialog = await openLoginModal(page);
    await expect(
      dialog.locator('input[autocomplete="current-password"]'),
    ).toHaveAttribute('type', 'password');
  });

  test('clicking "Show password" reveals the password as plain text', async ({
    page,
  }) => {
    const dialog = await openLoginModal(page);
    await dialog
      .locator('input[autocomplete="current-password"]')
      .fill('mysecret');
    await dialog.getByRole('button', { name: 'Show password' }).click();
    await expect(
      dialog.locator('input[autocomplete="current-password"]'),
    ).toHaveAttribute('type', 'text');
  });

  test('clicking "Hide password" conceals the password again', async ({
    page,
  }) => {
    const dialog = await openLoginModal(page);
    await dialog.getByRole('button', { name: 'Show password' }).click();
    await dialog.getByRole('button', { name: 'Hide password' }).click();
    await expect(
      dialog.locator('input[autocomplete="current-password"]'),
    ).toHaveAttribute('type', 'password');
  });
});

// ---------------------------------------------------------------------------
// Login Modal — remember me
// ---------------------------------------------------------------------------

test.describe('Login Modal — remember me', () => {
  test('"Remember me" is unchecked by default', async ({ page }) => {
    const dialog = await openLoginModal(page);
    await expect(
      dialog.getByRole('checkbox', { name: 'Remember me' }),
    ).not.toBeChecked();
  });

  test('"Remember me" can be checked and unchecked', async ({ page }) => {
    const dialog = await openLoginModal(page);
    const checkbox = dialog.getByRole('checkbox', { name: 'Remember me' });
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });
});

// ---------------------------------------------------------------------------
// Login Modal — authentication
// ---------------------------------------------------------------------------

test.describe('Login Modal — authentication', () => {
  test('shows a loading state on the submit button while the request is in flight', async ({
    page,
  }) => {
    // Delay the login API response so we can observe the loading state.
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    const dialog = await openLoginModal(page);
    await dialog.getByLabel('Email').fill(E2E_EMAIL);
    await dialog
      .locator('input[autocomplete="current-password"]')
      .fill(E2E_PASSWORD);
    await dialog.getByRole('button', { name: 'Sign in' }).click();

    // MUI Button sets aria-disabled while loading
    await expect(
      dialog.getByRole('button', { name: 'Sign in' }),
    ).toBeDisabled();
  });

  test('shows an error toast for wrong credentials', async ({ page }) => {
    const dialog = await openLoginModal(page);
    await dialog.getByLabel('Email').fill('wrong@example.com');
    await dialog
      .locator('input[autocomplete="current-password"]')
      .fill('wrongpassword');
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.locator('.Toastify__toast--error')).toBeVisible();
  });

  test('closes the modal after successful login', async ({ page }) => {
    const dialog = await openLoginModal(page);
    await dialog.getByLabel('Email').fill(E2E_EMAIL);
    await dialog
      .locator('input[autocomplete="current-password"]')
      .fill(E2E_PASSWORD);
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('stays on "/" after successful login via modal', async ({ page }) => {
    const dialog = await openLoginModal(page);
    await dialog.getByLabel('Email').fill(E2E_EMAIL);
    await dialog
      .locator('input[autocomplete="current-password"]')
      .fill(E2E_PASSWORD);
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('shows authenticated menu actions after successful login', async ({
    page,
  }) => {
    const dialog = await openLoginModal(page);
    await dialog.getByLabel('Email').fill(E2E_EMAIL);
    await dialog
      .locator('input[autocomplete="current-password"]')
      .fill(E2E_PASSWORD);
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: /add results/i }),
    ).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await page.getByRole('button', { name: 'Open user menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Login' })).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// Backward compat — direct /login route
// ---------------------------------------------------------------------------

test.describe('Login Page (/login) — backward compatibility', () => {
  test('renders the login form at the /login route', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(
      page.locator('input[autocomplete="current-password"]'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('redirects to "/" on successful login via /login page', async ({
    page,
  }) => {
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
    // Log in via the /login page first.
    await page.goto('/login');
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page
      .locator('input[autocomplete="current-password"]')
      .fill(E2E_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/');

    // Visiting /login again should immediately redirect back to /.
    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });
});

// ---------------------------------------------------------------------------
// Backward compat — remember me persistence (via /login route)
// ---------------------------------------------------------------------------

test.describe('Login Page (/login) — remember me persistence', () => {
  test('pre-fills the email field on the next visit when "Remember me" was checked', async ({
    page,
  }) => {
    // Log in with "Remember me" checked via the /login page.
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

    // Reload so Redux re-hydrates from localStorage with no token. The refresh
    // cookie keeps the user authenticated, so the app stays on the home page.
    await page.reload();
    await expect(page).toHaveURL('/');

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
    await page.goto('/login');
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
    await expect(page).toHaveURL('/');

    await page.evaluate(() => {
      localStorage.removeItem('redux_state');
    });
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toHaveValue('');
  });
});
