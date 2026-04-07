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

  describe('deleteUser', () => {
    const adminCtx = {
      user: {
        sub: 'admin-id-000',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'admin',
        tokenType: 'auth',
      },
    };

    test('should return 400 for invalid UUID', async () => {
      const response = await userController.deleteUser('not-a-uuid', adminCtx);
      expect(response.status).toBe(400);
    });

    test('should return 404 for non-existent user', async () => {
      const response = await userController.deleteUser(
        '00000000-0000-0000-0000-000000000000',
        adminCtx,
      );
      expect(response.status).toBe(404);
    });

    test('should return 403 when trying to delete self', async () => {
      const selfCtx = {
        user: {
          sub: mockUsers[0]!.id,
          email: '',
          name: '',
          role: 'admin',
          tokenType: 'auth',
        },
      };
      const response = await userController.deleteUser(
        mockUsers[0]!.id!,
        selfCtx,
      );
      expect(response.status).toBe(403);
    });

    test('should return 204 for a valid delete', async () => {
      const response = await userController.deleteUser(
        mockUsers[0]!.id!,
        adminCtx,
      );
      expect(response.status).toBe(204);
    });
  });

  describe('updateUserRole', () => {
    const adminCtx = {
      user: {
        sub: 'admin-id-000',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'admin',
        tokenType: 'auth',
      },
    };

    const makeRoleReq = (role: string) =>
      new Request('http://localhost/api/user/id/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      }) as Request & { params: Record<string, string> };

    test('should return 400 for invalid UUID', async () => {
      const response = await userController.updateUserRole(
        'not-a-uuid',
        makeRoleReq('admin'),
        adminCtx,
      );
      expect(response.status).toBe(400);
    });

    test('should return 400 for invalid role value', async () => {
      const response = await userController.updateUserRole(
        mockUsers[0]!.id!,
        makeRoleReq('superadmin'),
        adminCtx,
      );
      expect(response.status).toBe(400);
    });

    test('should return 403 when trying to change own role', async () => {
      const selfCtx = {
        user: {
          sub: mockUsers[0]!.id,
          email: '',
          name: '',
          role: 'admin',
          tokenType: 'auth',
        },
      };
      const response = await userController.updateUserRole(
        mockUsers[0]!.id!,
        makeRoleReq('user'),
        selfCtx,
      );
      expect(response.status).toBe(403);
    });

    test('should return 200 with updated user', async () => {
      const response = await userController.updateUserRole(
        mockUsers[0]!.id!,
        makeRoleReq('admin'),
        adminCtx,
      );
      expect(response.status).toBe(200);
      const body = (await response.json()) as { data: User };
      expect(body.data.role).toBe('admin');
      expect(body.data).not.toHaveProperty('password');
    });
  });

  describe('resetUserPassword', () => {
    test('should return 400 for invalid UUID', async () => {
      const response = await userController.resetUserPassword('not-a-uuid');
      expect(response.status).toBe(400);
    });

    test('should return 404 for non-existent user', async () => {
      const response = await userController.resetUserPassword(
        '00000000-0000-0000-0000-000000000000',
      );
      expect(response.status).toBe(404);
    });

    test('should return 200 with signupLink for valid user', async () => {
      const response = await userController.resetUserPassword(
        mockUsers[0]!.id!,
      );
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        data: { signupLink: string; mailSent: boolean };
      };
      expect(body.data).toHaveProperty('signupLink');
      expect(typeof body.data.signupLink).toBe('string');
    });
  });

  describe('updateUserName', () => {
    const makeNameReq = (name: string) =>
      new Request('http://localhost', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      }) as Request & { params: Record<string, string> };

    const ownerCtx = {
      user: {
        sub: mockUsers[0]!.id,
        email: mockUsers[0]!.email,
        name: mockUsers[0]!.name,
        role: 'user',
        tokenType: 'auth',
      },
    };

    test('should return 400 for invalid UUID', async () => {
      const response = await userController.updateUserName(
        'not-a-uuid',
        makeNameReq('New Name'),
        ownerCtx,
      );
      expect(response.status).toBe(400);
    });

    test('should return 400 for missing name in body', async () => {
      const req = new Request('http://localhost', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }) as Request & { params: Record<string, string> };
      const response = await userController.updateUserName(
        mockUsers[0]!.id!,
        req,
        ownerCtx,
      );
      expect(response.status).toBe(400);
    });

    test('should return 403 when changing another user name', async () => {
      const otherCtx = {
        user: {
          sub: mockUsers[1]!.id,
          email: '',
          name: '',
          role: 'user',
          tokenType: 'auth',
        },
      };
      const response = await userController.updateUserName(
        mockUsers[0]!.id!,
        makeNameReq('New Name'),
        otherCtx,
      );
      expect(response.status).toBe(403);
    });

    test('should return 200 with token and updated user', async () => {
      const response = await userController.updateUserName(
        mockUsers[0]!.id!,
        makeNameReq('Updated Name'),
        ownerCtx,
      );
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        data: { token: string; user: User };
      };
      expect(body.data.user.name).toBe('Updated Name');
      expect(body.data.user).not.toHaveProperty('password');
      expect(typeof body.data.token).toBe('string');
    });
  });
});
