import type { LoginRequest } from './types';

const minimumPasswordLength = 16;

export const normalizeEmail = (value: string) => {
  return value.trim().toLowerCase();
};

export const parseLoginPayload = (value: unknown): LoginRequest | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const { email, password } = value as Record<string, unknown>;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);

  if (normalizedEmail.length === 0 || password.trim().length === 0) {
    return null;
  }

  return {
    email: normalizedEmail,
    password,
  };
};

export const assertCreatePassword = (value: string) => {
  if (value.length < minimumPasswordLength) {
    throw new Error(
      `Seed user password must be at least ${minimumPasswordLength} characters.`,
    );
  }
};

export const hashPassword = async (password: string) => {
  return Bun.password.hash(password);
};

export const verifyPassword = async (
  password: string,
  passwordHash: string,
) => {
  return Bun.password.verify(password, passwordHash);
};
