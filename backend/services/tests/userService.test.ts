import { describe, test, expect } from 'bun:test';

process.env.JWT_SECRET = 'test-secret-for-unit-tests-at-least-32-bytes!!';

import { createUserService } from '../userService';
import { mockUserRepository, mockUsers } from '@backend/utils/test';

// Create service instance with mock repository
const userService = createUserService(mockUserRepository);

describe('UserService', () => {
  describe('getAllUsers', () => {
    test('should return an array', async () => {
      const users = await userService.getAllUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    test('should NOT include password field in returned users', async () => {
      const users = await userService.getAllUsers();

      expect(users.length).toBeGreaterThan(0);
      const user = users[0];
      expect(user).not.toHaveProperty('password');
    });

    test('should include all other user fields', async () => {
      const users = await userService.getAllUsers();

      expect(users.length).toBeGreaterThan(0);
      const user = users[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    test('should return same number of users as repository', async () => {
      const users = await userService.getAllUsers();
      expect(users.length).toBe(mockUsers.length);
    });
  });

  describe('getUserById', () => {
    test('should return undefined for non-existent user', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const user = await userService.getUserById(nonExistentId);
      expect(user).toBeUndefined();
    });

    test('should NOT include password field when user exists', async () => {
      const firstUser = mockUsers[0];
      if (!firstUser) {
        return;
      }

      const user = await userService.getUserById(firstUser.id!);

      expect(user).toBeDefined();
      expect(user).not.toHaveProperty('password');
    });

    test('should return safe user data when user exists', async () => {
      const firstUser = mockUsers[0];
      if (!firstUser) {
        return;
      }

      const user = await userService.getUserById(firstUser.id!);

      expect(user).toBeDefined();
      expect(user?.id).toBe(firstUser.id);
      expect(user?.email).toBe(firstUser.email);
      expect(user?.name).toBe(firstUser.name);
    });
  });

  describe('deleteUser', () => {
    const adminId = 'admin-id-000';

    test('should return forbidden error when deleting self', async () => {
      const result = await userService.deleteUser(
        mockUsers[0]!.id!,
        mockUsers[0]!.id!,
      );
      expect(result.error).not.toBeNull();
      expect(result.error?.[0]?.type).toBe('forbidden');
    });

    test('should return not_found error for non-existent user', async () => {
      const result = await userService.deleteUser(
        '00000000-0000-0000-0000-000000000000',
        adminId,
      );
      expect(result.error).not.toBeNull();
      expect(result.error?.[0]?.type).toBe('not_found');
    });

    test('should return null data on success', async () => {
      const result = await userService.deleteUser(mockUsers[0]!.id!, adminId);
      expect(result.error).toBeNull();
      expect(result.data).toBeNull();
    });
  });

  describe('updateUserRole', () => {
    const adminId = 'admin-id-000';

    test('should return forbidden error when changing own role', async () => {
      const result = await userService.updateUserRole(
        mockUsers[0]!.id!,
        'admin',
        mockUsers[0]!.id!,
      );
      expect(result.error).not.toBeNull();
      expect(result.error?.[0]?.type).toBe('forbidden');
    });

    test('should return not_found for non-existent user', async () => {
      const result = await userService.updateUserRole(
        '00000000-0000-0000-0000-000000000000',
        'admin',
        adminId,
      );
      expect(result.error).not.toBeNull();
      expect(result.error?.[0]?.type).toBe('not_found');
    });

    test('should return updated user without password', async () => {
      const result = await userService.updateUserRole(
        mockUsers[0]!.id!,
        'admin',
        adminId,
      );
      expect(result.error).toBeNull();
      expect(result.data?.role).toBe('admin');
      expect(result.data).not.toHaveProperty('password');
    });
  });

  describe('resetUserPassword', () => {
    test('should return not_found for non-existent user', async () => {
      const result = await userService.resetUserPassword(
        '00000000-0000-0000-0000-000000000000',
      );
      expect(result.error).not.toBeNull();
      expect(result.error?.[0]?.type).toBe('not_found');
    });

    test('should return signupLink and mailSent on success', async () => {
      const result = await userService.resetUserPassword(mockUsers[0]!.id!);
      expect(result.error).toBeNull();
      expect(result.data).toHaveProperty('signupLink');
      expect(result.data).toHaveProperty('mailSent');
      expect(result.data).toHaveProperty('mailConfigured');
      expect(typeof result.data?.signupLink).toBe('string');
    });
  });

  describe('updateUserName', () => {
    test('should return forbidden when changing another user name', async () => {
      const result = await userService.updateUserName(
        mockUsers[0]!.id!,
        'New Name',
        mockUsers[1]!.id!,
      );
      expect(result.error).not.toBeNull();
      expect(result.error?.[0]?.type).toBe('forbidden');
    });

    test('should return not_found for non-existent user', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const result = await userService.updateUserName(
        nonExistentId,
        'New Name',
        nonExistentId,
      );
      expect(result.error).not.toBeNull();
      expect(result.error?.[0]?.type).toBe('not_found');
    });

    test('should return token and updated user on success', async () => {
      const result = await userService.updateUserName(
        mockUsers[0]!.id!,
        'Updated Name',
        mockUsers[0]!.id!,
      );
      expect(result.error).toBeNull();
      expect(result.data?.user.name).toBe('Updated Name');
      expect(result.data?.user).not.toHaveProperty('password');
      expect(typeof result.data?.token).toBe('string');
    });
  });
});
