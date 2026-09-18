import type { ApiErrorResponse } from '@backend/types/apiErrorResponse';
import type { FieldError } from '@backend/types/fieldError';

export const validationErrorResponse = (
  message: string,
  errors: FieldError[],
): Response => {
  const body: ApiErrorResponse = {
    message,
    status: 400,
    error: {
      type: 'validation',
      errors,
    },
  };
  return Response.json(body, { status: 400 });
};
