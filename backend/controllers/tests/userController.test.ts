import { describe, test, expect } from 'bun:test';

import { createUserController } from '@backend/controllers/userController';
import { createUserService } from '@backend/services/userService';
import { mockUserRepository, mockUsers } from '@backend/utils/test';

import type { ApiErrorResponse } from '@backend/types/apiErrorResponse';
import type { User } from '@backend/types/user';

const mockUserService = createUserService(mockUserRepository);
const userController = createUserController(mockUserService);

describe('UserController', () => {
  describe('getUsers', () => {
    test('should return a Response object', async () => {
      const response = await userController.getUsers();
      expect(response).toBeInstanceOf(Response);
    });

    test('should return 200 status code', async () => {
      const response = await userController.getUsers();
      expect(response.status).toBe(200);
    });

    test('should return JSON content type', async () => {
      const response = await userController.getUsers();
      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('application/json');
    });

    test('should return an array of users', async () => {
      const response = await userController.getUsers();
      const body = (await response.json()) as { data: User[] };
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('should NOT include password field in response', async () => {
      const response = await userController.getUsers();
      const body = (await response.json()) as { data: User[] };

      expect(body.data.length).toBeGreaterThan(0);
      const user = body.data[0];
      expect(user).not.toHaveProperty('password');
    });

    test('should return correct number of users', async () => {
      const response = await userController.getUsers();
      const body = (await response.json()) as { data: User[] };
      expect(body.data.length).toBe(mockUsers.length);
    });
  });

  describe('getUserById', () => {
    test('should return 400 for invalid UUID format', async () => {
      const response = await userController.getUserById('not-a-uuid');

      expect(response.status).toBe(400);
      const data = (await response.json()) as ApiErrorResponse;
      expect(data.error.type).toBe('validation');
      expect(data.error.errors.length).toBe(1);
    });

    test('should return 404 for non-existent user', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await userController.getUserById(nonExistentId);
      expect(response.status).toBe(404);
    });

    test('should return error message for non-existent user', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await userController.getUserById(nonExistentId);
      const data = (await response.json()) as ApiErrorResponse;

      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('error');
      expect(data.error.type).toBe('notFound');
      expect(data.message).toBe('User not found');
      expect(data.status).toBe(404);
    });

    test('should return 200 and user data if user exists', async () => {
      const existingUser = mockUsers[0];
      if (!existingUser) {
        return;
      }

      const response = await userController.getUserById(existingUser.id!);

      expect(response.status).toBe(200);
      const body = (await response.json()) as { data: User };
      expect(body.data.id).toBe(existingUser.id);
    });

    test('should NOT include password field when user exists', async () => {
      const existingUser = mockUsers[0];
      if (!existingUser) {
        return;
      }

      const response = await userController.getUserById(existingUser.id!);
      const body = (await response.json()) as { data: User };

      expect(body.data).not.toHaveProperty('password');
    });
  });
});
