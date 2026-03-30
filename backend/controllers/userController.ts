import { userService } from '@backend/services/userService';
import {
  notFoundError,
  successResponse,
  validationErrorResponse,
} from '@backend/utils/response';
import { uuidSchema } from '@backend/validation/schemas/user';
import { validateParam } from '@backend/validation/utils/validateParam';

import type { userService as UserServiceType } from '@backend/services/userService';

/**
 * User Controller Factory
 * Accepts service as dependency for testability
 */
export const createUserController = (service: typeof UserServiceType) => ({
  /**
   * Handle GET /api/user - Get all users
   * @returns Response with array of safe users (no passwords)
   */
  async getUsers(): Promise<Response> {
    const users = await service.getAllUsers();
    return successResponse(users);
  },

  /**
   * Handle GET /api/user/:id - Get user by ID
   * @param id - User ID from route params
   * @returns Response with safe user data or 404 if not found
   */
  async getUserById(id: string): Promise<Response> {
    const validation = validateParam(uuidSchema, id);
    if (validation.errors) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const user = await service.getUserById(validation.data);

    if (!user) {
      return notFoundError('User not found', `No user found with ID: ${id}`);
    }

    return successResponse(user);
  },
});

/**
 * User Controller
 * HTTP request controllers for user routes
 * Thin layer that calls services and returns responses
 */
export const userController = createUserController(userService);
