# 🌍 Wise GeoGuessr

**The Friday scoreboard for the team that takes GeoGuessr very, very seriously.**

Every Friday the Wise team drops into GeoGuessr for a round of competitive geography. This app tracks every score, ranks every player, and makes sure nobody forgets who won (or lost) three weeks ago.

---

## 🗺️ What it does

- 📊 **Live leaderboard** — DataGrid of all results, sortable and filterable
- 📈 **Accumulated points chart** — who's pulling ahead over the season
- 📅 **Weekly bar chart** — how each round stacked up
- 🎯 **Points-per-round chart** — consistency vs. clutch performance
- 🏆 **Won/played stats** — bragging rights, quantified
- ➕ **Log results** — log in after each Friday session and add the scores

---

## 🛠️ Stack

| Layer    | Choice                                               | Why                                               |
| -------- | ---------------------------------------------------- | ------------------------------------------------- |
| Runtime  | [Bun](https://bun.sh)                                | Fast installs, native TypeScript, unified tooling |
| Frontend | React 19 + Redux Toolkit + MUI v7                    | Typed, component-rich, great charts               |
| Backend  | `Bun.serve()` + Controller → Service → Repository    | No framework overhead, fully tested layers        |
| Database | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team) | Type-safe queries, migration-first                |
| Auth     | JWT + HttpOnly refresh cookies                       | Stateless, secure, rotation built-in              |
| Quality  | oxlint + oxfmt + React Compiler + knip + Husky       | Enforced at commit time, not just "recommended"   |

---

## ⚡️ Getting Started

```bash
cp .env.example .env          # fill in POSTGRES_* and JWT_SECRET
docker compose up -d          # spin up Postgres
bun install
bun run db:migrate
bun run db:seed               # creates the admin user + historical rounds
bun dev                       # http://localhost:3000
```

---

## ✨ Features

- 🔐 **Auth** — JWT login, refresh token rotation, invite-based signup
- 🛡️ **RBAC** — `admin` | `user` roles, enforced in middleware
- 🏗️ **Layered backend** — Controller → Service → Repository with factory DI
- 🧪 **Unit tests** — every service and controller ships with tests; no DB required
- ⚛️ **React 19 + HMR** — fast dev loop, optimised production build via Bun bundler
- 🔄 **RTK Query** — typed server state with auto token refresh on 401
- 📧 **SMTP email** — opt-in invite emails; no-op when `SMTP_HOST` is unset
- 🔭 **OTel tracing** — opt-in observability via SigNoz; zero overhead when off
- 📊 **Analytics** — opt-in Rybbit pageview tracking; zero overhead when off
- 🐶 **Quality gate** — Husky blocks pushes that fail lint, format, tests, or knip

---

## 🏗️ Architecture

```
Request → Bun.serve() → withMiddleware() → Controller → Service → Repository → Drizzle → PostgreSQL
```

```
wise-geoguessr/
├── backend/            # Bun.serve() server — routes, controllers, services, repositories
│   ├── db/             # Drizzle client, schemas (source of truth for types), migrations, seed
│   ├── middleware/     # Auth guards, rate limiting, CORS
│   ├── telemetry/      # Optional OTel tracing + structured logger
│   └── utils/          # Response helpers, auth utilities, Zod validation
├── frontend/
│   ├── features/       # Self-contained feature modules (components, hooks, state)
│   ├── pages/          # Thin route components — homePage.tsx is the GeoGuessr dashboard
│   ├── shared/         # Generic components (skeletons, error boundary)
│   └── redux/          # Store, RTK Query API slices
├── e2e/                # Playwright tests — API and browser
├── rest/               # .http request files for every endpoint (kulala.nvim)
└── docker/             # Dockerfiles and service configs
```

See the READMEs inside each directory for layer-specific conventions.

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

---

## ⚙️ Optional Integrations

Both are opt-in — zero overhead when the env vars are not set.

### 🔭 OpenTelemetry

```bash
docker compose -f docker-compose.signoz.yml up -d
```

Set in `.env`: `OTEL_ENDPOINT=http://localhost:4318` · SigNoz UI → **http://localhost:8080**

### 📊 Rybbit Analytics

```bash
docker compose -f docker-compose.rybbit.yml up -d
```

Set in `.env`: `BUN_PUBLIC_RYBBIT_HOST` + `BUN_PUBLIC_RYBBIT_SITE_ID` · See `frontend/features/analytics/README.md`

### 📧 SMTP Email

Set in `.env`: `SMTP_HOST` + `SMTP_PORT` + `SMTP_FROM` · For local dev, use [Mailpit](https://github.com/axllent/mailpit) · See `backend/mail/README.md`

---

_May your pings always land in Europe and your scores always beat your teammates. 🗺️_
