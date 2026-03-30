# 🔍 Validation

Centralised validation logic for the backend. All request validation, schemas, and Zod utilities live here.

## 📁 Structure

| Path       | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| `schemas/` | Zod schemas for each request body (grouped by domain)           |
| `utils/`   | Zod helper utilities (`validateRequest`, `mapValidationErrors`) |

## Usage

```ts
import { createUserSchema } from '@backend/validation/schemas/auth';
import { validateRequest } from '@backend/validation/utils/validateRequest';

const validation = validateRequest(
  createUserSchema,
  await req.json().catch(() => null),
);
if (validation.errors)
  return validationErrorResponse('Validation failed', validation.errors);
```
