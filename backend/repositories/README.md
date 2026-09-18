# 🗃️ Repositories

The repository layer is the only place that talks to the database. Repositories contain pure data access logic using Drizzle ORM — no business logic, no data transformation.

## 📁 Structure

```
repositories/
├── userRepository.ts           # CRUD queries for the users table
├── refreshTokenRepository.ts   # Refresh token storage and invalidation
├── gameResultRepository.ts     # getAll, getByYear, getAvailableYears, getByDate, create (transaction)
└── hallOfFameRepository.ts     # All-time aggregates: highest score, longest win streak, best season total
```

## 📐 Responsibilities

- Execute Drizzle ORM queries
- Return raw database types (`User`, not `SafeUser`)
- Handle DB-level filtering (e.g., `where(eq(users.id, id))`)

Repositories contain **no business logic** and **no HTTP concerns**.

## 📝 Example

```ts
export const userRepository = {
  async getAll(): Promise<User[]> {
    const db = getDb();
    return await db.select().from(users);
  },

  async getById(id: string): Promise<User | undefined> {
    const db = getDb();
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  },
};
```

## 🔌 Database Client

Always get the database instance via `getDb()` from `@backend/db/client`. It uses a singleton pattern — the connection is created once and cached:

```ts
import { getDb } from '@backend/db/client';
```

## 🧪 Testing

Repository logic is tested indirectly through service and controller tests using mock repositories from `@backend/utils/test/` (`mockUserRepository`, `mockGameResultRepository`). This keeps tests fast and database-free.

If direct repository tests are needed, they require a live database connection and should be run separately from unit tests.
