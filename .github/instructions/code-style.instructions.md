---
applyTo: '**/*.{ts,tsx}'
---

# 🎨 Code Style

## TypeScript

- Strict mode is enabled — never weaken it (`strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`)
- `verbatimModuleSyntax` is on — always use `import type` for type-only imports
- **Never define types manually** — derive them from Drizzle schemas:
  ```ts
  export type User = typeof users.$inferSelect;
  export type NewUser = typeof users.$inferInsert;
  ```
- Use generics or specific unions instead of `any`
- Prefer `unknown` over `any` when the shape is truly unknown

## Naming

| Thing                  | Convention      | Example           |
| ---------------------- | --------------- | ----------------- |
| Files                  | camelCase       | `userService.ts`  |
| DB tables              | snake_case      | `refresh_tokens`  |
| DB columns             | snake_case      | `created_at`      |
| TS variables/functions | camelCase       | `getUserById`     |
| TS types/interfaces    | PascalCase      | `UserService`     |
| React components       | PascalCase      | `LoginForm`       |
| Constants              | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |

## Imports

- Use **path aliases** when crossing layer boundaries — never `../../` relative imports:
  - `@backend/*` for anything in `backend/`
  - `@frontend/*` for anything in `frontend/`
  - `@type/*` for anything in `types/`
- Relative imports are fine within the same layer/feature directory
- Group imports: external packages first, then path aliases, then relative

## Functions & Objects

- Prefer plain **functions and objects** over classes
- Use **factory functions** for anything that needs dependency injection:
  ```ts
  export const createUserService = (repo: typeof UserRepositoryType) => ({
    async getAllUsers() { ... }
  });
  export const userService = createUserService(userRepository);
  ```
- The default export at the bottom is always the wired-up instance (not the factory)

## Comments

- Only comment code that **genuinely needs clarification** — never write comments that restate what the code already says
- Use JSDoc (`/** */`) only for public API functions that aren't self-explanatory
- Prefer expressive naming over explanatory comments

## React

- **Functional components only** — no class components
- **Named exports** — avoid `export default` for components; default exports are reserved for page-level files
- Use hooks for all state and side effects
- `React.FC` is optional; prefer inferred types from props interface

## Error Handling

- In services, return `ErrorOr<T>` instead of throwing for expected/known failures
- Only throw for truly unexpected errors (programmer mistakes, invariant violations)
- Never swallow errors silently

## Formatting & Linting

- **Formatter:** `oxfmt` — run `bun run format` to fix, `bun run format:check` to verify
- **Linter:** `oxlint` (type-aware) — run `bun run lint`, auto-fix with `bun run lint:fix`
- **React Compiler:** `eslint-plugin-react-compiler` — run `bun run lint:compiler`
- **Dead code:** `knip` — run `bun run knip`
- All four are part of `bun run cc` — always run before finishing
