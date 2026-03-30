import { describe, test, expect } from 'bun:test';
import { z } from 'zod';

import { mapValidationErrors } from '../mapValidationErrors';

describe('mapValidatioErrors', () => {
  test('maps a single field error to correct shape', () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({ name: 123 });
    if (result.success) {
      throw new Error('expected failure');
    }
    const errors = mapValidationErrors(result.error);
    expect(errors.length).toBe(1);
    expect(errors[0]).toHaveProperty('field');
    expect(errors[0]).toHaveProperty('message');
  });

  test('maps multiple field errors', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const result = schema.safeParse({});
    if (result.success) {
      throw new Error('expected failure');
    }
    const errors = mapValidationErrors(result.error);
    expect(errors.length).toBeGreaterThan(1);
  });

  test('field name matches the Zod path', () => {
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: 'not-an-email' });
    if (result.success) {
      throw new Error('expected failure');
    }
    const errors = mapValidationErrors(result.error);
    expect(errors[0]?.field).toBe('email');
  });

  test('message is a non-empty string', () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({ name: 123 });
    if (result.success) {
      throw new Error('expected failure');
    }
    const errors = mapValidationErrors(result.error);
    expect(typeof errors[0]?.message).toBe('string');
    expect(errors[0]!.message.length).toBeGreaterThan(0);
  });
});
