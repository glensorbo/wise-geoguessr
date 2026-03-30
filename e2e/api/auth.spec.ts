import { test as publicTest } from '@playwright/test';

import { test, expect } from '../fixtures';
import { E2E_EMAIL, E2E_PASSWORD } from '../global-setup';

/**
 * Auth controller E2E tests
 * Routes: POST /api/auth/login, /refresh, /logout, /create-user, /change-password, /set-password
 */

publicTest.describe('POST /api/auth/login', () => {
  publicTest('returns 400 when body is empty', async ({ request }) => {
    const res = await request.post('/api/auth/login', { data: {} });
    expect(res.status()).toBe(400);
  });

  publicTest('returns 400 when email is invalid', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'not-an-email', password: 'hunter2' },
    });
    expect(res.status()).toBe(400);
  });

  publicTest('returns 400 when password is missing', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'user@example.com' },
    });
    expect(res.status()).toBe(400);
  });

  publicTest(
    'error body has message, status, error fields',
    async ({ request }) => {
      const res = await request.post('/api/auth/login', { data: {} });
      const body = await res.json();
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('error');
    },
  );

  publicTest('returns 401 for wrong credentials', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'nobody@example.com', password: 'wrongpassword' },
    });
    expect(res.status()).toBe(401);
  });

  publicTest(
    'returns 200 with token for valid credentials',
    async ({ request }) => {
      const res = await request.post('/api/auth/login', {
        data: { email: E2E_EMAIL, password: E2E_PASSWORD },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(typeof body.data.token).toBe('string');
      expect(body.data.token.length).toBeGreaterThan(0);
    },
  );
});

publicTest.describe('POST /api/auth/refresh', () => {
  publicTest(
    'returns 401 when no refresh cookie is present',
    async ({ request }) => {
      const res = await request.post('/api/auth/refresh');
      expect(res.status()).toBe(401);
    },
  );
});

publicTest.describe('POST /api/auth/logout', () => {
  publicTest(
    'returns 200 even without an active session',
    async ({ request }) => {
      const res = await request.post('/api/auth/logout');
      expect(res.status()).toBe(200);
    },
  );
});

test.describe('POST /api/auth/create-user (authenticated)', () => {
  test('returns 400 when email is missing', async ({ authedRequest }) => {
    const res = await authedRequest.post('/api/auth/create-user', {
      data: { name: 'Missing Email' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(
      body.error.errors.some((e: { field: string }) => e.field === 'email'),
    ).toBe(true);
  });

  test('returns 400 when name is missing', async ({ authedRequest }) => {
    const res = await authedRequest.post('/api/auth/create-user', {
      data: { email: 'valid@example.com' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(
      body.error.errors.some((e: { field: string }) => e.field === 'name'),
    ).toBe(true);
  });

  test('returns 400 when email already exists', async ({
    authedRequest,
    testUser,
  }) => {
    const res = await authedRequest.post('/api/auth/create-user', {
      data: { email: testUser.email, name: 'Duplicate' },
    });
    expect(res.status()).toBe(400);
  });

  test('returns 401 without auth token', async ({ request }) => {
    const res = await request.post('/api/auth/create-user', {
      data: { email: 'new@example.com', name: 'New User' },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('POST /api/auth/change-password (authenticated)', () => {
  test('returns 400 when currentPassword is missing', async ({
    authedRequest,
  }) => {
    const res = await authedRequest.post('/api/auth/change-password', {
      data: {
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      },
    });
    expect(res.status()).toBe(400);
  });

  test('returns 400 when newPassword is too short', async ({
    authedRequest,
  }) => {
    const res = await authedRequest.post('/api/auth/change-password', {
      data: {
        currentPassword: 'old',
        newPassword: 'short',
        confirmPassword: 'short',
      },
    });
    expect(res.status()).toBe(400);
  });

  test('returns 401 when currentPassword is wrong', async ({
    authedRequest,
  }) => {
    const res = await authedRequest.post('/api/auth/change-password', {
      data: {
        currentPassword: 'definitelywrong',
        newPassword: 'newlongpassword123',
        confirmPassword: 'newlongpassword123',
      },
    });
    expect(res.status()).toBe(401);
  });

  test('returns 401 without auth token', async ({ request }) => {
    const res = await request.post('/api/auth/change-password', {
      data: { currentPassword: 'old', newPassword: 'new' },
    });
    expect(res.status()).toBe(401);
  });

  test('returns 400 when confirmPassword does not match newPassword', async ({
    authedRequest,
  }) => {
    const res = await authedRequest.post('/api/auth/change-password', {
      data: {
        currentPassword: E2E_PASSWORD,
        newPassword: 'validnewpassword123',
        confirmPassword: 'differentpassword456',
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(
      body.error.errors.some(
        (e: { field: string }) => e.field === 'confirmPassword',
      ),
    ).toBe(true);
  });

  test('returns 200 and new token when passwords are correct', async ({
    authedRequest,
  }) => {
    const tempPassword = 'temporary-e2e-password-for-change-pw-test-42-abcdef';

    // Change to a temporary password
    const changeRes = await authedRequest.post('/api/auth/change-password', {
      data: {
        currentPassword: E2E_PASSWORD,
        newPassword: tempPassword,
        confirmPassword: tempPassword,
      },
    });
    expect(changeRes.status()).toBe(200);
    const changeBody = await changeRes.json();
    expect(typeof changeBody.data.token).toBe('string');
    expect(changeBody.data.token.length).toBeGreaterThan(0);

    // Restore the original password so other tests continue to work.
    // The original Bearer token is still valid (JWT has not expired and the
    // server does not blacklist access tokens on password change).
    const restoreRes = await authedRequest.post('/api/auth/change-password', {
      data: {
        currentPassword: tempPassword,
        newPassword: E2E_PASSWORD,
        confirmPassword: E2E_PASSWORD,
      },
    });
    expect(restoreRes.status()).toBe(200);
  });
});

test.describe('POST /api/auth/set-password', () => {
  publicTest('returns 401 when no token is provided', async ({ request }) => {
    const res = await request.post('/api/auth/set-password', {
      data: {
        password: 'validpassword-no-token-12',
        confirmPassword: 'validpassword-no-token-12',
      },
    });
    expect(res.status()).toBe(401);
  });

  test('returns 401 when an auth token (not signup token) is used', async ({
    authedRequest,
  }) => {
    // authedRequest already carries a standard auth Bearer token,
    // which the signupTokenMiddleware rejects (tokenType !== 'signup').
    const res = await authedRequest.post('/api/auth/set-password', {
      data: {
        password: 'validpassword-auth-token-12',
        confirmPassword: 'validpassword-auth-token-12',
      },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.message).toMatch(/signup token/i);
  });

  test('returns 400 when password is missing', async ({
    authedRequest,
    request,
  }) => {
    const email = `set-pw-missing-${Date.now()}@example.com`;
    const createRes = await authedRequest.post('/api/auth/create-user', {
      data: { email, name: 'Set Password Missing' },
    });
    expect(createRes.status()).toBe(201);
    const {
      data: { signupLink },
    } = await createRes.json();
    const signupToken = new URL(signupLink).searchParams.get('token');

    const res = await request.post('/api/auth/set-password', {
      headers: { Authorization: `Bearer ${signupToken}` },
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test('returns 400 when password is too short (< 12 chars)', async ({
    authedRequest,
    request,
  }) => {
    const email = `set-pw-short-${Date.now()}@example.com`;
    const createRes = await authedRequest.post('/api/auth/create-user', {
      data: { email, name: 'Set Password Short' },
    });
    expect(createRes.status()).toBe(201);
    const {
      data: { signupLink },
    } = await createRes.json();
    const signupToken = new URL(signupLink).searchParams.get('token');

    const res = await request.post('/api/auth/set-password', {
      headers: { Authorization: `Bearer ${signupToken}` },
      data: { password: 'tooshort', confirmPassword: 'tooshort' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(
      body.error.errors.some((e: { field: string }) => e.field === 'password'),
    ).toBe(true);
  });

  test('returns 400 when confirmPassword does not match', async ({
    authedRequest,
    request,
  }) => {
    const email = `set-pw-mismatch-${Date.now()}@example.com`;
    const createRes = await authedRequest.post('/api/auth/create-user', {
      data: { email, name: 'Set Password Mismatch' },
    });
    expect(createRes.status()).toBe(201);
    const {
      data: { signupLink },
    } = await createRes.json();
    const signupToken = new URL(signupLink).searchParams.get('token');

    const res = await request.post('/api/auth/set-password', {
      headers: { Authorization: `Bearer ${signupToken}` },
      data: {
        password: 'validpassword123',
        confirmPassword: 'doesnotmatch456',
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(
      body.error.errors.some(
        (e: { field: string }) => e.field === 'confirmPassword',
      ),
    ).toBe(true);
  });

  test('returns 200 with token when valid password is provided', async ({
    authedRequest,
    request,
  }) => {
    const email = `set-pw-success-${Date.now()}@example.com`;
    const createRes = await authedRequest.post('/api/auth/create-user', {
      data: { email, name: 'Set Password Success' },
    });
    expect(createRes.status()).toBe(201);
    const {
      data: { signupLink },
    } = await createRes.json();
    const signupToken = new URL(signupLink).searchParams.get('token');

    const password = 'valid-set-password-e2e-test-42';
    const res = await request.post('/api/auth/set-password', {
      headers: { Authorization: `Bearer ${signupToken}` },
      data: { password, confirmPassword: password },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.data.token).toBe('string');
    expect(body.data.token.length).toBeGreaterThan(0);
  });
});

publicTest.describe('Rate limiting on auth endpoints', () => {
  publicTest(
    'returns 429 after 10 rapid login requests from same IP',
    async ({ request }) => {
      // The rate limiter allows max 10 requests per minute per IP.
      // Send 11 consecutive requests with invalid credentials — the 11th
      // (and any beyond) must receive 429.
      // Note: prior tests may have already consumed some of the window budget;
      // regardless, once count > 10 every subsequent request is 429, so
      // responses[10] (the 11th) is always 429 within the same window.
      const responses: Array<{ status: () => number }> = [];

      for (let i = 0; i < 11; i++) {
        const res = await request.post('/api/auth/login', {
          data: {
            email: `rate-limit-probe-${i}@example.invalid`,
            password: 'irrelevant-password',
          },
        });
        responses.push(res);
      }

      // At least one response must be 429 — the rate limit was triggered.
      const hitRateLimit = responses.some((r) => r.status() === 429);
      expect(hitRateLimit).toBe(true);

      // The 11th response must specifically be 429 (once the limit fires,
      // every subsequent call is also rate-limited).
      const lastResponse = responses.at(-1);
      expect(lastResponse?.status()).toBe(429);
    },
  );
});
