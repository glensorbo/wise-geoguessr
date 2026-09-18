# ✅ Validation Utils

Zod-based validation and error mapping.

| File                     | Export                | Description                                                          |
| ------------------------ | --------------------- | -------------------------------------------------------------------- |
| `mapValidationErrors.ts` | `mapValidationErrors` | Converts a `ZodError` into an array of `{ field, message }` objects  |
| `validateRequest.ts`     | `validateRequest`     | Validates a JSON request body — async, reads `req.json()` internally |
| `validateParam.ts`       | `validateParam`       | Validates a raw value (e.g. route param) against a Zod schema        |

Both `validateRequest` and `validateParam` return `ValidationResult<T>`:

```ts
{ data: T; errors: null } | { data: null; errors: FieldError[] }
```

## Usage

**Request body** (`POST`/`PUT` routes):

```ts
const validation = await validateRequest(createUserSchema, req);
if (validation.errors) {
  return validationErrorResponse('Validation failed', validation.errors);
}
// validation.data is fully typed here
```

**Route param** (`GET /api/user/:id`):

```ts
const validation = validateParam(uuidSchema, id);
if (validation.errors) {
  return validationErrorResponse('Validation failed', validation.errors);
}
// validation.data is fully typed here
```
