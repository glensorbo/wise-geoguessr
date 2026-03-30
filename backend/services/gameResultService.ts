import { gameResultRepository } from '@backend/repositories/gameResultRepository';

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

  async addResult(
    date: string,
    scores: Record<string, number>,
  ): Promise<ErrorOr<GameResult>> {
    const existing = await repo.getByDate(date);
    if (existing) {
      return {
        data: null,
        error: [
          { type: 'conflict', message: `A result for ${date} already exists` },
        ],
      };
    }

    const result = await repo.create(date, scores);
    return { data: result, error: null };
  },
});

export const gameResultService = createGameResultService(gameResultRepository);
