---
applyTo: 'backend/**/*'
---

# ⚙️ Backend Architecture

## Request Flow

```
Bun.serve() → Middleware → Controller → Service → Repository → Drizzle ORM → PostgreSQL
```

## Layer Contracts

| Layer      | Location                | Responsibility                                                 | Must NOT                                     |
| ---------- | ----------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| Routes     | `backend/routes/`       | Map HTTP routes to controller methods                          | Contain logic                                |
| Controller | `backend/controllers/`  | Parse request, validate input, call service, return `Response` | Contain business logic or DB queries         |
| Service    | `backend/services/`     | Business logic, data transformation, strip sensitive fields    | Make HTTP `Response` objects or raw DB calls |
| Repository | `backend/repositories/` | Drizzle queries only                                           | Contain business logic                       |
| Middleware | `backend/middleware/`   | Auth/token verification before controller                      | Return data (only pass/reject)               |

**Read the layer's README before working in it.**

## Factory Pattern (Dependency Injection)

All controllers and services use factory functions so they can be tested without mocking modules:

```ts
// ✅ Service definition
export const createUserService = (repo: typeof UserRepositoryType) => ({
  async getAllUsers(): Promise<User[]> {
    const users = await repo.getAll();
    return users.map(({ password: _p, ...safe }) => safe);
  },
});
// Wired-up instance for production use
export const userService = createUserService(userRepository);

// ✅ Controller definition
export const createUserController = (service: typeof UserServiceType) => ({
  async getUsers(): Promise<Response> {
    return successResponse(await service.getAllUsers());
  },
});
export const userController = createUserController(userService);

// ✅ In tests — inject mocks instead
const svc = createUserService(mockUserRepository);
const ctrl = createUserController(svc);
```

## ErrorOr\<T\>

Services return `ErrorOr<T>` for expected failures instead of throwing:

```ts
// Return an error object for known failures
if (!user) return { error: 'User not found' };
// Return data for success
return { data: user };
```

Controllers unwrap it and call the appropriate response helper.

## Response Helpers

All responses go through helpers in `backend/utils/response/` — never construct `Response` objects manually:

```ts
successResponse(data)              // 200 { data }
notFoundError(msg, detail?)        // 404
validationErrorResponse(msg, errs) // 422
serviceErrorResponse(msg)          // 500
unauthorizedError(msg?)            // 401
```

The `ApiErrorResponse` shape:

```ts
{ message: string; status: number; error: { type: 'validation' | 'notFound'; errors: FieldError[]; details?: string } }
```

## Validation

- Use **Zod schemas** in `backend/validation/schemas/` for all request body and param validation
- Use `validateRequest(schema, body)` for request bodies
- Use `validateParam(schema, value)` for path parameters
- Validation belongs in the **controller**, not the service

## Adding a New Resource

Follow these steps **in order**:

1. 🗄️ Add schema to `backend/db/schemas/<resource>.ts`
2. 📦 Add types to `backend/types/` (derived via `$inferSelect`/`$inferInsert`)
3. 🔌 Add migration: `bun run db:generate` → review → `bun run db:migrate`
4. 🗃️ Add repository in `backend/repositories/<resource>Repository.ts`
5. ⚙️ Add service in `backend/services/<resource>Service.ts` (factory pattern)
6. 🎮 Add controller in `backend/controllers/<resource>Controller.ts` (factory pattern)
7. 🌐 Register routes in `backend/routes/<resource>Routes.ts` and spread into `backend/server.ts`
8. 📝 Add endpoint to `rest/<resource>.http` and update `rest/README.md`
9. ✅ Run `bun run cc`
