# 🌍 Wise GeoGuessr — a Bun-first GeoGuessr scoreboard with real tests, real auth, and a no-host-deps E2E path

## Why

| Choose this if you want...                             | What you get here                                                                 |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| A small full-stack starter that stays typed end to end | Bun, React 19, Drizzle, PostgreSQL, and shared TypeScript from UI to DB           |
| CI that proves the app actually works                  | Unit checks plus a dedicated Docker E2E job that runs `bun run e2e:docker` in PRs |
| E2E tests without local browser setup pain             | A self-contained Docker flow that boots Postgres, app, and Playwright for you     |
| Optional extras without permanent complexity           | SMTP, OpenTelemetry, and Rybbit stay off until you set env vars                   |

## 🛠️ Tech stack

| Layer    | Choice                                                   | Why this choice                                                          |
| -------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| Runtime  | [Bun](https://bun.sh)                                    | Fast installs, native TypeScript, one toolchain for dev, build, and test |
| Frontend | React 19 + Redux Toolkit + MUI v7                        | Mature UI pieces, typed state, and fast iteration                        |
| Backend  | `Bun.serve()` with layered handlers                      | Minimal overhead without giving up structure                             |
| Database | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team)     | Migration-first schema changes and type-safe queries                     |
| Auth     | JWT + HttpOnly refresh cookies                           | Stateless sessions with refresh rotation                                 |
| Quality  | oxlint + oxfmt + React Compiler lint + knip + Playwright | Fast feedback locally and in CI                                          |

## ⚡ Quick start

```bash
cp .env.example .env
docker compose up -d
bun install
bun run db:migrate
bun run db:seed
bun dev
```

## ✨ Features

- 📊 Show a sortable leaderboard, weekly breakdowns, and season trends
- 🔐 Handle login, refresh rotation, password changes, and invite-based signup
- 🛡️ Enforce `admin` and `user` access rules in middleware
- 🧪 Run unit tests without a database and E2E tests against the real app
- 🐳 Run the canonical self-contained E2E flow with `bun run e2e:docker`
- 🚪 Treat logout as idempotent, including when no active session exists
- 📧 Send invite emails when SMTP is configured and stay quiet when it is not
- 🔭 Emit telemetry only when OpenTelemetry is configured
- 📊 Track analytics only when Rybbit is configured
- 🐶 Block bad pushes with lint, format, test, and knip checks

## 🔑 Key commands

```bash
bun dev
bun run build
bun test
bun run cc
bun e2e
bun e2e:browser
bun run e2e:docker
```

## ⚙️ Optional integrations

| Integration   | Enable it with                                      | Notes                                                                     |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| OpenTelemetry | `docker compose -f docker-compose.signoz.yml up -d` | Set `OTEL_ENDPOINT=http://localhost:4318`                                 |
| Rybbit        | `docker compose -f docker-compose.rybbit.yml up -d` | Set `BUN_PUBLIC_RYBBIT_HOST` and `BUN_PUBLIC_RYBBIT_SITE_ID`              |
| SMTP email    | `.env` only                                         | Set `SMTP_HOST`, `SMTP_PORT`, and `SMTP_FROM`; Mailpit works well locally |

## 📚 Docs

- `e2e/README.md` — Playwright commands, Docker E2E flow, and test rules
- `backend/README.md` — backend structure and conventions
- `backend/mail/README.md` — SMTP opt-in behavior
- `frontend/features/analytics/README.md` — Rybbit setup
