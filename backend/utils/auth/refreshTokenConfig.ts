/**
 * Shared configuration for refresh tokens.
 * Used by cookie helpers, the repository, and tests.
 */
export const refreshTokenConfig = {
  cookieName: 'refresh_token',
  /** 7 days in seconds — used for the Set-Cookie Max-Age attribute. */
  ttlSeconds: 7 * 24 * 60 * 60,
  /** 7 days — used when calculating the DB expiry timestamp. */
  ttlDays: 7,
} as const;
