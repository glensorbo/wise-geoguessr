import { upsertUserWithPassword } from '../auth/repository';
import { assertCreatePassword, normalizeEmail } from '../auth/users';
import { getSeedUserCredentials } from '../config';
import { closeDatabase } from './client';

const run = async () => {
  const credentials = getSeedUserCredentials();

  if (credentials === null) {
    console.log('ℹ️ No seed user configured, skipping user seed');
    return;
  }

  assertCreatePassword(credentials.password);

  const user = await upsertUserWithPassword({
    email: normalizeEmail(credentials.email),
    password: credentials.password,
  });

  console.log(`✅ Seeded user ${user.email}`);
};

try {
  await run();
} finally {
  await closeDatabase();
}
