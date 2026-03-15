# Wise GeoGuessr

A Bun-powered dashboard for tracking weekly Wise GeoGuessr scores.

The app serves a React 19 single-page frontend from a Bun server, loads raw score history from a JSON file on the server, and renders a filterable MUI X data grid plus charts with MUI and MUI X Charts.

## Tech stack

- Bun for development, serving, testing, and production builds
- React 19 with `react-router-dom`
- MUI for theming and UI components
- MUI X Charts for visualizations
- Bun build with a custom React Compiler plugin in `build.ts`

## Getting started

Install dependencies:

```sh
bun install
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

## Architecture

### Runtime flow

- `server/server.ts` runs the Bun HTTP server in both development and production.
- `bun run dev` serves `public/index.html` through Bun's HTML-import dev server with HMR.
- `bun run start` serves the built files from `dist/` in production and falls back to `index.html` for client-side routing.
- `src/frontend.tsx` mounts `App`, which provides the MUI theme and the router.
- `src/pages/Home.page.tsx` fetches score data from `/api/results?year=YYYY`, loads available years from `/api/results/years`, and renders the dashboard for the selected year.

### Data flow

- Raw score history lives in `server/data/data.json`.
- `server/data.ts` loads that JSON and `server/server.ts` exposes it through `/api/results`.
- `src/logic/` contains the frontend data-shaping logic, split into focused modules for players, winners, yearly rows, per-played averages, and cumulative totals.

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

## Docker

The repository includes a Bun-based multi-stage `Dockerfile`. It builds the frontend with `bun run build`, copies the production `dist/` assets plus `server/`, and runs the app with Bun in production mode.

Build and run it with:

```sh
docker build -t wise-geoguessr .
docker run --rm -p 3000:3000 wise-geoguessr
```

## Testing

The test suite covers both the dashboard loading state and the extracted logic modules under `src/logic/tests/`, including winners, active-player filtering, yearly rows, per-played averages, and cumulative totals.

## Future direction

The current JSON data source is an intermediate step. The server route is designed so the backing store can move to Postgres later without changing the frontend data contract.
