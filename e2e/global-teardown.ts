import { execSync } from 'child_process';

/**
 * Runs after all tests complete.
 * Wipes any game data added during the test run and re-seeds the 48
 * canonical records so the app is always left in a clean, consistent state.
 */
export default async function globalTeardown() {
  console.log('\n🧹 Teardown: resetting game data to canonical 48 records…');
  execSync('bun e2e/seed-game-data.ts', { stdio: 'inherit' });
}
