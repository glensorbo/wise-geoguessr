import { describe, test, expect, beforeEach } from 'bun:test';

process.env.JWT_SECRET = 'test-secret';
process.env.APP_URL = 'http://localhost:3000';

import { createAuthService } from '../authService';
import {
  mockRefreshTokenRepository,
  mockUserRepository,
  mockUsers,
} from '@backend/utils/test';

beforeEach(() => {
  mockRefreshTokenRepository._reset();
});

const authService = createAuthService(
  mockUserRepository,
  mockRefreshTokenRepository,
);

const VALID_PASSWORD = 'correctpass123';

const repoWithHashedPassword = async () => {
  const hashedPassword = await Bun.password.hash(VALID_PASSWORD);
  return {
    ...mockUserRepository,
    getByEmail: async (email: string) => {
      const user = mockUsers.find((u) => u.email === email);
      if (!user) {
        return undefined;
      }
      return { ...user, password: hashedPassword };
    },
  };
};

describe('AuthService', () => {
  describe('createUser', () => {
    test('should return data with signupLink on success', async () => {
      const result = await authService.createUser(
        'new@example.com',
        'New User',
      );
      expect(result.error).toBeNull();
      expect(result.data).toHaveProperty('signupLink');
    });

    test('signupLink should contain token query param and /set-password path', async () => {
      const result = await authService.createUser(
        'new@example.com',
        'New User',
      );
      expect(result.error).toBeNull();
      expect(result.data?.signupLink).toContain('token=');
      expect(result.data?.signupLink).toContain('/set-password');
    });

    test('should return conflict error for existing email', async () => {
      const existingUser = mockUsers[0]!;
      const result = await authService.createUser(
        existingUser.email,
        'Duplicate',
      );
      expect(result.data).toBeNull();
      expect(result.error?.[0]?.type).toBe('conflict');
      expect(result.error?.[0]?.field).toBe('email');
    });

    test('should call repo.create with email and name', async () => {
      const calls: { email: string; name: string }[] = [];
      const trackingRepo = {
        ...mockUserRepository,
        getByEmail: async () => undefined,
        create: async (
          email: string,
          name: string,
          _hashedPassword: string,
        ) => {
          calls.push({ email, name });
          return mockUserRepository.create(email, name, _hashedPassword);
        },
      };

      const svc = createAuthService(trackingRepo, mockRefreshTokenRepository);
      await svc.createUser('track@example.com', 'Tracked User');

      expect(calls.length).toBe(1);
      expect(calls[0]?.email).toBe('track@example.com');
      expect(calls[0]?.name).toBe('Tracked User');
    });
  });

  describe('setPassword', () => {
    test('should return data with token on success', async () => {
      const existingUser = mockUsers[0]!;
      const result = await authService.setPassword(
        existingUser.id!,
        'newpassword123',
      );
      expect(result.error).toBeNull();
      expect(result.data).toHaveProperty('token');
    });

    test('token should be a non-empty string', async () => {
      const existingUser = mockUsers[0]!;
      const result = await authService.setPassword(
        existingUser.id!,
        'newpassword123',
      );
      expect(result.error).toBeNull();
      expect(typeof result.data?.token).toBe('string');
      expect(result.data?.token.length).toBeGreaterThan(0);
    });

    test('should return not_found error for non-existent user', async () => {
      const result = await authService.setPassword(
        '00000000-0000-0000-0000-000000000000',
        'pass',
      );
      expect(result.data).toBeNull();
      expect(result.error?.[0]?.type).toBe('not_found');
    });

    test('should call repo.updatePassword with userId', async () => {
      const updatedIds: string[] = [];
      const trackingRepo = {
        ...mockUserRepository,
        updatePassword: async (id: string, _hashedPassword: string) => {
          updatedIds.push(id);
        },
      };

      const svc = createAuthService(trackingRepo, mockRefreshTokenRepository);
      const existingUser = mockUsers[0]!;
      await svc.setPassword(existingUser.id!, 'newpassword123');

      expect(updatedIds.length).toBe(1);
      expect(updatedIds[0]).toBe(existingUser.id);
    });
  });

  describe('login', () => {
    test('should return token on valid credentials', async () => {
      const repo = await repoWithHashedPassword();
      const svc = createAuthService(repo, mockRefreshTokenRepository);
      const result = await svc.login(mockUsers[0]!.email, VALID_PASSWORD);
      expect(result.error).toBeNull();
      expect(result.data).toHaveProperty('token');
    });

    test('token should be a non-empty string', async () => {
      const repo = await repoWithHashedPassword();
      const svc = createAuthService(repo, mockRefreshTokenRepository);
      const result = await svc.login(mockUsers[0]!.email, VALID_PASSWORD);
      expect(typeof result.data?.token).toBe('string');
      expect(result.data?.token.length).toBeGreaterThan(0);
    });

    test('should return unauthorized for wrong password', async () => {
      const repo = await repoWithHashedPassword();
      const svc = createAuthService(repo, mockRefreshTokenRepository);
      const result = await svc.login(mockUsers[0]!.email, 'wrongpassword');
      expect(result.data).toBeNull();
      expect(result.error?.[0]?.type).toBe('unauthorized');
    });

    test('should return unauthorized for non-existent email', async () => {
      const result = await authService.login('nobody@example.com', 'anypass');
      expect(result.data).toBeNull();
      expect(result.error?.[0]?.type).toBe('unauthorized');
    });

    test('wrong email and wrong password return the same error message', async () => {
      const repo = await repoWithHashedPassword();
      const svc = createAuthService(repo, mockRefreshTokenRepository);
      const badEmail = await svc.login('nobody@example.com', 'anypass');
      const badPassword = await svc.login(mockUsers[0]!.email, 'wrongpass');
      expect(badEmail.error?.[0]?.message).toBe(
        badPassword.error?.[0]?.message,
      );
    });
  });
});
