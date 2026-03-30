import type { ApiErrorResponse } from '@backend/types/apiErrorResponse';

export const tooManyRequestsError = (
  message: string,
  details?: string,
): Response => {
  const body: ApiErrorResponse = {
    message,
    status: 429,
    error: {
      type: 'rateLimit',
      errors: [],
      details,
    },
  };
  return Response.json(body, { status: 429 });
};
