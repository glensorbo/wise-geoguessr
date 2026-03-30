---
applyTo: 'backend/db/**/*'
---

# 🗄️ Database

## ORM: Drizzle

This project uses **Drizzle ORM** with PostgreSQL. Schemas live in `backend/db/schemas/`.

## Schema Conventions

```ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const things = pgTable('things', {
  // snake_case table name
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

- **Table names:** `snake_case` (plural)
- **Column names in DB:** `snake_case`
- **Column names in TS:** `camelCase` (Drizzle maps automatically)
- **Primary keys:** UUID with `defaultRandom()`
- **Timestamps:** `created_at` / `updated_at` on every table; use `dayjs().toISOString()` when setting `updatedAt` manually in updates

## Types From Schema

**Never define types manually.** Always derive from the schema:

```ts
// backend/types/thing.ts
import { things } from '@backend/db/schemas/things';

export type Thing = typeof things.$inferSelect; // full row (with all fields)
export type NewThing = typeof things.$inferInsert; // insert shape (optional defaults)
```

## DB Client

Always use the singleton — never create a new client:

```ts
import { getDb } from '@backend/db/client';

const db = getDb(); // cached connection, safe to call repeatedly
```

## Migration Workflow

1. Edit or add a schema file in `backend/db/schemas/`
2. Generate the migration SQL: `bun run db:generate`
3. **Review the generated SQL** in `backend/db/migrations/` before applying
4. Apply to the database: `bun run db:migrate`

Never edit migration files manually. Re-generate if you need to change them.

## Seed

`backend/db/seed.ts` creates the initial admin user. It is **idempotent** — safe to run multiple times without duplicating data. Run with `bun run db:seed`.

## Drizzle Studio

Visual browser for the database: `bun run db:studio`
