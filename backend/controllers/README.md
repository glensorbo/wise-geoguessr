# 🎮 Controllers

The controller layer is the HTTP boundary of the application. Controllers receive requests from `Bun.serve()` routes, validate input with Zod, delegate to services, and return `Response` objects.

## 📁 Structure

```
controllers/
├── userController.ts           # GET /api/user, POST /api/user, GET /api/user/:id, DELETE /api/user/:id, PATCH /api/user/:id/role, POST /api/user/:id/reset-password, PATCH /api/user/:id/name
├── authController.ts           # POST /api/auth/login, /create-user, /set-password, /refresh, /logout
├── gameResultController.ts     # GET /api/results/years, GET /api/results, POST /api/results
├── hallOfFameController.ts     # GET /api/hall-of-fame
├── telemetryController.ts      # POST /api/telemetry/traces
└── tests/
    ├── userController.test.ts
    ├── authController.test.ts
    ├── gameResultController.test.ts
    └── hallOfFameController.test.ts
```

## 📐 Responsibilities

- Parse path params, query strings, and request bodies
- Validate request bodies with Zod via `validateRequest` — only failing fields appear in errors
- Call the appropriate service method
- Return a `Response` using helpers from `@backend/utils/response/`

Controllers contain **no business logic** and **no direct database access**.

## 🏭 Factory Pattern

Controllers are created via a factory function so the service dependency can be swapped in tests:

```ts
export const createUserController = (service: typeof UserServiceType) => ({
  async getUsers(): Promise<Response> {
    const users = await service.getAllUsers();
    return successResponse(users);
  },
});

// Default instance wired to the real service
export const userController = createUserController(userService);
```

## ✅ Validation with Zod

Use `validateRequest` from `@backend/validation/utils/validateRequest` with schemas from `@backend/validation/schemas/`:

```ts
import { validateRequest } from '@backend/validation/utils/validateRequest';
import { validationErrorResponse } from '@backend/utils/response/validationErrorResponse';
import { createUserSchema } from '@backend/validation/schemas/auth';

const validation = validateRequest(
  createUserSchema,
  await req.json().catch(() => null),
);
if (validation.errors)
  return validationErrorResponse('Validation failed', validation.errors); // 400 with only the failing fields

// validation.data is fully typed here
const result = await service.createUser(
  validation.data.email,
  validation.data.name,
);
```

## 📤 Response Helpers

Always use the helpers from `@backend/utils/response/` — never construct `Response` objects manually:

| Helper                                   | Status | Use when                                |
| ---------------------------------------- | ------ | --------------------------------------- |
| `successResponse(data, status?)`         | 200    | Request succeeded                       |
| `notFoundError(msg, details?)`           | 404    | Resource not found                      |
| `validationErrorResponse(msg, errors[])` | 400    | Input validation failed                 |
| `serviceErrorResponse(errors[])`         | varies | Maps service-layer `AppError[]` to HTTP |
| `unauthorizedError(msg, details?)`       | 401    | Auth check failed                       |
| `forbiddenError(msg, details?)`          | 403    | Action not permitted for this role      |

## 🧪 Testing

Tests inject a mock service via the factory — no HTTP server or database required:

```ts
import { mockUserRepository } from '@backend/utils/test/mockUserRepository';

const mockService = createUserService(mockUserRepository);
const controller = createUserController(mockService);

const response = await controller.getUsers();
expect(response.status).toBe(200);
```
