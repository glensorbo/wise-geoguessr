# ⚙️ Services

The service layer contains all business logic. Services sit between controllers and repositories — they transform data, enforce rules, and ensure sensitive fields (like passwords) are never leaked to the HTTP layer.

## 📁 Structure

```
services/
├── userService.ts    # Business logic for user read operations
├── authService.ts    # User creation, password onboarding, welcome email via mail module
└── tests/
    ├── userService.test.ts
    └── authService.test.ts
```

## 📐 Responsibilities

- Apply business rules and data transformations
- Omit sensitive fields before returning data (e.g., strip `password`)
- Orchestrate multiple repository calls when needed
- Return `ErrorOr<T>` for fallible operations — never throw for known failure cases
- Return domain types — not raw DB types

Services contain **no HTTP logic** (no `Request`/`Response`) and **no direct database access**.

## 🏭 Factory Pattern

Services are created via a factory function so the repository dependency can be swapped in tests:

```ts
export const createUserService = (repo: typeof UserRepositoryType) => ({
  async getAllUsers(): Promise<User[]> {
    const users = await repo.getAll();
    return users.map(({ password: _password, ...safeUser }) => safeUser);
  },
});

// Default instance wired to the real repository
export const userService = createUserService(userRepository);
```

## 🔐 Sensitive Field Handling

The service layer is responsible for stripping fields that must not reach the client. Use destructuring with a discard variable:

```ts
const { password: _password, ...safeUser } = user;
return safeUser;
```

## 🚨 ErrorOr — Typed Results

Services return `ErrorOr<T>` from `@backend/types/errorOr` instead of throwing for known failure cases. Controllers check `result.error` and map to the appropriate HTTP response:

```ts
// In a service:
async getUser(id: string): Promise<ErrorOr<User>> {
  const user = await repo.getById(id);
  if (!user) return errorOr(null, [{ type: 'not_found', message: 'User not found' }]);
  return errorOr(user);
}

// In a controller:
const result = await service.getUser(id);
if (result.error) return serviceErrorResponse(result.error);
return successResponse(result.data);
```

## 🧪 Testing

Tests inject a mock repository — no database required:

```ts
import { mockUserRepository } from '@backend/utils/test/mockUserRepository';

const service = createUserService(mockUserRepository);
const users = await service.getAllUsers();
expect(users[0]).not.toHaveProperty('password');
```
