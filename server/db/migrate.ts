import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { closeDatabase, getDatabase } from './client';

const run = async () => {
  await migrate(getDatabase(), {
    migrationsFolder: './server/db/migrations',
  });
};

try {
  await run();
  console.log('✅ Database migrations applied');
} finally {
  await closeDatabase();
}
