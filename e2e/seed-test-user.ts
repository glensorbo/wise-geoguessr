/**
 * Seeds the E2E test user directly to the DB.
 * Runs as a Bun subprocess from global-setup.ts so Bun APIs are available.
 */
import { userRepository } from '../backend/repositories/userRepository';

const email = Bun.env.E2E_TEST_EMAIL ?? 'e2e-playwright@local.test';
const password =
  Bun.env.E2E_TEST_PASSWORD ??
  'correct-horse-battery-staple-purple-elephant-dancing-at-midnight-with-seven-golden-penguins-in-antarctica-42';
const name = Bun.env.E2E_TEST_NAME ?? 'Playwright E2E User';

const existing = await userRepository.getByEmail(email);

if (!existing) {
  const hashed = await Bun.password.hash(password);
  await userRepository.create(email, name, hashed);
  console.log(`🌱 E2E test user seeded: ${email}`);
} else {
  console.log(`✅ E2E test user already exists: ${email}`);
}

process.exit(0);
