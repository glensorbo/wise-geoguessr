# Deploying on Coolify

Coolify is a self-hosted platform that runs your app from a Git repository using
Docker Compose. This project ships a production-ready `docker-compose.yml` and
Dockerfile that work with Coolify out of the box.

---

## What happens on deploy

Every time Coolify deploys (push, manual trigger, or scheduled):

1. **Build** — `docker/Dockerfile` compiles the frontend and installs dependencies
2. **Migrate** — `docker/entrypoint.sh` runs `bunx --bun drizzle-kit migrate` before the server starts (idempotent — already-applied migrations are skipped)
3. **Seed** — admin user is created if it doesn't exist yet
4. **Start** — `bun run start` serves the app on port 3000

The database (`postgres_data` volume) persists across deploys.

---

## Step-by-step setup

### 1 — Add a new resource

In Coolify: **New Resource → Docker Compose → From a Git repository**

- Connect your GitHub/GitLab repo
- **Compose file path:** `docker-compose.yml`
- **Build pack:** Docker Compose

### 2 — Set the proxy target

Coolify scans your services and asks which one to expose. Select:

- **Service:** `app`
- **Port:** `3000`

Coolify injects Traefik labels automatically. You do **not** need to add or change the `ports` section in `docker-compose.yml`.

### 3 — Environment variables

Set these in Coolify's **Environment Variables** panel before the first deploy:

| Variable              | Notes                                                        |
| --------------------- | ------------------------------------------------------------ |
| `POSTGRES_USER`       | e.g. `wise_geoguessr`                                        |
| `POSTGRES_PASSWORD`   | strong random value                                          |
| `POSTGRES_DB`         | e.g. `wise_geoguessr`                                        |
| `JWT_SECRET`          | strong random value — changing this invalidates all sessions |
| `APP_URL`             | `https://your-domain.com` — used in invite links             |
| `CORS_ORIGIN`         | `https://your-domain.com`                                    |
| `SEED_ADMIN_EMAIL`    | admin account email                                          |
| `SEED_ADMIN_PASSWORD` | admin account password (change after first login)            |
| `SEED_ADMIN_NAME`     | display name, e.g. `Admin`                                   |

Optional variables (uncomment in app as needed):

| Variable                      | Notes                       |
| ----------------------------- | --------------------------- |
| `OTEL_ENDPOINT`               | OpenTelemetry collector URL |
| `OTEL_SERVICE_NAME`           | service name for traces     |
| `BUN_PUBLIC_RYBBIT_HOST`      | Rybbit analytics host       |
| `BUN_PUBLIC_RYBBIT_SITE_ID`   | Rybbit site ID              |
| `SMTP_HOST` / `SMTP_PORT` / … | SMTP for invite emails      |

### 4 — Deploy

Click **Deploy**. Watch the build logs — on a cold start the container will print:

```
🔄 Running database migrations…
🚀 Starting server…
```

The healthcheck (`GET /healthcheck`) must return `200` before Coolify marks the deploy as successful.

### 5 — Seed the initial game data (one-time)

After the first deploy, seed the 48 historical game records:

```bash
# Find your container name in Coolify → Container → Exec, or via SSH:
docker exec -it <app-container-name> bun run db:seed
```

Or log in with the admin account and use the **+ Add results** button to add data manually.

---

## Running E2E tests against your Coolify deployment

You have two options depending on where you want Playwright to run.

### Option A — Run locally, point at Coolify

No Docker needed. Tests run on your machine; the app is the live Coolify instance.

```bash
E2E_BASE_URL=https://your-domain.com bun run e2e:all
```

> **Note:** The seed scripts in `global-setup` / `global-teardown` connect to
> the database **directly** (not via HTTP). For Option A you either need a
> secure tunnel to the Coolify Postgres instance, or skip the seeded-data test
> file (`e2e/api/results-seeded.spec.ts`) which asserts exact record counts.
>
> Pure HTTP tests (`e2e/api/*.spec.ts`, `e2e/frontend/*.spec.ts`) work fine
> with no DB access.

### Option B — Coolify Scheduled Task (fully isolated, recommended for cron)

This spins up the self-contained Docker E2E stack (`docker-compose.e2e.yml`) on
the Coolify **server itself**, completely separate from your production app.

In Coolify go to the project → **Scheduled Tasks** → new task:

| Field        | Value                                                                             |
| ------------ | --------------------------------------------------------------------------------- |
| **Schedule** | `0 2 * * *` (daily at 02:00 — adjust as needed)                                   |
| **Command**  | `cd /path/to/repo && ./scripts/e2e-ci.sh >> /var/log/wise-geoguessr-e2e.log 2>&1` |

What this does on each run:

1. Spins up a fresh, ephemeral Postgres + app stack (RAM-backed, no disk)
2. Runs the full Playwright suite (API + browser via Chromium)
3. Tears everything down regardless of outcome
4. Exits with Playwright's own exit code

The log file captures pass/fail output with timestamps. If you want alerts on
failure, pipe the exit code to a notification script or use Coolify's built-in
webhook notifications on task failure.

---

## Updating the app

Push to your connected branch. Coolify auto-deploys (or trigger manually).
Migrations run automatically before the new version starts — zero manual steps.

## Rolling back

In Coolify → Deployments → pick a previous successful deploy → **Redeploy**.
The database is not rolled back automatically; use a Postgres backup if you need
to revert schema changes.

## Useful Coolify shortcuts

| Task                           | Where                           |
| ------------------------------ | ------------------------------- |
| View live logs                 | Project → Containers → Logs     |
| Run a command in the container | Project → Containers → Exec     |
| Manage env vars                | Project → Environment Variables |
| Manual redeploy                | Project → Deployments → Deploy  |
| Scheduled tasks (cron)         | Project → Scheduled Tasks       |
