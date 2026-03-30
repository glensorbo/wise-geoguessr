import { execSync } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

import type { FullConfig } from '@playwright/test';

/**
 * E2E test user credentials.
 * The passphrase is intentionally long — tests run against it programmatically,
 * nobody ever has to type it.
 *
 * These are exported so spec files can reference credentials without duplication.
 */
export const E2E_EMAIL =
  process.env.E2E_TEST_EMAIL ?? 'e2e-playwright@local.test';
export const E2E_PASSWORD =
  process.env.E2E_TEST_PASSWORD ??
  'correct-horse-battery-staple-purple-elephant-dancing-at-midnight-with-seven-golden-penguins-in-antarctica-42';
export const E2E_NAME = process.env.E2E_TEST_NAME ?? 'Playwright E2E User';

export const AUTH_FILE = path.resolve('.auth/user.json');

export default async function globalSetup(config: FullConfig) {
  const project = config.projects[0];
  const baseURL = project?.use.baseURL ?? 'http://localhost:3000';

  seedTestUser();
  seedGameData();
  await loginAndSaveToken(baseURL);
}

/**
 * Seeds the test user by spawning a Bun subprocess.
 * This keeps Bun-specific APIs (Bun.env, Bun.password) out of the Node.js
 * Playwright runner context where they are not defined.
 */
function seedTestUser() {
  execSync('bun e2e/seed-test-user.ts', { stdio: 'inherit' });
}

/**
 * Wipes all game data and re-seeds the 48 canonical historical records.
 * This ensures every test run starts from a known, consistent state.
 */
function seedGameData() {
  console.log('🌱 Setup: seeding game data to canonical 48 records…');
  execSync('bun e2e/seed-game-data.ts', { stdio: 'inherit' });
}

async function loginAndSaveToken(baseURL: string) {
  const res = await fetch(`${baseURL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: E2E_EMAIL, password: E2E_PASSWORD }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`❌ E2E login failed (${res.status}): ${body}`);
  }

  const body = (await res.json()) as { data: { token: string } };
  const token = body.data.token;

  // Fetch the user ID so tests can use it (e.g. GET /api/user/:id)
  const meRes = await fetch(`${baseURL}/api/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meBody = (await meRes.json()) as {
    data: Array<{ id: string; email: string }>;
  };
  const userId = meBody.data.find((u) => u.email === E2E_EMAIL)?.id ?? null;

  await mkdir(path.dirname(AUTH_FILE), { recursive: true });
  await writeFile(
    AUTH_FILE,
    JSON.stringify({ token, userId, email: E2E_EMAIL }, null, 2),
  );
  console.log('🔐 E2E auth token saved');
}
