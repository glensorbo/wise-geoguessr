import { userService } from '@backend/services/userService';
import {
  notFoundError,
  serviceErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@backend/utils/response';
import {
  createUserAdminSchema,
  uuidSchema,
} from '@backend/validation/schemas/user';
import { validateParam } from '@backend/validation/utils/validateParam';
import { validateRequest } from '@backend/validation/utils/validateRequest';

import type { BunRequest } from '@backend/middleware';
import type { userService as UserServiceType } from '@backend/services/userService';

export const createUserController = (service: typeof UserServiceType) => ({
  async getUsers(): Promise<Response> {
    const users = await service.getAllUsers();
    return successResponse(users);
  },

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

  async createUser(req: BunRequest): Promise<Response> {
    const validation = await validateRequest(createUserAdminSchema, req);
    if (validation.errors) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const result = await service.createUser(
      validation.data.email,
      validation.data.name,
      validation.data.role,
    );

    if (result.error) {
      return serviceErrorResponse(result.error);
    }

    return successResponse(result.data, 201);
  },
});

/**
 * User Controller
 * HTTP request controllers for user routes
 * Thin layer that calls services and returns responses
 */
export const userController = createUserController(userService);
