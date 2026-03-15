import { afterEach, beforeEach, expect, test } from 'bun:test';

import { createSessionToken, verifySessionToken } from './auth/jwt';
import {
  hashPassword,
  normalizeEmail,
  parseLoginPayload,
  verifyPassword,
} from './auth/users';

const originalJwtSecret = process.env.JWT_SECRET;
const originalJwtIssuer = process.env.JWT_ISSUER;

beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret-for-jwt-signing';
  process.env.JWT_ISSUER = 'wise-geoguessr-tests';
});

afterEach(() => {
  if (originalJwtSecret == null) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }

  if (originalJwtIssuer == null) {
    delete process.env.JWT_ISSUER;
  } else {
    process.env.JWT_ISSUER = originalJwtIssuer;
  }
});

test('parseLoginPayload normalizes a valid login request', () => {
  expect(
    parseLoginPayload({
      email: '  TEST@Example.com ',
      password: 'secret-password',
    }),
  ).toEqual({
    email: 'test@example.com',
    password: 'secret-password',
  });
});

test('normalizeEmail trims and lowercases values', () => {
  expect(normalizeEmail('  User@Example.com  ')).toBe('user@example.com');
});

test('hashPassword and verifyPassword round-trip a password', async () => {
  const hash = await hashPassword('super-secret-password');

  expect(await verifyPassword('super-secret-password', hash)).toBe(true);
  expect(await verifyPassword('wrong-password', hash)).toBe(false);
});

test('createSessionToken and verifySessionToken round-trip claims', async () => {
  const token = await createSessionToken({
    userId: 'user-123',
    email: 'user@example.com',
  });

  expect(await verifySessionToken(token)).toEqual({
    userId: 'user-123',
    email: 'user@example.com',
  });
});
