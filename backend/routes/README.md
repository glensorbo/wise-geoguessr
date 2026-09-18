# 🛣️ Routes

Route definitions for `Bun.serve()`. Each resource has its own file exporting a plain routes object that is spread directly into the server.

## Convention

One file per resource, named `<resource>Routes.ts`. The exported object keys are URL patterns; values are method handlers (optionally wrapped with middleware).

```ts
// backend/routes/myResourceRoutes.ts
import { myResourceController } from '@backend/controllers/myResourceController';
import { authMiddleware } from '@backend/middleware/authMiddleware';
import { withMiddleware } from '@backend/middleware';

export const myResourceRoutes = {
  '/api/my-resource': {
    GET: withMiddleware(authMiddleware)(() => myResourceController.getAll()),
    POST: withMiddleware(authMiddleware)((req, ctx) =>
      myResourceController.create(req, ctx),
    ),
  },

  '/api/my-resource/:id': {
    GET: withMiddleware(authMiddleware)((req) => {
      const id = req.params['id'] ?? '';
      return myResourceController.getById(id);
    }),
  },
};
```

Then spread it into `server.ts`:

```ts
// backend/server.ts
import { myResourceRoutes } from './routes/myResourceRoutes';

Bun.serve({
  routes: {
    '/healthcheck': { GET: () => new Response('OK') },
    ...userRoutes,
    ...myResourceRoutes,
    '/*': ...,
  },
});
```

## Route params and `noUncheckedIndexedAccess`

This project enables `noUncheckedIndexedAccess` in `tsconfig.json`, so `req.params['id']` returns `string | undefined`. Always provide a fallback when passing params to controllers:

```ts
// ✅
const id = req.params['id'] ?? '';

// ❌ TypeScript error — string | undefined not assignable to string
const id = req.params['id'];
```

## Middleware

Apply middleware per-route with `withMiddleware()`. See [`middleware/README.md`](../middleware/README.md) for full details.

## HTTP Test Files

Every routes file should have a matching file in `rest/` for manual testing. See [`rest/README.md`](../../rest/README.md).
