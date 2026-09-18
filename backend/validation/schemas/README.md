# 📋 Schemas

Zod v4 schemas for validating incoming request bodies, grouped by domain.

## Files

| File            | Schemas                                 |
| --------------- | --------------------------------------- |
| `auth.ts`       | `createUserSchema`, `setPasswordSchema` |
| `user.ts`       | `uuidSchema`, `createUserAdminSchema`   |
| `gameResult.ts` | `addGameResultSchema`                   |

## Conventions

- Use Zod v4 top-level APIs: `z.email()`, `z.uuid()` (not the deprecated `z.string().email()` form)
- Custom error messages use string shorthand: `z.string().min(1, 'Required')`
- Cross-field validation uses `.refine()` with `{ error: '...', path: ['fieldName'] }`
