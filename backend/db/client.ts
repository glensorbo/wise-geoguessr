import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { gameRounds } from './schemas/gameRounds';
import { gameScores } from './schemas/gameScores';
import { refreshTokens } from './schemas/refreshTokens';
import { users } from './schemas/users';
import { logger } from '@backend/telemetry';

let cachedClient: postgres.Sql | null = null;
let cachedDb: ReturnType<typeof drizzle> | null = null;

export const getDb = () => {
  if (cachedDb) {
    return cachedDb;
  }

  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_SERVER, POSTGRES_DB } =
    Bun.env;

  if (
    !POSTGRES_USER ||
    !POSTGRES_PASSWORD ||
    !POSTGRES_SERVER ||
    !POSTGRES_DB
  ) {
    throw new Error(
      'Missing required database environment variables: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_SERVER, POSTGRES_DB',
    );
  }

  const connectionString = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_SERVER}/${POSTGRES_DB}`;

  cachedClient = postgres(connectionString, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
    onnotice: () => {},
  });

  const schema = { users, refreshTokens, gameRounds, gameScores };
  cachedDb = drizzle(cachedClient, { schema });

  logger.info('🔌 Database connection established');

  return cachedDb;
};

const PING_RETRIES = 5;
const PING_BASE_DELAY_MS = 1_000;

/**
 * Verifies the database is reachable by running SELECT 1.
 * Retries with exponential backoff up to PING_RETRIES times.
 * Throws if the database is unreachable after all attempts.
 */
export const pingDb = async (): Promise<void> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= PING_RETRIES; attempt++) {
    try {
      await getDb().execute(sql`SELECT 1`);
      return;
    } catch (err) {
      lastError = err;
      const delayMs = PING_BASE_DELAY_MS * 2 ** (attempt - 1);
      logger.warn(
        `⚠️  DB connection attempt ${attempt}/${PING_RETRIES} failed. Retrying in ${delayMs}ms…`,
      );
      await Bun.sleep(delayMs);
    }
  }

  logger.error(
    `❌ Failed to connect to the database after ${PING_RETRIES} attempts`,
  );
  throw lastError;
};
