import { z } from 'zod';

import { gameResultService } from '@backend/services/gameResultService';
import {
  serviceErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@backend/utils/response';
import { addGameResultSchema } from '@backend/validation/schemas/gameResult';
import { validateRequest } from '@backend/validation/utils/validateRequest';

import type { BunRequest } from '@backend/middleware';

const yearSchema = z.coerce.number().int().min(2000).max(2100);

export const createGameResultController = (
  service: typeof gameResultService,
) => ({
  async getYears(): Promise<Response> {
    const years = await service.getAvailableYears();
    return successResponse(years);
  },

  async getResults(req: BunRequest): Promise<Response> {
    const url = new URL(req.url);
    const yearParam = url.searchParams.get('year');

    let year: number | undefined;
    if (yearParam !== null) {
      const parsed = yearSchema.safeParse(yearParam);
      if (!parsed.success) {
        return validationErrorResponse('Invalid year parameter', [
          { field: 'year', message: 'Must be a valid 4-digit year' },
        ]);
      }
      year = parsed.data;
    }

    const results = await service.getResultsByYear(year);
    return successResponse(results);
  },

  async addResult(req: BunRequest): Promise<Response> {
    const validation = await validateRequest(addGameResultSchema, req);
    if (validation.errors) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const { date, scores } = validation.data;
    const result = await service.addResult(date, scores);

    if (result.error) {
      return serviceErrorResponse(result.error);
    }

    return successResponse(result.data, 201);
  },
});

export const gameResultController =
  createGameResultController(gameResultService);
