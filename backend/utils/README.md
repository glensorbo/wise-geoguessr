# 🛠️ Utils

Utility helpers organised by concern. Each sub-folder is self-contained with its own README, source files, and tests.

| Folder      | Purpose                                                                         |
| ----------- | ------------------------------------------------------------------------------- |
| `auth/`     | JWT signing/verification, refresh token generation, and HttpOnly cookie helpers |
| `response/` | HTTP response builder helpers for success and error cases                       |
| `test/`     | Shared mock data and repositories for unit tests                                |

## Top-level Files

| File      | Export                                      | Description                                                              |
| --------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| `env.ts`  | `validateEnv`                               | Validates all required env vars at startup — exits with error if missing |
| `cors.ts` | `applyCorsHeaders`, `corsPreflightResponse` | CORS utilities used by `withMiddleware` — reads `CORS_ORIGIN` env var    |
