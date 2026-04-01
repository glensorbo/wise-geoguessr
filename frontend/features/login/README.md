# 🔐 login

Login form UI, auth state, and validation shared by the modal and `/login` page.

## Structure

| File                         | Purpose                                                                 |
| ---------------------------- | ----------------------------------------------------------------------- |
| `components/loginForm.tsx`   | Email/password form with submit handling, error display, and validation |
| `components/loginModal.tsx`  | MUI `Dialog` wrapper around `LoginForm` — opened from `topNav/UserMenu` |
| `hooks/useLogin.ts`          | Wraps the login mutation and stores auth state on success               |
| `logic/loginSchema.ts`       | Zod schema for login credentials                                        |
| `logic/validateLoginForm.ts` | Form validation logic                                                   |
| `state/authSlice.ts`         | Redux slice storing the JWT token and remembered email                  |
| `state/loginFormSlice.ts`    | Redux slice for login form UI state                                     |

> `ProtectedRoute` lives in `shared/components/`; see `frontend/pages/README.md` for route-level ownership.

## Rules

- `LoginForm` must stay reusable between `LoginModal` and `frontend/pages/loginPage.tsx`.
- Guest login from the top bar must open `LoginModal` from `topNav/UserMenu`, not a standalone TopNav button.
- Successful login must store the token in Redux and persist it through `authSlice`.
- `AuthProvider` must validate persisted auth state on mount and clear expired tokens.
- `ProtectedRoute` must keep redirect behavior outside this feature.
- `/login` must remain available for direct navigation and must redirect authenticated users to `/`.
