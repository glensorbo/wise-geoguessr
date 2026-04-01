# 🏗️ Layout

Shell components that compose the app frame around routed pages.

| File             | Role                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `pageLayout.tsx` | Full shell — composes `TopNav`, `LeftNav`, and `<Outlet />`; wires persisted desktop collapse state and local mobile drawer state |
| `constants.ts`   | Shared shell constants (`DRAWER_WIDTH`, `DRAWER_COLLAPSED_WIDTH`) used by top-bar and sidebar sizing                              |

## Rules

- `pageLayout.tsx` must be the only file here that imports from `features/`.
- `pageLayout.tsx` must keep shell-only responsive state wiring here: the desktop sidebar preference comes from the Redux `sidebar` slice, while the mobile drawer open/close state stays local.
- Layout files must keep structure and sizing concerns only.
- Layout files must not fetch data or define Redux slices.
