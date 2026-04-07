# 🔝 topNav

Top app bar, user menu, and account modals rendered on every page.

## Structure

| Path                             | Role                                                                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/topNav.tsx`          | App bar shell controls, auth-aware CTA visibility, and layout wiring                                                                                |
| `components/userMenu.tsx`        | Theme picker plus guest and authenticated account actions                                                                                           |
| `components/addUserModal.tsx`    | Admin-only modal for creating new users (`POST /api/user`)                                                                                          |
| `components/changeNameModal.tsx` | Modal for changing display name; reissues JWT and navigates to the new profile URL on success; launched from `playerProfilePage` (own profile only) |
| `components/*.modal.tsx`         | Login, password, and account modals launched from the user menu                                                                                     |
| `hooks/`                         | Feature hooks for top-bar account flows                                                                                                             |
| `logic/`                         | Pure validation helpers used by the feature                                                                                                         |
| `tests/`                         | Tests for top-nav validation logic and auth-aware menu states                                                                                       |

## Rules

- `TopNav` must receive shell state and toggle callbacks from `frontend/layout/pageLayout.tsx`, not read Redux directly.
- `TopNav` must always render `UserMenu`, even when the user is not authenticated.
- `TopNav` must not render a separate Login button; guest auth entry lives in `UserMenu`.
- `UserMenu` must show Login as the last standout action for guests.
- `UserMenu` must show Sign out as the last standout action for authenticated users.
- Change password and Set password must not appear unless the user is authenticated.
- "Add user" must only appear when the authenticated user's JWT contains `role: 'admin'`.
- `ChangeNameModal` must only be rendered for the authenticated user's own profile — the server also enforces this (403 for non-owners).
- `ChangeNameModal` must dispatch the reissued JWT via `setToken` before navigating, so the new name is reflected immediately without a logout/login cycle.
- The app bar width and left offset must track the active drawer width on desktop.
- Small-screen actions must stay compact enough to avoid crowding the title.
