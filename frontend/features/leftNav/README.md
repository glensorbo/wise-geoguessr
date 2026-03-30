# ◀️ leftNav

Permanent sidebar navigation rendered on the left of every page.

## Structure

- `components/leftNav.tsx` — the `LeftNav` component (MUI `Drawer`)
- `hooks/` — hooks scoped to this feature (e.g. active-route tracking)
- `logic/` — pure helpers (e.g. building nav tree from config)
- `types/` — TypeScript types for nav items, groups, etc.
- `state/` — Redux slice if the nav needs its own state (e.g. collapsed sections)
