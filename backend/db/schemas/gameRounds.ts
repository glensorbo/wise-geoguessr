import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const gameRounds = pgTable('game_rounds', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: varchar('date', { length: 10 }).notNull().unique(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});
