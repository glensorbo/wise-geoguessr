import { refreshTokenConfig } from './refreshTokenConfig';

/**
 * Builds a Set-Cookie header value for an active refresh token.
 *
 * Attributes:
 * - `HttpOnly`       — JS cannot read the cookie, blocking XSS theft.
 * - `Secure`         — Only sent over HTTPS.
 * - `SameSite=Strict` — Only sent on same-origin requests, blocking CSRF.
 * - `Path=/api/auth`  — Cookie is scoped to auth endpoints only.
 */
export const buildRefreshCookie = (token: string): string =>
  `${refreshTokenConfig.cookieName}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=${refreshTokenConfig.ttlSeconds}`;
