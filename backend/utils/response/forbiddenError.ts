import type { ApiErrorResponse } from '@backend/types/apiErrorResponse';

export const forbiddenError = (message: string, details?: string): Response => {
  const body: ApiErrorResponse = {
    message,
    status: 403,
    error: {
      type: 'forbidden',
      errors: [],
      details,
    },
  };
  return Response.json(body, { status: 403 });
};
