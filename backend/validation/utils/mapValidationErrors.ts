import { z } from 'zod';

import type { FieldError } from '@backend/types/fieldError';

export const mapValidationErrors = (error: z.ZodError): FieldError[] =>
  error.issues.map((e) => ({
    field: e.path.join('.') || 'unknown',
    message: e.message,
  }));
