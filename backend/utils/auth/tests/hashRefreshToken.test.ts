import { describe, test, expect } from 'bun:test';

import { hashRefreshToken } from '../hashRefreshToken';

describe('hashRefreshToken', () => {
  test('returns a hex string', async () => {
    const hash = await hashRefreshToken('some-token');
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  test('returns a 64-character SHA-256 hex digest', async () => {
    const hash = await hashRefreshToken('some-token');
    expect(hash).toHaveLength(64);
  });

  test('is deterministic — same input produces same hash', async () => {
    const a = await hashRefreshToken('test-token-abc');
    const b = await hashRefreshToken('test-token-abc');
    expect(a).toBe(b);
  });

  test('different inputs produce different hashes', async () => {
    const a = await hashRefreshToken('token-one');
    const b = await hashRefreshToken('token-two');
    expect(a).not.toBe(b);
  });

  test('handles an empty string', async () => {
    const hash = await hashRefreshToken('');
    expect(hash).toHaveLength(64);
  });
});
