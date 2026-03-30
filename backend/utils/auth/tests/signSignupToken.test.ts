import { describe, test, expect } from 'bun:test';

import { signSignupToken } from '../signSignupToken';
import { verifyToken } from '../verifyToken';

process.env.JWT_SECRET = 'test-secret-for-jwt-utils';

describe('signSignupToken', () => {
  test('returns a non-empty string', async () => {
    const token = await signSignupToken('user-1', 'test@example.com');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('returned JWT can be decoded by verifyToken', async () => {
    const token = await signSignupToken('user-1', 'test@example.com');
    const result = await verifyToken(token);
    expect(result.data).not.toBeNull();
  });

  test('decoded payload has tokenType: signup', async () => {
    const token = await signSignupToken('user-1', 'test@example.com');
    const result = await verifyToken(token);
    expect(result.data?.tokenType).toBe('signup');
  });

  test('decoded payload has correct sub and email', async () => {
    const token = await signSignupToken('user-42', 'hello@example.com');
    const result = await verifyToken(token);
    expect(result.data?.sub).toBe('user-42');
    expect(result.data?.email).toBe('hello@example.com');
  });
});
