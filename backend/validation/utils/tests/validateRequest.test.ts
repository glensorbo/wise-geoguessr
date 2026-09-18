import { describe, test, expect } from 'bun:test';
import { z } from 'zod';

import { validateRequest } from '../validateRequest';

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

const makeRequest = (body: unknown): Request =>
  new Request('http://localhost/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('validateRequest', () => {
  test('returns { data, errors: null } for valid input', async () => {
    const result = await validateRequest(
      schema,
      makeRequest({ name: 'Alice', age: 30 }),
    );
    expect(result.errors).toBeNull();
    if (result.errors === null) {
      expect(result.data.name).toBe('Alice');
      expect(result.data.age).toBe(30);
    }
  });

  test('returns { data: null, errors } for invalid input', async () => {
    const result = await validateRequest(schema, makeRequest({ name: 123 }));
    expect(result.data).toBeNull();
    expect(result.errors).not.toBeNull();
  });

  test('errors is an array of FieldError on failure', async () => {
    const result = await validateRequest(schema, makeRequest({ name: 123 }));
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors!.length).toBeGreaterThan(0);
    expect(result.errors![0]).toHaveProperty('field');
    expect(result.errors![0]).toHaveProperty('message');
  });

  test('only failing fields appear in errors', async () => {
    const result = await validateRequest(
      schema,
      makeRequest({ name: 'Alice' }),
    ); // age is missing
    expect(result.errors).not.toBeNull();
    const fields = result.errors!.map((e) => e.field);
    expect(fields).toContain('age');
    expect(fields).not.toContain('name');
  });

  test('invalid JSON body returns errors', async () => {
    const req = new Request('http://localhost/test', {
      method: 'POST',
      body: 'not-json',
    });
    const result = await validateRequest(schema, req);
    expect(result.errors).not.toBeNull();
  });
});
