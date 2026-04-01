# 🏗️ Backend

The backend is a `Bun.serve()` HTTP server with a three-layer architecture: **Controller → Service → Repository**.

## 📁 Structure

```
backend/
├── server.ts           # Entry point — Bun.serve() with healthcheck + HTML serving only
├── serveProdBuild.ts   # Serves the production frontend build from dist/
├── routes/             # Route definitions — one file per resource, spread into server.ts
├── middleware/         # Composable middleware (auth, signup token, etc.)
├── controllers/        # HTTP boundary — parse requests, return Responses
├── services/           # Business logic — data transformation, rules
├── repositories/       # Data access — Drizzle queries, no business logic
├── validation/         # Centralised validation — Zod schemas and parsing utilities
├── db/                 # Database client and schema definitions
├── telemetry/          # Optional OTel tracing + structured logger
├── mail/               # Optional SMTP email — initMail(), sendMail()
├── types/              # Shared TypeScript types (derived from Drizzle or manually defined)
└── utils/              # Utilities organised by concern (auth, response, validation, test)
```

## 🔄 Request Flow

```
Bun.serve() route
  → Middleware chain  (auth, signup token, …)
  → Controller        (HTTP parsing, Zod validation, calls service, returns Response)
  → Service           (business logic, strips sensitive fields, transforms data)
  → Repository        (Drizzle ORM query, returns raw DB types)
  → PostgreSQL
```

## 🔌 Server (`server.ts`)

`server.ts` handles startup and infrastructure concerns. On boot it:

1. Calls `initTelemetry()` — must be first; starts OTel SDK and makes the logger available (no-op when `OTEL_ENDPOINT` is unset)
2. Calls `initMail()` — creates the Nodemailer transporter (no-op when `SMTP_HOST` is unset)
3. Calls `validateEnv()` — exits immediately if any required env vars are missing
4. Calls `await pingDb()` — verifies database connectivity with exponential backoff (5 attempts)
5. Starts `Bun.serve()` with all routes and static file handling

All API routes live in `backend/routes/` and are spread in:

```ts
initTelemetry();
initMail();
validateEnv();
await pingDb();

Bun.serve({
  routes: {
    '/healthcheck': { GET: () => new Response('OK') },
    ...userRoutes,
    ...authRoutes,
    ...gameResultRoutes,
    ...hallOfFameRoutes,
    '/*': isProduction ? (req) => serveProdBuild(pathname) : index,
  },
  development: !isProduction && { hmr: true, console: true },
});
```

In **development**, the frontend HTML is served directly with HMR. In **production**, static files are served from `dist/` with SPA fallback to `index.html`.

See [`routes/README.md`](./routes/README.md) and [`middleware/README.md`](./middleware/README.md) for how routes and middleware work.

## 🏭 Factory Pattern (Dependency Injection)

All controllers and services are created via factory functions so dependencies can be swapped in tests without module mocking:

```ts
// Factory
export const createUserService = (repo: typeof UserRepositoryType) => ({ ... });

// Default export (used in production)
export const userService = createUserService(userRepository);

// In tests — inject mock
const testService = createUserService(mockUserRepository);
```

## 📐 Layer Responsibilities

| Layer      | Does                                               | Does NOT                  |
| ---------- | -------------------------------------------------- | ------------------------- |
| Controller | Parse request, validate with Zod, call service     | Business logic, DB access |
| Service    | Transform data, apply rules, omit sensitive fields | DB queries, HTTP concerns |
| Repository | Run Drizzle queries, return raw DB types           | Any business logic        |

## 🧪 Testing Without a Database

Unit tests use mock data and repositories from `@backend/utils/test/`. Injecting the mock via the factory means no database connection is needed:

```ts
import { mockUsers } from '@backend/utils/test/mockUsers';
import { mockUserRepository } from '@backend/utils/test/mockUserRepository';

const service = createUserService(mockUserRepository);
const controller = createUserController(service);
```

## ➕ Adding a New Resource

1. Add DB schema → `backend/db/schemas/myResource.ts`
2. Add types → `backend/types/myResource.ts` (use `$inferSelect` / `$inferInsert`)
3. Add Zod schemas → `backend/validation/schemas/myResource.ts`
4. Add repository → `backend/repositories/myResourceRepository.ts`
5. Add service → `backend/services/myResourceService.ts` (factory pattern)
6. Add controller → `backend/controllers/myResourceController.ts` (factory pattern)
7. Add routes → `backend/routes/myResourceRoutes.ts` (see `routes/README.md`)
8. Add HTTP tests → `rest/myResource.http` (see `rest/README.md`)
9. Add mock data → `backend/utils/test/`
10. Add tests → `backend/controllers/tests/` and `backend/services/tests/`
