/**
 * ErrorOr — a generic result type for service layer operations.
 *
 * Services return ErrorOr<T> instead of throwing. Controllers check
 * result.error and either return the mapped HTTP response or proceed
 * with result.data.
 *
 * @example
 * // In a service — success:
 * return errorOr(user);
 *
 * // In a service — failure:
 * return errorOr<User>(null, [{ type: 'not_found', message: 'User not found' }]);
 *
 * // In a controller:
 * const result = await service.getUser(id);
 * if (result.error) return serviceErrorResponse(result.error);
 * return successResponse(result.data);
 */

import type { AppError } from './appError';

export type ErrorOr<T> =
  | { data: T; error: null }
  | { data: null; error: AppError[] };

export function errorOr<T>(data: T): ErrorOr<T>;
export function errorOr<T>(data: null, errors: AppError[]): ErrorOr<T>;
export function errorOr<T>(data: T | null, errors?: AppError[]): ErrorOr<T> {
  if (errors !== undefined) {
    return { data: null, error: errors };
  }
  return { data: data as T, error: null };
}
