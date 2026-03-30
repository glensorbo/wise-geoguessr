# 🏗️ Layout

Shell components that define the page structure. Not business-logic-aware.

| File               | Role                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| `pageLayout.tsx`   | Authenticated layout — composes `TopNav`, `LeftNav`, and `<Outlet />`      |
| `publicLayout.tsx` | Public layout — `TopNav` only (no sidebar), used for unauthenticated pages |
| `constants.ts`     | Shared layout constants (e.g. `DRAWER_WIDTH`)                              |

## Notes

- `pageLayout.tsx` is the only file here allowed to import from `features/`.
- Keep layout components structurally focused — no API calls, no Redux slices.
