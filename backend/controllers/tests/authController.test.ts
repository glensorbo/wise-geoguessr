import { describe, test, expect, beforeEach } from 'bun:test';

process.env.JWT_SECRET = 'test-secret';
process.env.APP_URL = 'http://localhost:3000';

import { createAuthController } from '@backend/controllers/authController';
import { createAuthService } from '@backend/services/authService';
import {
  mockRefreshTokenRepository,
  mockUserRepository,
  mockUsers,
} from '@backend/utils/test';

import type { ApiErrorResponse } from '@backend/types/apiErrorResponse';

const VALID_PASSWORD = 'correctpass123';

beforeEach(() => {
  mockRefreshTokenRepository._reset();
});

const makeAuthController = async () => {
  const hashedPassword = await Bun.password.hash(VALID_PASSWORD);
  const repo = {
    ...mockUserRepository,
    getByEmail: async (email: string) => {
      const user = mockUsers.find((u) => u.email === email);
      if (!user) {
        return undefined;
      }
      return { ...user, password: hashedPassword };
    },
  };
  return createAuthController(
    createAuthService(repo, mockRefreshTokenRepository),
  );
};

const mockAuthService = createAuthService(
  mockUserRepository,
  mockRefreshTokenRepository,
);
const authController = createAuthController(mockAuthService);

const makeRequest = (body: unknown): Request =>
  new Request('http://localhost/api/auth/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const makeSetPasswordRequest = (body: unknown): Request =>
  new Request('http://localhost/api/auth/set-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('AuthController', () => {
  describe('createUser', () => {
    test('should return 201 with signupLink on valid input', async () => {
      const req = makeRequest({
        email: 'new@example.com',
        name: 'New User',
      }) as never;
      const response = await authController.createUser(req);

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty('data.signupLink');
    });

    test('should return JSON content type', async () => {
      const req = makeRequest({
        email: 'new@example.com',
        name: 'New User',
      }) as never;
      const response = await authController.createUser(req);
      expect(response.headers.get('content-type')).toContain(
        'application/json',
      );
    });

    test('should return 400 with only email error when email is missing', async () => {
      const req = makeRequest({ name: 'No Email' }) as never;
      const response = await authController.createUser(req);

      expect(response.status).toBe(400);
      const data = (await response.json()) as ApiErrorResponse;
      expect(data.error.type).toBe('validation');
      expect(data.error.errors.some((e) => e.field === 'email')).toBe(true);
      expect(data.error.errors.some((e) => e.field === 'name')).toBe(false);
    });

    test('should return 400 with only email error when email is invalid', async () => {
      const req = makeRequest({ email: 'not-an-email', name: 'User' }) as never;
      const response = await authController.createUser(req);

      expect(response.status).toBe(400);
      const data = (await response.json()) as ApiErrorResponse;
      expect(data.error.errors.some((e) => e.field === 'email')).toBe(true);
      expect(data.error.errors.some((e) => e.field === 'name')).toBe(false);
    });

    test('should return 400 with only name error when name is missing', async () => {
      const req = makeRequest({ email: 'valid@example.com' }) as never;
      const response = await authController.createUser(req);

      expect(response.status).toBe(400);
      const data = (await response.json()) as ApiErrorResponse;
      expect(data.error.errors.some((e) => e.field === 'name')).toBe(true);
      expect(data.error.errors.some((e) => e.field === 'email')).toBe(false);
    });

    test('should return errors for both fields when both are missing', async () => {
      const req = makeRequest({}) as never;
      const response = await authController.createUser(req);

      expect(response.status).toBe(400);
      const data = (await response.json()) as ApiErrorResponse;
      expect(data.error.errors.some((e) => e.field === 'email')).toBe(true);
      expect(data.error.errors.some((e) => e.field === 'name')).toBe(true);
    });

    test('should return 409 when email already exists', async () => {
      const existingUser = mockUsers[0]!;
      const req = makeRequest({
        email: existingUser.email,
        name: 'Duplicate',
      }) as never;
      const response = await authController.createUser(req);

      expect(response.status).toBe(409);
    });

    test('should return 400 on invalid JSON body', async () => {
      const req = new Request('http://localhost/api/auth/create-user', {
        method: 'POST',
        body: 'not json',
      }) as never;
      const response = await authController.createUser(req);
      expect(response.status).toBe(400);
    });
  });

  describe('setPassword', () => {
    test('should return 200 with token on valid input', async () => {
      const existingUser = mockUsers[0]!;
      const req = makeSetPasswordRequest({
        password: 'strongpass123',
        confirmPassword: 'strongpass123',
      }) as never;
      const ctx = {
        user: {
          sub: existingUser.id,
          email: existingUser.email,
          tokenType: 'signup',
        },
      };

      const response = await authController.setPassword(req, ctx);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('data.token');
    });

    test('token should be a non-empty string', async () => {
      const existingUser = mockUsers[0]!;
      const req = makeSetPasswordRequest({
        password: 'strongpass123',
        confirmPassword: 'strongpass123',
      }) as never;
      const ctx = {
        user: {
          sub: existingUser.id,
          email: existingUser.email,
          tokenType: 'signup',
        },
      };

      const response = await authController.setPassword(req, ctx);
      const body = (await response.json()) as { data: { token: string } };
      expect(typeof body.data.token).toBe('string');
      expect(body.data.token.length).toBeGreaterThan(0);
    });

    test('should return 400 with password error when password is missing', async () => {
      const req = makeSetPasswordRequest({}) as never;
      const ctx = {
        user: { sub: 'some-id', email: 'a@b.com', tokenType: 'signup' },
      };

      const response = await authController.setPassword(req, ctx);

      expect(response.status).toBe(400);
      const data = (await response.json()) as ApiErrorResponse;
      expect(data.error.errors.some((e) => e.field === 'password')).toBe(true);
    });

    test('should return 400 with password error when password is too short', async () => {
      const req = makeSetPasswordRequest({
        password: 'short',
        confirmPassword: 'short',
      }) as never;
      const ctx = {
        user: { sub: 'some-id', email: 'a@b.com', tokenType: 'signup' },
      };

      const response = await authController.setPassword(req, ctx);

      expect(response.status).toBe(400);
      const data = (await response.json()) as ApiErrorResponse;
      expect(data.error.errors.some((e) => e.field === 'password')).toBe(true);
    });

    test('should return 400 with confirmPassword error when passwords do not match', async () => {
      const req = makeSetPasswordRequest({
        password: 'strongpass123',
        confirmPassword: 'differentpass456',
      }) as never;
      const ctx = {
        user: { sub: 'some-id', email: 'a@b.com', tokenType: 'signup' },
      };

      const response = await authController.setPassword(req, ctx);

      expect(response.status).toBe(400);
      const data = (await response.json()) as ApiErrorResponse;
      expect(data.error.errors.some((e) => e.field === 'confirmPassword')).toBe(
        true,
      );
    });
  });

  describe('login', () => {
    const makeLoginRequest = (body: unknown): Request =>
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

    test('should return 200 with token on valid credentials', async () => {
      const controller = await makeAuthController();
      const req = makeLoginRequest({
        email: mockUsers[0]!.email,
        password: VALID_PASSWORD,
      }) as never;
      const response = await controller.login(req);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('data.token');
    });

    test('token should be a non-empty string', async () => {
      const controller = await makeAuthController();
      const req = makeLoginRequest({
        email: mockUsers[0]!.email,
        password: VALID_PASSWORD,
      }) as never;
      const response = await controller.login(req);
      const body = (await response.json()) as { data: { token: string } };
      expect(typeof body.data.token).toBe('string');
      expect(body.data.token.length).toBeGreaterThan(0);
    });

    test('should return 401 for wrong password', async () => {
      const controller = await makeAuthController();
      const req = makeLoginRequest({
        email: mockUsers[0]!.email,
        password: 'wrongpassword',
      }) as never;
      const response = await controller.login(req);
      expect(response.status).toBe(401);
    });

    test('should return 401 for non-existent email', async () => {
      const controller = await makeAuthController();
      const req = makeLoginRequest({
        email: 'nobody@example.com',
        password: 'anypass',
      }) as never;
      const response = await controller.login(req);
      expect(response.status).toBe(401);
    });

    test('should return 400 when email is missing', async () => {
      const req = makeLoginRequest({ password: 'somepass' }) as never;
      const response = await authController.login(req);
      expect(response.status).toBe(400);
      const data = (await response.json()) as ApiErrorResponse;
      expect(data.error.errors.some((e) => e.field === 'email')).toBe(true);
    });

    test('should return 400 when password is missing', async () => {
      const req = makeLoginRequest({ email: 'test@example.com' }) as never;
      const response = await authController.login(req);
      expect(response.status).toBe(400);
      const data = (await response.json()) as ApiErrorResponse;
      expect(data.error.errors.some((e) => e.field === 'password')).toBe(true);
    });

    test('should return JSON content type', async () => {
      const controller = await makeAuthController();
      const req = makeLoginRequest({
        email: mockUsers[0]!.email,
        password: VALID_PASSWORD,
      }) as never;
      const response = await controller.login(req);
      expect(response.headers.get('content-type')).toContain(
        'application/json',
      );
    });
  });
});
