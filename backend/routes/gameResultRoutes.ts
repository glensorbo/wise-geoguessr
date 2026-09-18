import { gameResultController } from '@backend/controllers/gameResultController';
import { withMiddleware } from '@backend/middleware';
import { authMiddleware } from '@backend/middleware/authMiddleware';

import type { BunRequest } from '@backend/middleware';

/**
 * Game Result Routes
 * GET  /api/results/years         — public, returns available years
 * GET  /api/results               — public, returns results (optionally filtered by ?year=YYYY)
 * GET  /api/results/:roundId      — public, returns a single round by ID
 * POST /api/results               — authenticated, adds a new game round
 *
 * Note: /api/results/years must be declared before /api/results/:roundId to avoid
 * the wildcard matching "years" as a roundId.
 */
export const gameResultRoutes = {
  '/api/results/years': {
    GET: () => gameResultController.getYears(),
  },

  '/api/results': {
    GET: (req: BunRequest) => gameResultController.getResults(req),
    POST: withMiddleware(authMiddleware)((req) =>
      gameResultController.addResult(req),
    ),
  },

  '/api/results/:roundId': {
    GET: (req: BunRequest) => gameResultController.getRoundById(req),
  },
};
