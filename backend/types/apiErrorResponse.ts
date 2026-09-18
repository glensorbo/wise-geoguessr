import type { FieldError } from './fieldError';

type ErrorType =
  | 'validation'
  | 'notFound'
  | 'unauthorized'
  | 'forbidden'
  | 'rateLimit'
  | 'conflict';

export type ApiErrorResponse = {
  message: string;
  status: number;
  error: {
    type: ErrorType;
    errors: FieldError[];
    details?: string;
  };
};
