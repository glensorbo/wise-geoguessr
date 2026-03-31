# 🎭 E2E Tests

Playwright coverage for API and browser flows lives here.

## Commands

| Command               | Use it for                            | Host deps             |
| --------------------- | ------------------------------------- | --------------------- |
| `bun e2e`             | API project only                      | PostgreSQL only       |
| `bun e2e:browser`     | Browser project only                  | PostgreSQL + Chromium |
| `bun e2e:all`         | API then browser against a host setup | PostgreSQL + Chromium |
| `bun run e2e:docker`  | Canonical self-contained path         | Docker only           |
| `./scripts/e2e-ci.sh` | Direct entrypoint behind `e2e:docker` | Docker only           |

## Files

| Path                               | Purpose                                                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `api/auth.spec.ts`                 | Auth endpoint coverage, including logout returning `200` without an active session                               |
| `api/user.spec.ts`                 | User endpoint coverage                                                                                           |
| `fixtures/index.ts`                | Shared Playwright fixtures such as `authedRequest` and `testUser`                                                |
| `global-setup.ts`                  | Seeds the E2E user, logs in, and writes `.auth/user.json`                                                        |
| `global-teardown.ts`               | Cleans up after the full test run                                                                                |
| `healthcheck.spec.ts`              | Verifies `GET /healthcheck`                                                                                      |
| `frontend.spec.ts`                 | Verifies the SPA boots and routing falls back correctly                                                          |
| `frontend/home.spec.ts`            | Dashboard page — public access, sidebar nav links, Season Podium, Last Round                                     |
| `frontend/login.spec.ts`           | Login modal (primary) — form validation, credential flows, modal open/close; plus backward-compat `/login` route |
| `frontend/results.spec.ts`         | Results page — public access, heading, year selector, DataGrid, LineChart                                        |
| `frontend/stats.spec.ts`           | Statistics page — public access, heading, year selector, BarCharts and LineChart                                 |
| `frontend/navigation.spec.ts`      | Sidebar navigation — link clicks between Dashboard, Results, and Statistics                                      |
| `frontend/addScore.spec.ts`        | Add results modal — form flows, validation, and toast feedback                                                   |
| `frontend/scores-workflow.spec.ts` | Comprehensive scores lifecycle — year filtering, DataGrid content, full workflow                                 |
| `seed-game-data.ts`                | Wipes and re-seeds the 48 canonical historical game records before each run                                      |
| `seed-test-user.ts`                | Inserts the test user directly into PostgreSQL                                                                   |

## Rules

- You must treat `bun run e2e:docker` as the canonical no-host-deps path.
- You must keep local Docker runs aligned with PR CI; `.github/workflows/pr-checks.yml` runs the same `bun run e2e:docker` command in a dedicated E2E job.
- You must use the Docker path when you need a fresh database, seeded app, and Playwright with Chromium preinstalled.
- You must keep `bun e2e:all` sequential so browser mutations cannot race API seeded-data assertions.
- You must use `E2E_BASE_URL` only when pointing Playwright at an already-running app.
- You must keep auth-required tests on `../fixtures` so they reuse the seeded login state.
- You must keep logout expectations idempotent; `POST /api/auth/logout` succeeds with `200` even when no session is active.
- You must not assume host browser packages exist outside the Docker flow.

## Docker flow

| Component | Role                                                           |
| --------- | -------------------------------------------------------------- |
| `db`      | Starts an ephemeral Postgres instance on tmpfs                 |
| `app`     | Runs migrations, seeds data, and starts the app                |
| `e2e`     | Waits for `app`, then runs Playwright API and browser projects |

Safe defaults live in `docker-compose.e2e.yml`. Override them at the shell when needed:

```bash
POSTGRES_PASSWORD=mypass bun run e2e:docker
```

## Auth pattern

```ts
import { test, expect } from '../fixtures';

test('returns users list', async ({ authedRequest }) => {
  const res = await authedRequest.get('/api/user');
  expect(res.status()).toBe(200);
});
```

## Host path

| Env var             | Default                                |
| ------------------- | -------------------------------------- |
| `E2E_BASE_URL`      | `http://localhost:3000` outside Docker |
| `E2E_TEST_EMAIL`    | `e2e-playwright@local.test`            |
| `E2E_TEST_PASSWORD` | Long passphrase from `global-setup.ts` |
| `E2E_TEST_NAME`     | `Playwright E2E User`                  |

- You must provide `POSTGRES_*` and `JWT_SECRET` when running outside Docker.
- You must install Chromium before `bun e2e:browser` on WSL or similar host setups.

```bash
bunx playwright install --with-deps chromium
```
