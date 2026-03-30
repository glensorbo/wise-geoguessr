# 🔝 topNav

Top application bar rendered at the top of every page.

## Structure

- `components/topNav.tsx` — the `TopNav` component (MUI `AppBar`)
- `hooks/` — hooks scoped to this feature (e.g. scroll behaviour)
- `logic/` — pure helpers (e.g. breadcrumb computation)
- `types/` — TypeScript types for nav items, props, etc.
- `state/` — Redux slice if the nav needs its own state (e.g. notifications badge)
