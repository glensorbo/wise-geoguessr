import { verifyToken } from '@backend/utils/auth';
import { unauthorizedError } from '@backend/utils/response';

import type { MiddlewareFn } from '.';

/**
 * Auth Middleware
 *
 * Extracts and verifies a Bearer JWT from the Authorization header.
 * On success, attaches the decoded payload to ctx.user for downstream use.
 * On failure, returns a 401 Unauthorized response — short-circuiting the chain.
 *
 * Rejects signup tokens — those are only valid for /api/auth/set-password.
 *
 * Requires JWT_SECRET env var to be set.
 *
 * @example
 * withMiddleware(authMiddleware)((req, ctx) => {
 *   const { sub } = (ctx as AuthCtx).user;
 *   return controller.getProfile(sub);
 * })
 */
export const authMiddleware: MiddlewareFn = async (req, ctx) => {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorizedError('Missing or invalid Authorization header');
  }

  const result = await verifyToken(authHeader.slice(7));

  if (result.error) {
    return unauthorizedError('Invalid or expired token');
  }

  if (result.data.tokenType === 'signup') {
    return unauthorizedError('Signup tokens cannot be used here');
  }

  ctx.user = result.data;
  return null;
};
