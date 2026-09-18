import { describe, test, expect } from 'bun:test';
import { z } from 'zod';

import { validateParam } from '../validateParam';

const schema = z.string().uuid();

describe('validateParam', () => {
  test('returns { data, errors: null } for valid input', () => {
    const result = validateParam(
      schema,
      '123e4567-e89b-12d3-a456-426614174000',
    );
    expect(result.errors).toBeNull();
    if (result.errors === null) {
      expect(result.data).toBe('123e4567-e89b-12d3-a456-426614174000');
    }
  });

  test('returns { data: null, errors } for invalid input', () => {
    const result = validateParam(schema, 'not-a-uuid');
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
  });

  test('errors is an array of FieldError on failure', () => {
    const result = validateParam(schema, 'not-a-uuid');
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors!.length).toBeGreaterThan(0);
    expect(result.errors![0]).toHaveProperty('field');
    expect(result.errors![0]).toHaveProperty('message');
  });

  test('null value returns errors', () => {
    const result = validateParam(schema, null);
    expect(result.errors).not.toBeNull();
  });
});
