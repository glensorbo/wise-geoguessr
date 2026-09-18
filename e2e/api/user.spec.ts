import { test as publicTest } from '@playwright/test';

import { test, expect } from '../fixtures';

/**
 * User controller E2E tests
 * Routes: GET /api/user, GET /api/user/:id
 */

publicTest.describe('GET /api/user (unauthenticated)', () => {
  publicTest('returns 401 without an auth token', async ({ request }) => {
    const res = await request.get('/api/user');
    expect(res.status()).toBe(401);
  });
});

publicTest.describe('GET /api/user/:id (unauthenticated)', () => {
  publicTest('returns 401 without an auth token', async ({ request }) => {
    const res = await request.get('/api/user/some-id');
    expect(res.status()).toBe(401);
  });
});

test.describe('GET /api/user (authenticated)', () => {
  test('returns 200 with an array of users', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/user');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('response includes the seeded E2E test user', async ({
    authedRequest,
    testUser,
  }) => {
    const res = await authedRequest.get('/api/user');
    const body = await res.json();
    const found = body.data.some(
      (u: { email: string }) => u.email === testUser.email,
    );
    expect(found).toBe(true);
  });

  test('users in response do not expose password field', async ({
    authedRequest,
  }) => {
    const res = await authedRequest.get('/api/user');
    const body = await res.json();
    for (const user of body.data) {
      expect(user).not.toHaveProperty('password');
    }
  });
});

test.describe('GET /api/user/:id (authenticated)', () => {
  test('returns 400 for an invalid UUID', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/user/not-a-uuid');
    expect(res.status()).toBe(400);
  });

  test('returns 404 for a valid UUID that does not exist', async ({
    authedRequest,
  }) => {
    const res = await authedRequest.get(
      '/api/user/00000000-0000-0000-0000-000000000000',
    );
    expect(res.status()).toBe(404);
  });

  test('returns 200 for the seeded test user ID', async ({
    authedRequest,
    testUser,
  }) => {
    if (!testUser.userId) {
      test.skip();
      return;
    }
    const res = await authedRequest.get(`/api/user/${testUser.userId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.email).toBe(testUser.email);
    expect(body.data).not.toHaveProperty('password');
  });
});
