import { authController } from '@backend/controllers/authController';
import { withMiddleware } from '@backend/middleware';
import { authMiddleware } from '@backend/middleware/authMiddleware';
import { authRateLimit } from '@backend/middleware/rateLimitMiddleware';
import { signupTokenMiddleware } from '@backend/middleware/signupTokenMiddleware';

export const authRoutes = {
  '/api/auth/login': {
    POST: withMiddleware(authRateLimit)((req) => authController.login(req)),
  },
  '/api/auth/create-user': {
    POST: withMiddleware(authMiddleware)((req) =>
      authController.createUser(req),
    ),
  },
  '/api/auth/set-password': {
    POST: withMiddleware(signupTokenMiddleware)((req, ctx) =>
      authController.setPassword(req, ctx),
    ),
  },
  '/api/auth/change-password': {
    POST: withMiddleware(authMiddleware)((req, ctx) =>
      authController.changePassword(req, ctx),
    ),
  },
  '/api/auth/refresh': {
    POST: withMiddleware(authRateLimit)((req) => authController.refresh(req)),
  },
  '/api/auth/logout': {
    POST: withMiddleware()((req) => authController.logout(req)),
  },
};
