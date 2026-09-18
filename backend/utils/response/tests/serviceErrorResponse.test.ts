import { describe, test, expect } from 'bun:test';

import { serviceErrorResponse } from '../serviceErrorResponse';

import type { AppError } from '@backend/types/appError';

describe('serviceErrorResponse', () => {
  test('not_found error returns 404', async () => {
    const errors: AppError[] = [{ type: 'not_found', message: 'Not found' }];
    const response = serviceErrorResponse(errors);
    expect(response.status).toBe(404);
  });

  test('conflict error returns 409', async () => {
    const errors: AppError[] = [
      { type: 'conflict', message: 'Already exists', field: 'email' },
    ];
    const response = serviceErrorResponse(errors);
    expect(response.status).toBe(409);
    const body = (await response.json()) as {
      message: string;
    };
    expect(body.message).toBe('Already exists');
  });

  test('validation error returns 400 with all field errors', async () => {
    const errors: AppError[] = [
      { type: 'validation', message: 'Invalid', field: 'name' },
      { type: 'validation', message: 'Invalid', field: 'email' },
    ];
    const response = serviceErrorResponse(errors);
    expect(response.status).toBe(400);
    const body = (await response.json()) as {
      error: { errors: { field: string }[] };
    };
    expect(body.error.errors.length).toBe(2);
  });

  test('unauthorized error returns 401', async () => {
    const errors: AppError[] = [
      { type: 'unauthorized', message: 'Unauthorized' },
    ];
    const response = serviceErrorResponse(errors);
    expect(response.status).toBe(401);
  });

  test('errors without field are excluded from field errors list', async () => {
    const errors: AppError[] = [
      { type: 'validation', message: 'General error' },
    ];
    const response = serviceErrorResponse(errors);
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: { errors: unknown[] } };
    expect(body.error.errors.length).toBe(0);
  });
});
