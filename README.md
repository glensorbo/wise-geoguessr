# 🚀 bun-boiler

**The full-stack Bun template that's actually production-ready on day one.**

Most boilerplates give you a skeleton. This gives you working authentication, a tested layered backend, typed frontend state, and an enforced quality pipeline — already wired together, already proven.

[Quick Start](#️-quick-start) · [Why bun-boiler?](#-why-bun-boiler) · [Stack](#️-stack) · [Architecture](#️-architecture) · [Optional Integrations](#️-optional-integrations)

---

## 💡 Why bun-boiler?

|                   | bun-boiler                                                            | typical boilerplate              |
| ----------------- | --------------------------------------------------------------------- | -------------------------------- |
| **Runtime**       | Bun everywhere — runtime, bundler, test runner, package manager       | Node + webpack/Vite + Jest + npm |
| **Auth**          | JWT login, invite flow, refresh rotation, RBAC — fully working        | Placeholder or "bring your own"  |
| **Testing**       | Unit tests with DI mocks ship with every layer                        | Empty `__tests__` folder         |
| **Architecture**  | Controller → Service → Repository, factory DI, enforced by convention | `index.ts` does everything       |
| **Type safety**   | Types derived from Drizzle schema — no manual interfaces              | `any` or hand-rolled types       |
| **Quality gate**  | oxlint + oxfmt + React Compiler + knip + Husky — blocks bad pushes    | ESLint config you'll never touch |
| **Observability** | OTel tracing + Rybbit analytics, both opt-in, zero overhead when off  | `console.log`                    |

---

## 🛠️ Stack

| Layer             | Choice                                                                                              | Why                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Runtime & bundler | [Bun](https://bun.sh)                                                                               | 3× faster installs, native TypeScript, unified toolchain |
| Frontend          | React 19 + Redux Toolkit + MUI v7                                                                   | Mature, typed, component-rich                            |
| Backend           | `Bun.serve()` + layered architecture                                                                | No framework overhead, full control                      |
| Database          | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team)                                                | Type-safe queries, migration-first                       |
| Auth              | JWT + HttpOnly refresh cookies                                                                      | Stateless, secure, rotation built-in                     |
| Linting           | [oxlint](https://oxc.rs/docs/guide/usage/linter) + [oxfmt](https://github.com/nicolo-ribaudo/oxfmt) | 50–100× faster than ESLint                               |
| Testing           | `bun:test` + happy-dom                                                                              | No config, no Jest, same runtime                         |

---

## ⚡️ Quick Start

```bash
bun install
cp .env.example .env        # fill in POSTGRES_* and JWT_SECRET
bun run db:migrate
bun run db:seed             # creates the initial admin user
bun dev                     # http://localhost:3000
```

---

## ✨ Features

- 🔐 **JWT authentication** — login, invite-based signup, refresh token rotation, change password
- 🛡️ **RBAC** — `admin` | `user` roles enforced in middleware, embedded in the JWT
- 🏗️ **Layered backend** — Controller → Service → Repository with factory-based DI
- 🧪 **Tests included** — every service and controller ships with unit tests; no DB required
- ⚛️ **React 19 + HMR** — hot module reloading in dev, optimised production build via Bun bundler
- 🔴 **RTK Query** — typed server state with auto token refresh on 401
- 💀 **Skeleton loaders** — `TableSkeleton`, `ListSkeleton`, `CardSkeleton` ready to use
- 🛡️ **Error boundary** — app-level reset support out of the box
- 📧 **SMTP email** — opt-in Nodemailer integration; invite email sent on user creation; no-op when `SMTP_HOST` is unset
- 🚦 **Rate limiting** — in-memory per-IP limiter on auth endpoints
- 🌐 **CORS** — configured via `CORS_ORIGIN` env var
- 🗄️ **DB resilience** — startup ping with 5-attempt exponential backoff
- 🐶 **Quality enforced** — Husky blocks pushes that fail lint, format, tests, or knip

---

## 🏗️ Architecture

```
Request → Bun.serve() → withMiddleware() → Controller → Service → Repository → Drizzle → PostgreSQL
```

```
bun-boiler/
├── backend/            # Bun.serve() server — routes, controllers, services, repositories
│   ├── db/             # Drizzle client, schemas (source of truth for types), migrations, seed
│   ├── middleware/      # Auth guards, CORS
│   ├── telemetry/      # Optional OTel tracing + structured logger
│   └── utils/          # Response helpers, auth utilities, Zod validation
├── frontend/
│   ├── features/       # Self-contained feature modules (components, hooks, state, tests)
│   ├── shared/         # Generic components (skeletons, error boundary, protected route)
│   ├── redux/          # Store, RTK Query API, slices, localStorage middleware
│   └── providers/      # React providers (theme, auth, toast)
├── e2e/                # Playwright tests — api/ (no browser) and frontend/ (Chromium)
├── rest/               # .http request files for every endpoint (kulala.nvim)
└── docker/             # Dockerfiles and service configs
```

See the READMEs inside each directory for layer-specific conventions and rules.

---

## ⚙️ Optional Integrations

Both are opt-in — zero code changes, zero overhead when the env vars are not set.

### 🔭 OpenTelemetry — Tracing & Logs

```bash
docker compose -f docker-compose.signoz.yml up -d
```

Add to `.env`:

```env
OTEL_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=bun-boiler
```

SigNoz UI → **http://localhost:8080**

### 📧 SMTP Email — Transactional Email

For local dev, use [Mailpit](https://github.com/axllent/mailpit) — a lightweight SMTP server with a web UI:

```bash
docker run -d -p 1025:1025 -p 8025:8025 axllent/mailpit
```

Add to `.env`:

```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=My App <no-reply@localhost>
```

Mailpit UI → **http://localhost:8025**. For production, point at any provider (Resend, Postmark, Mailgun). See `backend/mail/README.md`.

### 📊 Rybbit Analytics — Privacy-First Frontend Analytics

```bash
# First: gh auth token | docker login ghcr.io -u <your-github-username> --password-stdin
docker compose -f docker-compose.rybbit.yml up -d
```

Open **http://localhost:8090**, create an account, add a site, copy the Site ID. Then set `RYBBIT_DISABLE_SIGNUP=true` in `.env` and restart to lock registration. Add to `.env`:

```env
BUN_PUBLIC_RYBBIT_HOST=http://localhost:8090
BUN_PUBLIC_RYBBIT_SITE_ID=<your-site-id>
```

Pageviews tracked automatically. Custom events via `useAnalytics` hook. See `frontend/features/analytics/README.md`.

---

## 🔑 Key Commands

```bash
bun dev                # Dev server with HMR → http://localhost:3000
bun run build          # Production bundle
bun test               # Unit tests
bun run cc             # Full quality check — test + lint + format + knip
bun run db:generate    # Generate Drizzle migration from schema changes
bun run db:migrate     # Apply migrations
bun run db:studio      # Drizzle Studio GUI
bun e2e                # Playwright API tests
bun e2e:browser        # Playwright browser tests
```
