import { userService } from '@backend/services/userService';
import {
  notFoundError,
  serviceErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@backend/utils/response';
import {
  createUserAdminSchema,
  updateRoleSchema,
  uuidSchema,
} from '@backend/validation/schemas/user';
import { validateParam } from '@backend/validation/utils/validateParam';
import { validateRequest } from '@backend/validation/utils/validateRequest';

import type { BunRequest, Ctx } from '@backend/middleware';
import type { userService as UserServiceType } from '@backend/services/userService';
import type { AppJwtPayload } from '@backend/types/appJwtPayload';

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

  async deleteUser(id: string, ctx: Ctx): Promise<Response> {
    const validation = validateParam(uuidSchema, id);
    if (validation.errors) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const requestingUser = ctx.user as AppJwtPayload;
    const result = await service.deleteUser(
      validation.data,
      requestingUser.sub,
    );

    if (result.error) {
      return serviceErrorResponse(result.error);
    }

    return successResponse(null, 204);
  },

  async updateUserRole(
    id: string,
    req: BunRequest,
    ctx: Ctx,
  ): Promise<Response> {
    const idValidation = validateParam(uuidSchema, id);
    if (idValidation.errors) {
      return validationErrorResponse('Validation failed', idValidation.errors);
    }

    const bodyValidation = await validateRequest(updateRoleSchema, req);
    if (bodyValidation.errors) {
      return validationErrorResponse(
        'Validation failed',
        bodyValidation.errors,
      );
    }

    const requestingUser = ctx.user as AppJwtPayload;
    const result = await service.updateUserRole(
      idValidation.data,
      bodyValidation.data.role,
      requestingUser.sub,
    );

    if (result.error) {
      return serviceErrorResponse(result.error);
    }

    return successResponse(result.data);
  },

  async resetUserPassword(id: string): Promise<Response> {
    const validation = validateParam(uuidSchema, id);
    if (validation.errors) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const result = await service.resetUserPassword(validation.data);

    if (result.error) {
      return serviceErrorResponse(result.error);
    }

    return successResponse(result.data);
  },
});

export const userController = createUserController(userService);
