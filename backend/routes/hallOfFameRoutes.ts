import { hallOfFameController } from '@backend/controllers/hallOfFameController';

/**
 * Hall of Fame Routes
 * GET /api/hall-of-fame — public, returns all-time records
 */
export const hallOfFameRoutes = {
  '/api/hall-of-fame': {
    GET: () => hallOfFameController.getHallOfFame(),
  },
};
