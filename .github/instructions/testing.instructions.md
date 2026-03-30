---
applyTo: '**/*.test.ts, **/*.test.tsx'
---

# 🧪 Testing

## Test Runner: bun:test

Always use `bun:test` — never jest or vitest:

```ts
import { describe, test, expect, beforeEach } from 'bun:test';
```

Run tests:

```sh
bun test                    # all tests
bun test ./backend          # backend only
bun test ./frontend         # frontend only
bun test <path/to/file>     # single file
bun test --watch            # watch mode
```

## Unit Tests — No Database Required

Inject mocks via factory functions. Tests never touch a real database:

```ts
import { createUserService } from '../userService';
import { mockUserRepository, mockUsers } from '@backend/utils/test';

const userService = createUserService(mockUserRepository);

describe('UserService', () => {
  test('strips password from returned users', async () => {
    const users = await userService.getAllUsers();
    expect(users[0]).not.toHaveProperty('password');
  });
});
```

## Mock Data

Shared mocks live in `backend/utils/test/`:

- `mockUserRepository` — in-memory implementation of the user repository interface
- `mockUsers` — array of seeded test user objects (with passwords)

Import from `@backend/utils/test`, not by relative path.

## Frontend Tests

Frontend tests run in **happy-dom** — no browser needed. `bunfig.toml` preloads `frontend/test-setup.ts` which registers happy-dom globals before every test. Nothing special to set up.

## File Placement

- Unit tests live **colocated** in a `tests/` subdirectory next to the source file
- E2E tests live under `e2e/api/` (API-only, no browser) or `e2e/frontend/` (browser)
- Use the `e2e-playwright` agent for writing E2E tests

## Pattern: Test Behaviour, Not Implementation

```ts
// ✅ Test the outcome
test('returns 404 when user does not exist', async () => {
  const res = await ctrl.getUserById('00000000-0000-0000-0000-000000000000');
  expect(res.status).toBe(404);
});

// ❌ Don't test that a specific internal method was called
```
