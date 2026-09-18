import { gameResultRepository } from '@backend/repositories/gameResultRepository';
import { logger, withSpan } from '@backend/telemetry';

import type { ErrorOr } from '@backend/types/errorOr';
import type { GameResult } from '@backend/types/gameResult';

export const createGameResultService = (repo: typeof gameResultRepository) => ({
  async getResultsByYear(year?: number): Promise<GameResult[]> {
    if (year !== undefined) {
      return repo.getByYear(year);
    }
    return repo.getAll();
  },

  async getAvailableYears(): Promise<number[]> {
    return repo.getAvailableYears();
  },

  async getRoundById(id: string): Promise<ErrorOr<GameResult>> {
    const result = await repo.getById(id);
    if (!result) {
      return {
        data: null,
        error: [{ type: 'not_found', message: `Round ${id} not found` }],
      };
    }
    return { data: result, error: null };
  },

  async addResult(
    date: string,
    scores: Record<string, number>,
    gameLink?: string,
  ): Promise<ErrorOr<GameResult>> {
    return withSpan(
      'game_result.create',
      { 'game_result.has_game_link': !!gameLink },
      async (span) => {
        const existing = await repo.getByDate(date);
        if (existing) {
          logger.warn('Round already exists for date', { date });
          return {
            data: null,
            error: [
              {
                type: 'conflict',
                message: `A result for ${date} already exists`,
              },
            ],
          };
        }

        const result = await repo.create(date, scores, gameLink);

        span.setAttribute('game_result.id', result.id);
        logger.info('Round created', {
          roundId: result.id,
          date,
          hasGameLink: !!gameLink,
        });

        return { data: result, error: null };
      },
    );
  },
});

export const gameResultService = createGameResultService(gameResultRepository);
