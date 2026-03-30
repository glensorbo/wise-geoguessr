import { describe, test, expect } from 'bun:test';

import { notFoundError } from '../notFoundError';

import type { ApiErrorResponse } from '@backend/types/apiErrorResponse';

describe('notFoundError', () => {
  test('returns a Response with status 404', () => {
    const res = notFoundError('Not found');
    expect(res.status).toBe(404);
  });

  test('body has error.type === notFound', async () => {
    const res = notFoundError('Not found');
    const body = (await res.json()) as ApiErrorResponse;
    expect(body.error.type).toBe('notFound');
  });

  test('body includes the provided message', async () => {
    const res = notFoundError('User not found');
    const body = (await res.json()) as ApiErrorResponse;
    expect(body.message).toBe('User not found');
  });

  test('body includes optional details when provided', async () => {
    const res = notFoundError('Not found', 'No record with that ID');
    const body = (await res.json()) as ApiErrorResponse;
    expect(body.error.details).toBe('No record with that ID');
  });

  test('body has empty errors array', async () => {
    const res = notFoundError('Not found');
    const body = (await res.json()) as ApiErrorResponse;
    expect(body.error.errors).toEqual([]);
  });
});
