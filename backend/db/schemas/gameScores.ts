import {
  integer,
  pgTable,
  uuid,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

import { gameRounds } from './gameRounds';

export const gameScores = pgTable('game_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  roundId: uuid('round_id')
    .notNull()
    .references(() => gameRounds.id, { onDelete: 'cascade' }),
  playerName: varchar('player_name', { length: 100 }).notNull(),
  score: integer('score').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
});
