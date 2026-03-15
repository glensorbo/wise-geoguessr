# Copilot instructions for `wise-geoguessr`

## Build, test, and lint commands

- Install dependencies: `bun install`
- Start the development server with HMR: `bun run dev`
- Start the production Bun server: `bun run start`
- Build production assets: `bun run build`
- Run all tests: `bun test`
- Run a single test file: `bun test src/logic/tests/player-details.test.ts`
- Run tests in watch mode: `bun run test:watch`
- Run the main linter: `bun run lint`
- Check formatting: `bun run format:check`
- Apply formatting: `bun run format`
- Run the local verification bundle: `bun run cc`
- Apply database migrations: `bun run db:migrate`
- Seed the configured auth user: `bun run db:seed`

Notes:

- Tests preload `src/test-setup.ts` through `bunfig.toml`, so Happy DOM is registered globally for Bun tests.
- `bun run cc` is the repository's current all-in-one validation command.

## High-level architecture

- This is a Bun-first app. `server/server.ts` runs `Bun.serve()` for both development and production HTTP serving.
- `bun run dev` uses Bun's HTML-import dev server with HMR.
- In production, `build.ts` builds `public/index.html` into `dist/`, and the Bun server serves those static files with SPA fallback.
- `src/frontend.tsx` mounts `App`, and `App` wraps the UI in a MUI `ThemeProvider` before rendering the router.
- Routing is currently minimal: `src/Router.tsx` maps `/` to `src/pages/Home.page.tsx`.
- `Home.page.tsx` does not import raw score data. It fetches `GET /api/results?year=YYYY` and `GET /api/results/years` from the Bun server, and it also provides a login modal backed by `POST /api/auth/login`.
- Raw score history lives in `server/data/data.json`.
- `server/data.ts` is the server-side loader for that JSON file.
- `src/logic/` is the shared data-shaping layer for the frontend. It is split into focused modules for players, winners, yearly rows, per-player stats, and cumulative point series.
- `server/db/` contains the Drizzle Postgres schema, migration runner, and seed script for users.
- `server/auth/` contains user lookup, password verification, and JWT helpers.

## Key conventions

- Keep raw round data in `server/data/data.json`. Do not reintroduce duplicated inline score data in frontend files.
- The frontend API contract is the JSON array returned by `/api/results`, with each item shaped like `{ date, scores }`. `/api/results` also accepts a `year=YYYY` query parameter, and `/api/results/years` returns the available year list for the dropdown.
- Authentication uses Postgres-backed users with lowercase email addresses, Bun password hashing, and JWTs signed from `JWT_SECRET`.
- Players are derived from the `scores` object keys. If you add a new player, update the color mapping in `src/pages/Home.page.tsx` only if you want a specific chart color.
- The dashboard defaults to the current calendar year, but the selected year is applied end-to-end through the server API and the `src/logic/` helpers.
- The UI stack is MUI plus `@mui/x-charts`. Do not reintroduce the previous Mantine/Recharts compatibility workarounds.
- There is a dedicated render test in `src/pages/Home.page.test.tsx`; keep or update that coverage when touching the dashboard shell.
- The repository ships with a Bun-based Docker image that builds `dist/` and runs the production Bun server. `docker-compose.yml` pairs that app image with a standard Postgres container and seeds a login user from environment variables.
- Formatting is enforced with `oxfmt` using semicolons, single quotes, trailing commas, 2-space indentation, and grouped import sorting from `.oxfmtrc.json`.
- `oxlint` is the active linter. `build.ts` is intentionally excluded from oxlint in `.oxlintrc.json`.
- Shared MCP workspace config lives in `.vscode/mcp.json`. It configures Playwright for browser verification and a restricted Postgres MCP server for future database-backed work.
- For Copilot CLI or GitHub-hosted coding agent setup, use `.github/copilot-mcp-config.example.json` as the starting point. The Postgres entry expects a `COPILOT_MCP_DATABASE_URI` secret or variable.
