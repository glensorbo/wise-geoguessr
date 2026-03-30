import { refreshTokenConfig } from './refreshTokenConfig';

import type { BunRequest } from '@backend/middleware';

/**
 * Extracts the raw refresh token value from the incoming request's Cookie header.
 * Returns `null` if the cookie is absent.
 */
export const readRefreshCookie = (req: BunRequest): string | null => {
  const cookieHeader = req.headers.get('Cookie') ?? '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${refreshTokenConfig.cookieName}=`));
  return match ? match.slice(refreshTokenConfig.cookieName.length + 1) : null;
};
