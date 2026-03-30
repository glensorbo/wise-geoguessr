import { test as base, expect } from '@playwright/test';
import { readFileSync } from 'fs';

import { AUTH_FILE } from '../global-setup';

import type { APIRequestContext } from '@playwright/test';

type AuthState = {
  token: string;
  userId: string | null;
  email: string;
};

type AuthFixtures = {
  /** Authenticated API request context — Bearer token pre-set on every request. */
  authedRequest: APIRequestContext;
  /** The seeded E2E test user's data for use in assertions. */
  testUser: AuthState;
};

export const test = base.extend<AuthFixtures>({
  // eslint-disable-next-line no-empty-pattern
  testUser: async ({}: object, use) => {
    const state: AuthState = JSON.parse(readFileSync(AUTH_FILE, 'utf-8'));
    await use(state);
  },

  authedRequest: async ({ playwright, baseURL, testUser }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${testUser.token}`,
      },
    });
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect };
