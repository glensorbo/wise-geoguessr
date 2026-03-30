# 📨 Response Utils

HTTP response builder helpers for consistent API responses.

| File                         | Export                    | Status          | Error Type                                                                |
| ---------------------------- | ------------------------- | --------------- | ------------------------------------------------------------------------- |
| `successResponse.ts`         | `successResponse`         | 200 (or custom) | —                                                                         |
| `validationErrorResponse.ts` | `validationErrorResponse` | 400             | `validation`                                                              |
| `notFoundError.ts`           | `notFoundError`           | 404             | `notFound`                                                                |
| `unauthorizedError.ts`       | `unauthorizedError`       | 401             | `unauthorized`                                                            |
| `forbiddenError.ts`          | `forbiddenError`          | 403             | `forbidden`                                                               |
| `tooManyRequestsError.ts`    | `tooManyRequestsError`    | 429             | `rateLimit`                                                               |
| `serviceErrorResponse.ts`    | `serviceErrorResponse`    | varies          | maps `AppError[]` from the service layer to the appropriate HTTP response |

All error responses follow the `ApiErrorResponse` shape from `@backend/types/errors`.
