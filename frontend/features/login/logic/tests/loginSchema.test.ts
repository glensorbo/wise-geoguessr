import { describe, test, expect } from 'bun:test';

import { loginSchema } from '../loginSchema';

describe('loginSchema', () => {
  const valid = {
    email: 'user@example.com',
    password: 'secret',
    rememberMe: false,
  };

  describe('valid input', () => {
    test('accepts a well-formed payload', () => {
      expect(loginSchema.safeParse(valid).success).toBe(true);
    });

    test('accepts rememberMe: true', () => {
      expect(
        loginSchema.safeParse({ ...valid, rememberMe: true }).success,
      ).toBe(true);
    });
  });

  describe('email field', () => {
    test('rejects an empty string', () => {
      const result = loginSchema.safeParse({ ...valid, email: '' });
      expect(result.success).toBe(false);
    });

    test('rejects a string without @', () => {
      const result = loginSchema.safeParse({ ...valid, email: 'notanemail' });
      expect(result.success).toBe(false);
    });

    test('rejects a string missing the domain', () => {
      const result = loginSchema.safeParse({ ...valid, email: 'user@' });
      expect(result.success).toBe(false);
    });

    test('error message is "Please enter a valid email address"', () => {
      const result = loginSchema.safeParse({ ...valid, email: 'bad' });
      if (result.success) {
        throw new Error('expected failure');
      }
      const msg = result.error.issues.find(
        (i) => i.path[0] === 'email',
      )?.message;
      expect(msg).toBe('Please enter a valid email address');
    });
  });

  describe('password field', () => {
    test('rejects an empty string', () => {
      const result = loginSchema.safeParse({ ...valid, password: '' });
      expect(result.success).toBe(false);
    });

    test('accepts a single character password', () => {
      expect(loginSchema.safeParse({ ...valid, password: 'x' }).success).toBe(
        true,
      );
    });

    test('error message is "Password is required"', () => {
      const result = loginSchema.safeParse({ ...valid, password: '' });
      if (result.success) {
        throw new Error('expected failure');
      }
      const msg = result.error.issues.find(
        (i) => i.path[0] === 'password',
      )?.message;
      expect(msg).toBe('Password is required');
    });
  });

  describe('rememberMe field', () => {
    test('rejects a non-boolean value', () => {
      const result = loginSchema.safeParse({ ...valid, rememberMe: 'yes' });
      expect(result.success).toBe(false);
    });
  });
});
