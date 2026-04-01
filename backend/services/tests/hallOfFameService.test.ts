import { describe, expect, test } from 'bun:test';

import { createHallOfFameService } from '@backend/services/hallOfFameService';
import { mockHallOfFameRepository } from '@backend/utils/test';

import type { HallOfFame } from '@backend/types/hallOfFame';

const service = createHallOfFameService(mockHallOfFameRepository);

const emptyMockRepository = {
  async getHallOfFame(): Promise<HallOfFame> {
    return {
      highestSingleRoundScore: null,
      longestWinStreak: null,
      highestSeasonTotal: null,
      mostRoundsPlayed: null,
      highestAverageScore: null,
      mostRunnerUpFinishes: null,
    };
  },
};

const emptyService = createHallOfFameService(emptyMockRepository);

describe('HallOfFameService', () => {
  describe('getHallOfFame — with data', () => {
    test('returns an object with all six record categories', async () => {
      const result = await service.getHallOfFame();
      expect(typeof result).toBe('object');
      expect('highestSingleRoundScore' in result).toBe(true);
      expect('longestWinStreak' in result).toBe(true);
      expect('highestSeasonTotal' in result).toBe(true);
      expect('mostRoundsPlayed' in result).toBe(true);
      expect('highestAverageScore' in result).toBe(true);
      expect('mostRunnerUpFinishes' in result).toBe(true);
    });

    test('highestSingleRoundScore has a numeric score and a non-empty holders array', async () => {
      const result = await service.getHallOfFame();
      expect(result.highestSingleRoundScore).not.toBeNull();
      expect(typeof result.highestSingleRoundScore!.score).toBe('number');
      expect(Array.isArray(result.highestSingleRoundScore!.holders)).toBe(true);
      expect(result.highestSingleRoundScore!.holders.length).toBeGreaterThan(0);
    });

    test('highestSingleRoundScore holders have playerName and date fields', async () => {
      const result = await service.getHallOfFame();
      for (const holder of result.highestSingleRoundScore!.holders) {
        expect(typeof holder.playerName).toBe('string');
        expect(typeof holder.date).toBe('string');
      }
    });

    test('longestWinStreak has a numeric streak and a non-empty holders array', async () => {
      const result = await service.getHallOfFame();
      expect(result.longestWinStreak).not.toBeNull();
      expect(typeof result.longestWinStreak!.streak).toBe('number');
      expect(Array.isArray(result.longestWinStreak!.holders)).toBe(true);
      expect(result.longestWinStreak!.holders.length).toBeGreaterThan(0);
    });

    test('longestWinStreak holders have playerName, startDate, and endDate fields', async () => {
      const result = await service.getHallOfFame();
      for (const holder of result.longestWinStreak!.holders) {
        expect(typeof holder.playerName).toBe('string');
        expect(typeof holder.startDate).toBe('string');
        expect(typeof holder.endDate).toBe('string');
      }
    });

    test('highestSeasonTotal has a numeric total and a non-empty holders array', async () => {
      const result = await service.getHallOfFame();
      expect(result.highestSeasonTotal).not.toBeNull();
      expect(typeof result.highestSeasonTotal!.total).toBe('number');
      expect(Array.isArray(result.highestSeasonTotal!.holders)).toBe(true);
      expect(result.highestSeasonTotal!.holders.length).toBeGreaterThan(0);
    });

    test('highestSeasonTotal holders have playerName and year fields', async () => {
      const result = await service.getHallOfFame();
      for (const holder of result.highestSeasonTotal!.holders) {
        expect(typeof holder.playerName).toBe('string');
        expect(typeof holder.year).toBe('number');
      }
    });

    test('mostRoundsPlayed has a numeric rounds count and a non-empty holders array', async () => {
      const result = await service.getHallOfFame();
      expect(result.mostRoundsPlayed).not.toBeNull();
      expect(typeof result.mostRoundsPlayed!.rounds).toBe('number');
      expect(result.mostRoundsPlayed!.holders.length).toBeGreaterThan(0);
    });

    test('highestAverageScore has a numeric average and a non-empty holders array', async () => {
      const result = await service.getHallOfFame();
      expect(result.highestAverageScore).not.toBeNull();
      expect(typeof result.highestAverageScore!.average).toBe('number');
      expect(result.highestAverageScore!.holders.length).toBeGreaterThan(0);
    });

    test('mostRunnerUpFinishes has a numeric count and a non-empty holders array', async () => {
      const result = await service.getHallOfFame();
      expect(result.mostRunnerUpFinishes).not.toBeNull();
      expect(typeof result.mostRunnerUpFinishes!.count).toBe('number');
      expect(result.mostRunnerUpFinishes!.holders.length).toBeGreaterThan(0);
    });
  });

  describe('getHallOfFame — empty database', () => {
    test('returns null for all fields when no data exists', async () => {
      const result = await emptyService.getHallOfFame();
      expect(result.highestSingleRoundScore).toBeNull();
      expect(result.longestWinStreak).toBeNull();
      expect(result.highestSeasonTotal).toBeNull();
      expect(result.mostRoundsPlayed).toBeNull();
      expect(result.highestAverageScore).toBeNull();
      expect(result.mostRunnerUpFinishes).toBeNull();
    });
  });
});
