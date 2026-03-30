import { describe, test, expect } from 'bun:test';

import { generatePassphrase } from '../passphrase';

describe('generatePassphrase', () => {
  test('returns a non-empty string', () => {
    const result = generatePassphrase();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('each call returns a different value', () => {
    const a = generatePassphrase();
    const b = generatePassphrase();
    expect(a).not.toBe(b);
  });

  test('is at least 43 chars long (base64url of 32 bytes)', () => {
    const result = generatePassphrase();
    expect(result.length).toBeGreaterThanOrEqual(43);
  });
});
