import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { users } from './schemas/users';

/**
 * Database client singleton
 * Cached to avoid creating multiple connections
 */
let cachedClient: postgres.Sql | null = null;
let cachedDb: ReturnType<typeof drizzle> | null = null;

/**
 * Get database client
 * Creates a new client if none exists, otherwise returns cached client
 * @returns Drizzle database instance
 */
export const getDb = () => {
  // Return cached instance if it exists
  if (cachedDb) {
    return cachedDb;
  }

  // Get connection string from environment
  const connectionString = Bun.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Create postgres connection
  cachedClient = postgres(connectionString);

  // Create drizzle instance with all schemas
  const schema = { users };
  cachedDb = drizzle(cachedClient, { schema });

  console.log('🔌 Database connection established');

  return cachedDb;
};

/**
 * Get raw postgres client
 * Useful for transactions or direct queries
 * @returns Raw postgres client
 */
export const getClient = () => {
  if (!cachedClient) {
    // Trigger db creation to initialize client
    getDb();
  }
  return cachedClient!;
};
