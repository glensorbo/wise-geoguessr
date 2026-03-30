import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';

import { getDb } from '../db/client';
import { refreshTokens } from '../db/schemas/refreshTokens';
import { refreshTokenConfig } from '../utils/auth';

import type { RefreshToken } from '@backend/types/refreshToken';

/**
 * Refresh Token Repository
 * Handles all database operations for refresh tokens.
 * Pure data access layer — no business logic.
 */
export const refreshTokenRepository = {
  /**
   * Store a new hashed refresh token for a user.
   * @param userId - UUID of the owning user
   * @param tokenHash - SHA-256 hex hash of the raw token
   * @returns The stored record
   */
  async create(userId: string, tokenHash: string): Promise<RefreshToken> {
    const db = getDb();
    const expiresAt = dayjs()
      .add(refreshTokenConfig.ttlDays, 'day')
      .toISOString();
    const result = await db
      .insert(refreshTokens)
      .values({ userId, tokenHash, expiresAt })
      .returning();
    return result[0]!;
  },

  /**
   * Look up a refresh token record by its SHA-256 hash.
   * @param tokenHash - SHA-256 hex hash of the raw token from the cookie
   */
  async getByTokenHash(tokenHash: string): Promise<RefreshToken | undefined> {
    const db = getDb();
    const result = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash));
    return result[0];
  },

  /**
   * Delete a single refresh token by its primary key (used during rotation).
   */
  async deleteById(id: string): Promise<void> {
    const db = getDb();
    await db.delete(refreshTokens).where(eq(refreshTokens.id, id));
  },

  /**
   * Revoke all refresh tokens for a user (logout from all devices).
   */
  async deleteByUserId(userId: string): Promise<void> {
    const db = getDb();
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  },
};
