import { describe, test, expect } from 'bun:test';

import { generateRefreshToken } from '../generateRefreshToken';

describe('generateRefreshToken', () => {
  test('returns a non-empty string', () => {
    const token = generateRefreshToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('is a hex string of 64 characters (32 bytes)', () => {
    const token = generateRefreshToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  test('each call returns a unique token', () => {
    const tokens = new Set(
      Array.from({ length: 10 }, () => generateRefreshToken()),
    );
    expect(tokens.size).toBe(10);
  });
});
