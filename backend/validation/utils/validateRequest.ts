import { z } from 'zod';

import { mapValidationErrors } from './mapValidationErrors';

import type { ValidationResult } from '@backend/types/validationResult';

export const validateRequest = async <T>(
  schema: z.ZodSchema<T>,
  req: Request,
): Promise<ValidationResult<T>> => {
  const body = await req.json().catch(() => null);
  const result = schema.safeParse(body);
  if (result.success) {
    return { data: result.data, errors: null };
  }
  return { data: null, errors: mapValidationErrors(result.error) };
};
