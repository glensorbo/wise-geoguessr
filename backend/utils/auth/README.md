# 🔐 Auth Utils

JWT signing/verification, cryptographic token generation, and refresh token cookie helpers. Requires `JWT_SECRET` env var to be set.

> 📦 Types (`AppJwtPayload`, `TokenType`) live in `@backend/types/` — not in this folder.
> Each file exports exactly one thing and is named after it. Constants are consolidated into a config object.

| File                      | Export                 | Description                                                        |
| ------------------------- | ---------------------- | ------------------------------------------------------------------ |
| `passphrase.ts`           | `generatePassphrase`   | Generates a cryptographically random base64url passphrase          |
| `signSignupToken.ts`      | `signSignupToken`      | Signs a short-lived (1h) signup JWT (`tokenType: 'signup'`)        |
| `signAuthToken.ts`        | `signAuthToken`        | Signs a short-lived (15m) auth JWT with `role` claim               |
| `verifyToken.ts`          | `verifyToken`          | Verifies and decodes a JWT; extracts `role` (defaults to `'user'`) |
| `generateRefreshToken.ts` | `generateRefreshToken` | Generates a 32-byte cryptographically random hex token             |
| `hashRefreshToken.ts`     | `hashRefreshToken`     | SHA-256 hashes a raw refresh token for safe DB storage             |
| `refreshTokenConfig.ts`   | `refreshTokenConfig`   | Cookie name, TTL in seconds, TTL in days — shared constants        |
| `buildRefreshCookie.ts`   | `buildRefreshCookie`   | Builds an HttpOnly Set-Cookie header for a live refresh token      |
| `clearRefreshCookie.ts`   | `clearRefreshCookie`   | Builds a Set-Cookie header that immediately expires the cookie     |
| `readRefreshCookie.ts`    | `readRefreshCookie`    | Extracts the raw refresh token from a request's Cookie header      |

> ⚠️ `JWT_SECRET` must be set in the environment or tokens will be signed/verified with an empty secret.
