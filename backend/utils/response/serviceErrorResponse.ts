import { notFoundError } from './notFoundError';
import { unauthorizedError } from './unauthorizedError';
import { validationErrorResponse } from './validationErrorResponse';

import type { AppError } from '@backend/types/appError';

/**
 * Maps a list of AppErrors from the service layer into the appropriate HTTP Response.
 *
 * Error type precedence: the first error's type determines the response kind.
 * All errors with a field are included as FieldErrors in validation responses.
 *
 * @example
 * const result = await service.createUser(email, name);
 * if (result.error) return serviceErrorResponse(result.error);
 * return successResponse(result.data, 201);
 */
export const serviceErrorResponse = (errors: AppError[]): Response => {
  const first = errors[0];

  switch (first?.type) {
    case 'not_found':
      return notFoundError(first.message);

    case 'conflict':
      return Response.json(
        {
          status: 409,
          message: first.message,
          error: { type: 'conflict', errors: [] },
        },
        { status: 409 },
      );

    case 'validation':
      return validationErrorResponse(
        first.message,
        errors
          .filter((e) => e.field !== undefined)
          .map((e) => ({ field: e.field!, message: e.message })),
      );

    case 'unauthorized':
      return unauthorizedError(first.message);

    default:
      return new Response('Internal Server Error', { status: 500 });
  }
};
