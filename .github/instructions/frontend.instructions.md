---
applyTo: 'frontend/**/*'
---

# ⚛️ Frontend

## Stack

- **React 19** with StrictMode
- **Redux Toolkit** + RTK Query for server state
- **MUI v6+** for UI components
- **React Router** for client-side routing
- **HMR** in development via `import.meta.hot`

## Dev vs Production

| Mode       | How it works                                                                               |
| ---------- | ------------------------------------------------------------------------------------------ |
| Dev        | `public/index.html` served directly by `Bun.serve()` with HMR                              |
| Production | `bun run build` scans `frontend/**/*.html` → bundles to `dist/` → served with SPA fallback |

Never use Vite or webpack — Bun's bundler handles everything.

## Feature-Based Structure

Organise code by **feature**, not by type:

```
frontend/features/<feature-name>/
├── components/   → React components for this feature
├── hooks/        → Custom hooks
├── logic/        → Pure logic, helpers
├── state/        → Redux slices specific to this feature
└── tests/        → Unit tests for this feature
```

Shared/cross-feature code goes in `frontend/shared/`.

## Environment Variables

Client-side env vars **must** be prefixed with `BUN_PUBLIC_`:

```ts
const apiUrl = Bun.env.BUN_PUBLIC_API_URL;
```

Never access server-side env vars from frontend code.

## State Management

- Use **RTK Query** (`frontend/redux/api/`) for all server data fetching and mutations
- Use Redux slices (`frontend/redux/slices/`) for client-side state that must be shared globally
- Use local `useState`/`useReducer` for component-local state
- Auth token lives in Redux and is persisted to `localStorage` via middleware

## Routing & Auth

```
/login          → LoginPage (public)
/               → HomePage (protected)
/*              → NotFoundPage (protected fallback)
```

- `ProtectedRoute` redirects unauthenticated users to `/login`
- `AuthProvider` silently refreshes expired tokens via `POST /api/auth/refresh`

## Loading States

**Always prefer skeleton loaders over spinners for data loading states.**

- Use MUI's `Skeleton` component from `@mui/material/Skeleton` — or the ready-made patterns in `frontend/shared/components/skeleton.tsx`:
  - `TableSkeleton` — for tabular data
  - `ListSkeleton` — for vertically stacked lists
  - `CardSkeleton` — for card grids
- Skeleton layouts should **match the shape** of the content they're replacing so the UI doesn't jump on load
- Button loading states (via MUI's `loading` prop) are still appropriate for form submissions and mutations — skeletons are for data fetches

```tsx
// ✅ Use skeleton while data loads
const { data, isLoading } = useGetUsersQuery();
if (isLoading) return <TableSkeleton rows={5} cols={3} />;

// ✅ Use button loading prop for mutations
<Button loading={isSubmitting} type="submit">
  Save
</Button>;

// ❌ Don't use a spinner for data fetches
if (isLoading) return <CircularProgress />;
```

## Error Boundaries

The app root is wrapped in `<ErrorBoundary>` (from `frontend/shared/components/errorBoundary.tsx`).
For sections that should fail independently without crashing the whole page, wrap them in their own `<ErrorBoundary>`.

## Testing

- Frontend tests use `bun:test` with **happy-dom** (registered globally via `bunfig.toml` preload of `frontend/test-setup.ts`)
- No browser or DOM server needed for unit tests
- For full E2E browser tests, use the `e2e-playwright` agent and files under `e2e/frontend/`
