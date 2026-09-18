import { refreshTokenConfig } from './refreshTokenConfig';

/**
 * Builds a Set-Cookie header that immediately expires the refresh token cookie.
 * Use this on logout or when a refresh token is rejected.
 */
export const clearRefreshCookie = (): string =>
  `${refreshTokenConfig.cookieName}=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=0`;
