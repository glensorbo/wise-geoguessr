import { forbiddenError, unauthorizedError } from '@backend/utils/response';

import type { MiddlewareFn } from '.';
import type { AppJwtPayload, UserRole } from '@backend/types/appJwtPayload';

/**
 * Role-based access control middleware factory.
 * Must be used AFTER authMiddleware (relies on ctx.user being set).
 * Returns 403 if the authenticated user does not have one of the required roles.
 */
export const requireRole =
  (...roles: UserRole[]): MiddlewareFn =>
  (_req, ctx) => {
    const user = ctx.user as AppJwtPayload | undefined;
    if (!user) {
      return Promise.resolve(unauthorizedError('Not authenticated'));
    }
    if (!roles.includes(user.role)) {
      return Promise.resolve(
        forbiddenError('You do not have permission to perform this action'),
      );
    }
    return Promise.resolve(null);
  };
