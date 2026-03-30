import { describe, test, expect } from 'bun:test';

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
});
