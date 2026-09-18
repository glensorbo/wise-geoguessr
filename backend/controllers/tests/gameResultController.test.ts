import { describe, expect, test } from 'bun:test';

import { createGameResultController } from '@backend/controllers/gameResultController';
import { createGameResultService } from '@backend/services/gameResultService';
import { mockGameResultRepository } from '@backend/utils/test';

import type { GameResult } from '@backend/types/gameResult';

const service = createGameResultService(mockGameResultRepository);
const controller = createGameResultController(service);

const makeRequest = (body: unknown, url = 'http://localhost/api/results') =>
  new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as Parameters<typeof controller.addResult>[0];

describe('GameResultController', () => {
  describe('getYears', () => {
    test('returns 200', async () => {
      const res = await controller.getYears();
      expect(res.status).toBe(200);
    });

    test('returns an array', async () => {
      const res = await controller.getYears();
      const body = (await res.json()) as { data: number[] };
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('getResults', () => {
    test('returns 200 with no year param', async () => {
      const req = new Request('http://localhost/api/results') as Parameters<
        typeof controller.getResults
      >[0];
      const res = await controller.getResults(req);
      expect(res.status).toBe(200);
    });

    test('returns 200 with valid year param', async () => {
      const req = new Request(
        'http://localhost/api/results?year=2026',
      ) as Parameters<typeof controller.getResults>[0];
      const res = await controller.getResults(req);
      expect(res.status).toBe(200);
    });

    test('returns 400 for invalid year param', async () => {
      const req = new Request(
        'http://localhost/api/results?year=abc',
      ) as Parameters<typeof controller.getResults>[0];
      const res = await controller.getResults(req);
      expect(res.status).toBe(400);
    });
  });

  describe('getRoundById', () => {
    test('returns 200 for an existing round ID', async () => {
      const req = new Request(
        'http://localhost/api/results/00000000-0000-0000-0000-000000000001',
        { method: 'GET' },
      ) as Parameters<typeof controller.getRoundById>[0];
      req.params = { roundId: '00000000-0000-0000-0000-000000000001' };
      const res = await controller.getRoundById(req);
      expect(res.status).toBe(200);
      const body = (await res.json()) as { data: GameResult };
      expect(body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    test('returns 404 for a non-existent round ID', async () => {
      const req = new Request(
        'http://localhost/api/results/00000000-0000-0000-0000-000000000999',
        { method: 'GET' },
      ) as Parameters<typeof controller.getRoundById>[0];
      req.params = { roundId: '00000000-0000-0000-0000-000000000999' };
      const res = await controller.getRoundById(req);
      expect(res.status).toBe(404);
    });
  });

  describe('addResult', () => {
    test('returns 400 for missing date', async () => {
      const req = makeRequest({ scores: { Glen: 1000 } });
      const res = await controller.addResult(req);
      expect(res.status).toBe(400);
    });

    test('returns 400 for missing scores', async () => {
      const req = makeRequest({ date: '2030-06-01' });
      const res = await controller.addResult(req);
      expect(res.status).toBe(400);
    });

    test('returns 409 for duplicate date', async () => {
      const req = makeRequest({
        date: '2026-03-27',
        scores: { Glen: 1000 },
      });
      const res = await controller.addResult(req);
      expect(res.status).toBe(409);
    });

    test('returns 201 for valid new result', async () => {
      const req = makeRequest({
        date: '2030-01-15',
        scores: { Glen: 15000, Thomas: 12000 },
      });
      const res = await controller.addResult(req);
      expect(res.status).toBe(201);
      const body = (await res.json()) as { data: GameResult };
      expect(body.data.date).toBe('2030-01-15');
    });
  });
});
