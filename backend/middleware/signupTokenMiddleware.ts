import { verifyToken } from '@backend/utils/auth';
import { unauthorizedError } from '@backend/utils/response';

import type { MiddlewareFn } from '.';

/**
 * Signup Token Middleware
 *
 * Verifies that the Bearer JWT is a valid signup token (tokenType: 'signup').
 * Only valid for the set-password endpoint — regular auth tokens are rejected.
 *
 * On success, attaches the decoded payload to ctx.user.
 * On failure, returns 401 — short-circuiting the chain.
 *
 * @example
 * withMiddleware(signupTokenMiddleware)((req, ctx) => {
 *   const { sub } = (ctx as SignupCtx).user;
 *   return controller.setPassword(req, ctx);
 * })
 */
export const signupTokenMiddleware: MiddlewareFn = async (req, ctx) => {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorizedError('Missing or invalid Authorization header');
  }

  const result = await verifyToken(authHeader.slice(7));

  if (result.error) {
    return unauthorizedError('Invalid or expired token');
  }

  if (result.data.tokenType !== 'signup') {
    return unauthorizedError('A signup token is required for this endpoint');
  }

  ctx.user = result.data;
  return null;
};
