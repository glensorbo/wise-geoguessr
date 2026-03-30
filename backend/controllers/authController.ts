import { authService } from '@backend/services/authService';
import {
  buildRefreshCookie,
  clearRefreshCookie,
  readRefreshCookie,
} from '@backend/utils/auth';
import {
  serviceErrorResponse,
  successResponse,
  unauthorizedError,
  validationErrorResponse,
} from '@backend/utils/response';
import {
  setPasswordSchema,
  changePasswordSchema,
  createUserSchema,
  loginSchema,
} from '@backend/validation/schemas/auth';
import { validateRequest } from '@backend/validation/utils/validateRequest';

import type { BunRequest, Ctx } from '@backend/middleware';
import type { authService as AuthServiceType } from '@backend/services/authService';
import type { AppJwtPayload } from '@backend/types/appJwtPayload';

/**
 * Auth Controller Factory
 * Accepts service as dependency for testability.
 */
export const createAuthController = (service: typeof AuthServiceType) => ({
  /**
   * POST /api/auth/create-user
   * Authenticated users create a new user by email + name.
   * Returns a signup link containing a short-lived JWT for the new user.
   */
  async createUser(req: BunRequest): Promise<Response> {
    const validation = await validateRequest(createUserSchema, req);
    if (validation.errors) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const result = await service.createUser(
      validation.data.email,
      validation.data.name,
    );

    if (result.error) {
      return serviceErrorResponse(result.error);
    }

    return successResponse(result.data, 201);
  },

  /**
   * POST /api/auth/login
   * Public endpoint — verifies email + password.
   * Returns the short-lived access token in the body and sets the refresh
   * token as an HttpOnly cookie.
   */
  async login(req: BunRequest): Promise<Response> {
    const validation = await validateRequest(loginSchema, req);
    if (validation.errors) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const result = await service.login(
      validation.data.email,
      validation.data.password,
    );

    if (result.error) {
      return serviceErrorResponse(result.error);
    }

    const { token, refreshToken } = result.data;
    const response = successResponse({ token });
    response.headers.set('Set-Cookie', buildRefreshCookie(refreshToken));
    return response;
  },

  /**
   * POST /api/auth/set-password
   * New user sets their password using the signup JWT from their invite link.
   * Returns an access token in the body and sets a refresh token cookie.
   */
  async setPassword(req: BunRequest, ctx: Ctx): Promise<Response> {
    const validation = await validateRequest(setPasswordSchema, req);
    if (validation.errors) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const { sub } = ctx.user as AppJwtPayload;
    const result = await service.setPassword(sub, validation.data.password);
    if (result.error) {
      return serviceErrorResponse(result.error);
    }

    const { token, refreshToken } = result.data;
    const response = successResponse({ token });
    response.headers.set('Set-Cookie', buildRefreshCookie(refreshToken));
    return response;
  },

  /**
   * POST /api/auth/change-password
   * Authenticated users update their password by providing their current one.
   * Returns a fresh access token and rotates the refresh token cookie.
   */
  async changePassword(req: BunRequest, ctx: Ctx): Promise<Response> {
    const validation = await validateRequest(changePasswordSchema, req);
    if (validation.errors) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const { sub } = ctx.user as AppJwtPayload;
    const result = await service.changePassword(
      sub,
      validation.data.currentPassword,
      validation.data.newPassword,
    );

    if (result.error) {
      return serviceErrorResponse(result.error);
    }

    const { token, refreshToken } = result.data;
    const response = successResponse({ token });
    response.headers.set('Set-Cookie', buildRefreshCookie(refreshToken));
    return response;
  },

  /**
   * POST /api/auth/refresh
   * Public endpoint — reads the HttpOnly refresh token cookie, validates it,
   * rotates to a new refresh token, and returns a fresh short-lived access token.
   */
  async refresh(req: BunRequest): Promise<Response> {
    const rawRefreshToken = readRefreshCookie(req);
    if (!rawRefreshToken) {
      return unauthorizedError('No refresh token provided');
    }

    const result = await service.refresh(rawRefreshToken);
    if (result.error) {
      const response = serviceErrorResponse(result.error);
      response.headers.set('Set-Cookie', clearRefreshCookie());
      return response;
    }

    const { token, refreshToken } = result.data;
    const response = successResponse({ token });
    response.headers.set('Set-Cookie', buildRefreshCookie(refreshToken));
    return response;
  },

  /**
   * POST /api/auth/logout
   * Revokes the current refresh token and clears the cookie.
   * Always returns 200 — even if the cookie was already gone.
   */
  async logout(req: BunRequest): Promise<Response> {
    const rawRefreshToken = readRefreshCookie(req);
    if (rawRefreshToken) {
      await service.logout(rawRefreshToken);
    }
    const response = successResponse({ message: 'Logged out' });
    response.headers.set('Set-Cookie', clearRefreshCookie());
    return response;
  },
});

export const authController = createAuthController(authService);
