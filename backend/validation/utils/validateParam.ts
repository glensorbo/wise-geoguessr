import { z } from 'zod';

import { mapValidationErrors } from './mapValidationErrors';

import type { ValidationResult } from '@backend/types/validationResult';

export const validateParam = <T>(
  schema: z.ZodSchema<T>,
  value: unknown,
): ValidationResult<T> => {
  const result = schema.safeParse(value);
  if (result.success) {
    return { data: result.data, errors: null };
  }
  return { data: null, errors: mapValidationErrors(result.error) };
};
