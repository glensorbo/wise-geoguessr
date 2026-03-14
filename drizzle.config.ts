import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/db/schemas/*.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: Bun.env.DATABASE_URL!,
  },
});
