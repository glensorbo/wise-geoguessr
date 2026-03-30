import type { FieldError } from './fieldError';

/**
 * Result of validating a request body.
 * On success: data is typed, errors is null.
 * On failure: data is null, errors contains field-level details.
 */
export type ValidationResult<T> =
  | { data: T; errors: null }
  | { data: null; errors: FieldError[] };
