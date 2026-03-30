# 🔗 Middleware

Composable middleware for `Bun.serve()` route handlers. Middleware runs before the route handler, can augment a shared `ctx` object, and can short-circuit the chain by returning a `Response`.

All handlers wrapped with `withMiddleware` automatically receive:

- **CORS headers** on every response (controlled by `CORS_ORIGIN` env var)
- **OPTIONS preflight** handling (204 with correct Access-Control headers)
- **Request/response logging** (`METHOD /path → STATUS (Xms)`)

## Core Types (`index.ts`)

```ts
// A request augmented with Bun's route params
type BunRequest = Request & { params: Record<string, string> };

// Shared context passed through the chain — middleware attaches data here
type Ctx = Record<string, unknown>;

// Returns null to continue, or a Response to short-circuit
type MiddlewareFn = (
  req: BunRequest,
  ctx: Ctx,
) => Response | null | Promise<Response | null>;

// Handler that receives the fully populated ctx
type HandlerFn = (req: BunRequest, ctx: Ctx) => Response | Promise<Response>;
```

## `withMiddleware`

Composes middleware before a handler, returning a standard `BunHandler` compatible with `Bun.serve()` routes.

```ts
withMiddleware(...middlewares: MiddlewareFn[]) => (handler: HandlerFn) => BunHandler
```

**Example — single middleware:**

```ts
withMiddleware(authMiddleware)((req, ctx) => {
  return controller.getAll();
});
```

**Example — chained middleware:**

```ts
withMiddleware(
  authRateLimit,
  authMiddleware,
  requireRole('admin'),
)((req, ctx) => {
  const { sub } = (ctx as AuthCtx).user;
  return controller.getProfile(sub);
});
```

Middleware runs left to right. The first one to return a `Response` short-circuits — the handler and remaining middleware are skipped.

## `authMiddleware`

Extracts and verifies a Bearer JWT from the `Authorization` header. **Rejects signup tokens** — those are only valid on `/api/auth/set-password`.

**On success:** attaches the decoded `AppJwtPayload` to `ctx.user` and returns `null` (chain continues).  
**On failure:** returns `401 Unauthorized` (chain stops).

**Requires:** `JWT_SECRET` environment variable.

## `signupTokenMiddleware`

Same structure as `authMiddleware` but **only accepts signup tokens** (`tokenType: 'signup'`). Used exclusively on the `/api/auth/set-password` route. Regular auth tokens are rejected.

## `requireRole(...roles)`

Factory that returns a middleware requiring `ctx.user.role` to match one of the given roles.  
**Must be used after `authMiddleware`** (relies on `ctx.user` being populated).

```ts
withMiddleware(
  authMiddleware,
  requireRole('admin'),
)((req, ctx) => {
  return controller.adminOnlyAction(req, ctx);
});
```

**On success:** returns `null` (chain continues).  
**On mismatch:** returns `403 Forbidden`.

## `authRateLimit` / `createRateLimitMiddleware`

In-memory rate limiter. `authRateLimit` allows 10 requests per minute per IP and is applied to the login and refresh endpoints.

```ts
// Custom rate limit
const myLimit = createRateLimitMiddleware({ max: 20, windowMs: 60_000 });

// Pre-configured for auth routes
withMiddleware(authRateLimit)((req) => controller.login(req));
```

> ⚠️ In-memory only — single instance. For multi-instance deployments, replace the store with Redis.

## Token Types

| Token type | Issued by         | Lifetime | Accepted by             |
| ---------- | ----------------- | -------- | ----------------------- |
| `auth`     | `signAuthToken`   | 15 min   | `authMiddleware`        |
| `signup`   | `signSignupToken` | 1 hour   | `signupTokenMiddleware` |

## Adding a New Middleware

Create a new file in `backend/middleware/` and export a `MiddlewareFn`:

```ts
// backend/middleware/myMiddleware.ts
import type { MiddlewareFn } from '.';

export const myMiddleware: MiddlewareFn = async (req, ctx) => {
  if (!someCondition) {
    return new Response('Rejected', { status: 400 });
  }
  ctx.myData = 'something';
  return null; // continue
};
```

Then compose it in your routes:

```ts
withMiddleware(authMiddleware, myMiddleware)((req, ctx) => { ... })
```
