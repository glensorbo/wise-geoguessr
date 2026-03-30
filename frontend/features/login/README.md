# 🔐 login

Handles user authentication: the login form, auth state (JWT token), and route protection.

## Structure

- `components/loginForm.tsx` — email/password form with `onSubmitHandler`, error display, and validation
- `components/protectedRoute.tsx` — redirects unauthenticated users to `/login`
- `hooks/useLogin.ts` — wraps the login mutation, dispatches token on success
- `types/loginTypes.ts` — `LoginCredentials` and related types
- `state/authSlice.ts` — Redux slice storing the JWT token (persisted to localStorage)

## Auth flow

1. Unauthenticated visit → `ProtectedRoute` redirects to `/login`
2. User submits form → `useLogin` calls the API → token stored in Redux + localStorage
3. `AuthProvider` (in `providers/`) decodes token on mount and clears it if expired
4. `/login` visited while authenticated → `LoginPage` redirects to `/`
