# 🏗️ Layout

Shell components that define the page structure. Not business-logic-aware.

| File               | Role                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `pageLayout.tsx`   | Full layout — composes `TopNav`, `LeftNav`, and `<Outlet />`; used for all public and authenticated routes |
| `publicLayout.tsx` | Minimal layout — `TopNav` only (no sidebar); currently unused                                              |
| `constants.ts`     | Shared layout constants (e.g. `DRAWER_WIDTH`)                                                              |

## Notes

- `pageLayout.tsx` is the only file here allowed to import from `features/`.
- Keep layout components structurally focused — no API calls, no Redux slices.
