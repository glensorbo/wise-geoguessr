import { userRepository } from '../repositories/userRepository';

/**
 * Seed script — idempotent, safe to run multiple times.
 *
 * Creates the initial admin user from env vars. Historical game results are
 * seeded by the `0005_seed_game_results` data migration, not by this script.
 *
 * Env vars:
 *   SEED_ADMIN_EMAIL    (required)
 *   SEED_ADMIN_PASSWORD (required)
 *   SEED_ADMIN_NAME     (optional, defaults to "Admin")
 */

const email = Bun.env.SEED_ADMIN_EMAIL;
const password = Bun.env.SEED_ADMIN_PASSWORD;
const name = Bun.env.SEED_ADMIN_NAME ?? 'Admin';

if (!email || !password) {
  console.error('❌ SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required');
  process.exit(1);
}

const existing = await userRepository.getByEmail(email);

if (existing) {
  console.log(`✅ Admin user already exists: ${email}`);
} else {
  const hashedPassword = await Bun.password.hash(password);
  await userRepository.create(email, name, hashedPassword, 'admin');
  console.log(`🌱 Admin user seeded: ${email}`);
}

process.exit(0);
