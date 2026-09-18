import { describe, expect, test } from 'bun:test';

import { createGameResultService } from '@backend/services/gameResultService';
import { mockGameResultRepository } from '@backend/utils/test';

const service = createGameResultService(mockGameResultRepository);

describe('GameResultService', () => {
  describe('getAvailableYears', () => {
    test('returns an array of years', async () => {
      const years = await service.getAvailableYears();
      expect(Array.isArray(years)).toBe(true);
    });

    test('returns years in descending order', async () => {
      const years = await service.getAvailableYears();
      expect(years[0]).toBeGreaterThan(years[1]!);
    });
  });

  describe('getResultsByYear', () => {
    test('returns results for a specific year', async () => {
      const results = await service.getResultsByYear(2026);
      expect(results.every((r) => r.date.startsWith('2026'))).toBe(true);
    });

    test('each result has a date and scores', async () => {
      const results = await service.getResultsByYear(2026);
      for (const result of results) {
        expect(typeof result.date).toBe('string');
        expect(typeof result.scores).toBe('object');
      }
    });
  });

  describe('getRoundById', () => {
    test('returns the round for a valid ID', async () => {
      const result = await service.getRoundById(
        '00000000-0000-0000-0000-000000000001',
      );
      expect(result.error).toBeNull();
      expect(result.data?.date).toBe('2026-03-27');
    });

    test('returns not_found error for unknown ID', async () => {
      const result = await service.getRoundById(
        '00000000-0000-0000-0000-000000000999',
      );
      expect(result.data).toBeNull();
      expect(result.error?.[0]?.type).toBe('not_found');
    });
  });

  describe('addResult', () => {
    test('returns conflict error if date already exists', async () => {
      const result = await service.addResult('2026-03-27', { Glen: 1000 });
      expect(result.error).not.toBeNull();
      expect(result.error?.[0]?.type).toBe('conflict');
    });

    test('returns success for a new date', async () => {
      const result = await service.addResult('2030-01-01', { Glen: 1000 });
      expect(result.error).toBeNull();
      expect(result.data?.date).toBe('2030-01-01');
    });
  });
});
