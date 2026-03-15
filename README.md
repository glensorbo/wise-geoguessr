# Wise GeoGuessr

A Bun-powered dashboard for tracking weekly Wise GeoGuessr scores, with Postgres-backed login support for future write operations.

The app serves a React 19 single-page frontend from a Bun server, loads raw score history from a JSON file on the server, and renders a filterable MUI X data grid plus charts with MUI and MUI X Charts.

## Tech stack

- Bun for development, serving, testing, and production builds
- React 19 with `react-router-dom`
- MUI for theming and UI components
- MUI X Charts for visualizations
- Bun build with a custom React Compiler plugin in `build.ts`
- Postgres for user authentication data
- Drizzle ORM for schema and migrations
- JWT-based authentication with Bun password hashing

## Getting started

Install dependencies:

```sh
bun install
```

Copy the environment template if you want to run the auth flow locally:

```sh
cp .env.example .env
```

Start the development server with hot reload:

```sh
bun run dev
```

The app will be available at `http://localhost:3000`.

## Scripts

- `bun run dev` - start the Bun dev server with HMR
- `bun run start` - start the production Bun server
- `bun run build` - build the production bundle into `dist/`
- `bun test` - run the Bun test suite
- `bun test src/logic/tests/player-details.test.ts` - run a single test file
- `bun run test:watch` - run tests in watch mode
- `bun run lint` - run `oxlint`
- `bun run format:check` - verify formatting with `oxfmt`
- `bun run format` - format the repository with `oxfmt`
- `bun run cc` - run tests, lint, and formatting checks together
- `bun run db:migrate` - apply database migrations
- `bun run db:seed` - create or update the configured seed login user

## Architecture

### Runtime flow

- `server/server.ts` runs the Bun HTTP server in both development and production.
- `bun run dev` serves `public/index.html` through Bun's HTML-import dev server with HMR.
- `bun run start` serves the built files from `dist/` in production and falls back to `index.html` for client-side routing.
- `src/frontend.tsx` mounts `App`, which provides the MUI theme and the router.
- `src/pages/Home.page.tsx` fetches score data from `/api/results?year=YYYY`, loads available years from `/api/results/years`, and renders the dashboard for the selected year.
- `server/db/` contains the Drizzle schema, migration runner, and seed script for Postgres-backed users.
- `server/auth/` contains login payload handling, user lookup, password verification, and JWT signing.

### Data flow

- Raw score history lives in `server/data/data.json`.
- `server/data.ts` loads that JSON and `server/server.ts` exposes it through `/api/results`.
- `src/logic/` contains the frontend data-shaping logic, split into focused modules for players, winners, yearly rows, per-played averages, and cumulative totals.
- Authentication users live in Postgres, not the JSON score file.

### Authentication flow

- Users are stored in Postgres with an `email` and hashed `password_hash`.
- `POST /api/auth/login` accepts `{ email, password }` and returns `{ token, user }`.
- Password hashing and verification use Bun's built-in password APIs.
- JWTs are signed with `JWT_SECRET` and stored in browser local storage by the current frontend.
- The header includes a login button that opens a modal beside the year picker.

## Working with score data

Update `server/data/data.json` when adding new rounds. Each entry looks like this:

```json
{
  "date": "2026-03-13",
  "scores": {
    "Thomas": 15046,
    "Glen": 16409,
    "Sigurd": 15254
  }
}
```

Players are derived from the `scores` keys, so you do not need to maintain a second player list.

The dashboard defaults to the current calendar year, but the global year selector can switch the entire page to any available year. The backend applies the year filter so the frontend only receives the requested slice of data.

## UI and charting

The frontend now uses MUI and MUI X Charts instead of Mantine/Recharts. This removes the Bun-specific chart compatibility workarounds that were previously needed in development.

If you update charting dependencies, validate with:

```sh
bun run cc
bun run build
```

## MCP setup

This repository includes MCP starter config for browser and database tooling:

- `.vscode/mcp.json` for workspace MCP servers
- `.github/copilot-mcp-config.example.json` for Copilot CLI or GitHub-hosted agents

Playwright MCP may still require local browser dependencies on your machine. If browser automation fails to launch, install the browser binaries and any missing system libraries required by Playwright.

## Docker and Compose

The repository includes:

- a Bun-based multi-stage `Dockerfile` for the app image
- a `docker-compose.yml` that runs the app alongside standard Postgres

Build and run only the app image with:

```sh
docker build -t wise-geoguessr .
docker run --rm -p 3000:3000 wise-geoguessr
```

Run the full stack with Postgres plus a seeded login user:

```sh
cp .env.example .env
docker compose up --build
```

The Compose app service runs migrations, seeds the configured user, and starts the Bun server.

## Testing

The test suite covers the dashboard shell, login modal, auth helpers, and the extracted logic modules under `src/logic/tests/`, including winners, active-player filtering, yearly rows, per-played averages, and cumulative totals.

## Future direction

The raw score data still lives in JSON for now, while authentication is already backed by Postgres. The next logical step is to use the authenticated API to add score-entry functionality from the frontend.
