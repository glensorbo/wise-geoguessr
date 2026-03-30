import { userController } from '@backend/controllers/userController';
import { withMiddleware } from '@backend/middleware';
import { authMiddleware } from '@backend/middleware/authMiddleware';

/**
 * User Routes
 * All /api/user routes. Protected by authMiddleware.
 * Spread into Bun.serve() routes: { ...userRoutes }
 */
export const userRoutes = {
  '/api/user': {
    GET: withMiddleware(authMiddleware)(() => userController.getUsers()),
  },

  '/api/user/:id': {
    GET: withMiddleware(authMiddleware)((req) => {
      const id = req.params['id'] ?? '';
      return userController.getUserById(id);
    }),
  },
};
