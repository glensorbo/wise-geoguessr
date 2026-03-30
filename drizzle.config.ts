import { defineConfig } from 'drizzle-kit';

// Build connection string from individual environment variables
const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_SERVER, POSTGRES_DB } =
  Bun.env;

const connectionString = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_SERVER}/${POSTGRES_DB}`;

export default defineConfig({
  schema: './backend/db/schemas/*.ts',
  out: './backend/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
});
