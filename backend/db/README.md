# 🗄️ Database

All database-related code using [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL.

## 📁 Structure

```
backend/db/
├── client.ts        # Database client — singleton + pingDb() with retry logic
├── seed.ts          # Seed script — creates the initial admin user
├── schemas/         # Table definitions (source of truth for all types)
│   ├── users.ts        # users table with user_role enum (admin | user)
│   ├── gameRounds.ts   # game_rounds table (id, date unique, timestamps)
│   └── gameScores.ts   # game_scores table (id, round_id FK → game_rounds cascade, player_name, score, created_at)
└── migrations/      # Auto-generated SQL migration files
```

## 🔌 Environment Setup

The connection URL is built at runtime from individual environment variables. Set these in your `.env`:

```env
POSTGRES_SERVER=localhost:5432
POSTGRES_DB=your_db
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
```

In Docker, `POSTGRES_SERVER` is set to `db:5432` (the compose service name) — all other vars come from the same `.env`.

## 🔑 Database Client

Always access the database via `getDb()` from `@backend/db/client`. It creates the connection on first call and caches it — subsequent calls return the same instance. The connection pool is configured with `max: 10`, `idle_timeout: 30s`, and `connect_timeout: 10s`.

```ts
import { getDb } from '@backend/db/client';
import { users } from '@backend/db/schemas/users';

const db = getDb();
const allUsers = await db.select().from(users);
```

### `pingDb()`

Use `pingDb()` at startup to verify the database is reachable before accepting traffic. It runs `SELECT 1` with exponential backoff — retrying up to 5 times (1s, 2s, 4s, 8s, 16s) before throwing.

```ts
import { pingDb } from '@backend/db/client';

await pingDb(); // called in server.ts before Bun.serve()
```

Register every new schema in the schema object inside `client.ts`:

```ts
import { users } from './schemas/users';
import { blogPosts } from './schemas/blogPosts';

cachedDb = drizzle(cachedClient, { schema: { users, blogPosts } });
```

## 📐 Schema Conventions

- **File names**: `camelCase` (e.g., `users.ts`, `blogPosts.ts`)
- **SQL table names**: `snake_case` (e.g., `users`, `blog_posts`)
- **Primary keys**: UUID with `defaultRandom()`
- **Timestamps**: Always include `createdAt` and `updatedAt`
- **Enums**: Define with `pgEnum` and import in the schema file (e.g., `user_role`)
- **Types**: Defined in `backend/types/` using `$inferSelect` / `$inferInsert` — never in the schema file itself

## ➕ Creating a New Schema

1. Create `backend/db/schemas/myResource.ts`:

```ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const myResources = pgTable('my_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

2. Add types to `backend/types/myResource.ts`:

```ts
import { myResources } from '@backend/db/schemas/myResource';

export type MyResource = typeof myResources.$inferSelect;
export type NewMyResource = typeof myResources.$inferInsert;
```

3. Register in `backend/db/client.ts`:

```ts
const schema = { users, myResources };
```

4. Generate and apply migration:

```bash
bun run db:generate
bun run db:migrate
```

## 🔄 Migration Workflow

### When to generate migrations

Always generate a migration when you:

- Create a new table
- Add, remove, or rename columns
- Change column types or constraints
- Add or remove foreign keys or indexes

### Development

```bash
bun run db:generate   # Creates a new SQL file in backend/db/migrations/
bun run db:migrate    # Applies it to your database
```

Review the generated SQL before applying — check for unexpected `DROP` or `ALTER` statements.

### Production

Run `bun run db:migrate` during deployment. **Never use `db:push` in production** — it bypasses migrations and can cause data loss.

## 🛠️ Drizzle Studio

```bash
bun run db:studio   # Visual browser for your database at https://local.drizzle.studio
```

## 🌱 Seeding

Run the seed script once after initial setup to create the admin user:

```bash
bun run db:seed
```

The script reads credentials from env vars — set these in your `.env`:

```env
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change-me-on-first-login
SEED_ADMIN_NAME=Admin         # optional, defaults to "Admin"
```

The script is **idempotent** — if the email already exists it exits cleanly without error. The admin user can then use `POST /api/auth/create-user` to invite other users.

The seed script also creates 48 historical game rounds with scores. These use `INSERT … ON CONFLICT DO NOTHING` so re-running is safe.
