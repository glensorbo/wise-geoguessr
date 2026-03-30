# 🎭 E2E Tests

End-to-end tests using [Playwright](https://playwright.dev/). Tests run against the live dev server (auto-started) or a URL you provide.

## Running Tests

```bash
# API tests only — no browser required, works in WSL / Docker / CI
bun e2e

# Browser tests — requires Chromium (see setup below)
bun e2e:browser

# All tests (API + browser)
bun e2e:all

# Interactive UI mode
bun e2e:ui

# Debug mode (step through tests)
bun e2e:debug

# Against an already-running server
E2E_BASE_URL=http://localhost:3000 bun e2e
```

## Projects

| Project   | Command           | Tests                               | Needs browser? |
| --------- | ----------------- | ----------------------------------- | -------------- |
| `api`     | `bun e2e`         | `e2e/api/**`, `healthcheck.spec.ts` | ❌ No          |
| `browser` | `bun e2e:browser` | `e2e/frontend.spec.ts`              | ✅ Yes         |

## Structure

```
e2e/
├── api/
│   ├── auth.spec.ts       # Auth controller — login, logout, refresh, create-user, change-password
│   └── user.spec.ts       # User controller — GET /api/user, GET /api/user/:id
├── fixtures/
│   └── index.ts           # Custom fixtures: authedRequest, testUser
├── seed-test-user.ts      # Bun script — seeds test user directly to DB
├── global-setup.ts        # Runs seed-test-user.ts, logs in, saves token to .auth/user.json
├── healthcheck.spec.ts    # Verifies GET /healthcheck returns 200 OK
└── frontend.spec.ts       # SPA loads, #root mounts, unknown routes fall back to SPA
```

## Authentication

Global setup runs once before all tests:

1. **Seeds** the E2E test user directly to the DB (idempotent — skips if already exists)
2. **Logs in** via `POST /api/auth/login` to get a Bearer token
3. **Saves** `{ token, userId, email }` to `.auth/user.json`

Tests that need auth import from `../fixtures`:

```ts
import { test, expect } from '../fixtures';

test('returns users list', async ({ authedRequest, testUser }) => {
  const res = await authedRequest.get('/api/user');
  expect(res.status()).toBe(200);
});
```

## Test User Credentials

Defaults (override via env vars if needed):

| Env var             | Default                                     |
| ------------------- | ------------------------------------------- |
| `E2E_TEST_EMAIL`    | `e2e-playwright@local.test`                 |
| `E2E_TEST_PASSWORD` | _(long passphrase — see `global-setup.ts`)_ |
| `E2E_TEST_NAME`     | `Playwright E2E User`                       |

The passphrase is intentionally long — nobody has to type it manually.

## Browser Tests Setup

### WSL

Install Chromium system dependencies:

```bash
bunx playwright install --with-deps chromium
```

Then run:

```bash
bun e2e:browser
```

### Docker / GitHub CI

Use Playwright's official image which ships with all browser dependencies pre-installed:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app
COPY . .
RUN npm install -g bun
RUN bun install

CMD ["bun", "e2e:all"]
```

Or install deps into your own image:

```dockerfile
RUN bunx playwright install --with-deps chromium
```

## Configuration

See `playwright.config.ts` at the project root.

- **Web server**: `bun run dev` — auto-started before tests, reused between runs (non-CI)
- **Base URL**: `http://localhost:3000` (override with `E2E_BASE_URL`)
- **Auth state**: `.auth/user.json` (git-ignored)

## Prerequisites

A running PostgreSQL database is required. Use the same env vars as the main app (`POSTGRES_*`, `JWT_SECRET`).
