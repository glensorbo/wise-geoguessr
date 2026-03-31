# 🔐 login

Handles user authentication: the login form, modal, auth state (JWT token), and validation.

## Structure

| File                         | Purpose                                                                   |
| ---------------------------- | ------------------------------------------------------------------------- |
| `components/loginForm.tsx`   | Email/password form with `onSubmitHandler`, error display, and validation |
| `components/loginModal.tsx`  | MUI `Dialog` wrapper around `LoginForm` — opened from TopNav              |
| `hooks/useLogin.ts`          | Wraps the login mutation, dispatches token on success                     |
| `logic/loginSchema.ts`       | Zod schema for login credentials                                          |
| `logic/validateLoginForm.ts` | Form validation logic                                                     |
| `state/authSlice.ts`         | Redux slice storing the JWT token (persisted to localStorage)             |
| `state/loginFormSlice.ts`    | Redux slice for login form UI state                                       |

> `ProtectedRoute` lives in `shared/components/` — it is not owned by this feature.

## Auth flow

1. TopNav "Login" button → opens `LoginModal` (no navigation)
2. User submits form → `useLogin` calls the API → token stored in Redux + localStorage
3. `AuthProvider` (in `providers/`) decodes token on mount and clears it if expired
4. Unauthenticated visit to a protected route → `ProtectedRoute` redirects to `/`
5. `/login` visited directly while authenticated → `LoginPage` redirects to `/`
