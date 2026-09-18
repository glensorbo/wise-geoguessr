import { describe, test, expect } from 'bun:test';

import { unauthorizedError } from '../unauthorizedError';

import type { ApiErrorResponse } from '@backend/types/apiErrorResponse';

describe('unauthorizedError', () => {
  test('returns a Response with status 401', () => {
    const res = unauthorizedError('Unauthorized');
    expect(res.status).toBe(401);
  });

  test('body has error.type === unauthorized', async () => {
    const res = unauthorizedError('Unauthorized');
    const body = (await res.json()) as ApiErrorResponse;
    expect(body.error.type).toBe('unauthorized');
  });

  test('body includes the provided message', async () => {
    const res = unauthorizedError('Token expired');
    const body = (await res.json()) as ApiErrorResponse;
    expect(body.message).toBe('Token expired');
  });

  test('body includes optional details when provided', async () => {
    const res = unauthorizedError('Unauthorized', 'JWT has expired');
    const body = (await res.json()) as ApiErrorResponse;
    expect(body.error.details).toBe('JWT has expired');
  });

  test('body has empty errors array', async () => {
    const res = unauthorizedError('Unauthorized');
    const body = (await res.json()) as ApiErrorResponse;
    expect(body.error.errors).toEqual([]);
  });
});
