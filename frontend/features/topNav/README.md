# 🔝 topNav

Top application bar rendered at the top of every page.

## Structure

| Path                      | Role                                                          |
| ------------------------- | ------------------------------------------------------------- |
| `components/topNav.tsx`   | App bar shell controls, auth actions, and responsive CTA text |
| `components/userMenu.tsx` | Authenticated account actions                                 |
| `components/*.modal.tsx`  | Password and account modals launched from the top bar         |
| `hooks/`                  | Feature hooks for top-bar account flows                       |
| `logic/`                  | Pure validation helpers used by the feature                   |
| `tests/`                  | Tests for top-nav validation logic                            |

## Rules

- `TopNav` must receive shell state and toggle callbacks from `frontend/layout/pageLayout.tsx`, not read Redux directly.
- The menu button must collapse the desktop sidebar and open the mobile drawer with the same control.
- The app bar width and left offset must track the active drawer width on desktop.
- Small-screen actions must stay compact enough to avoid crowding the title.
