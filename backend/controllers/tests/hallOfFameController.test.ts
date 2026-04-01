import { describe, expect, test } from 'bun:test';

import { createHallOfFameController } from '@backend/controllers/hallOfFameController';
import { createHallOfFameService } from '@backend/services/hallOfFameService';
import { mockHallOfFameRepository } from '@backend/utils/test';

const service = createHallOfFameService(mockHallOfFameRepository);
const controller = createHallOfFameController(service);

describe('HallOfFameController', () => {
  describe('getHallOfFame', () => {
    test('returns 200', async () => {
      const res = await controller.getHallOfFame();
      expect(res.status).toBe(200);
    });

    test('returns JSON content type', async () => {
      const res = await controller.getHallOfFame();
      expect(res.headers.get('content-type')).toContain('application/json');
    });

    test('body has a data property', async () => {
      const res = await controller.getHallOfFame();
      const body = (await res.json()) as { data: unknown };
      expect('data' in body).toBe(true);
    });

    test('data contains the three hall of fame record categories', async () => {
      const res = await controller.getHallOfFame();
      const body = (await res.json()) as {
        data: {
          highestSingleRoundScore: unknown;
          longestWinStreak: unknown;
          highestSeasonTotal: unknown;
        };
      };
      expect('highestSingleRoundScore' in body.data).toBe(true);
      expect('longestWinStreak' in body.data).toBe(true);
      expect('highestSeasonTotal' in body.data).toBe(true);
    });
  });
});
