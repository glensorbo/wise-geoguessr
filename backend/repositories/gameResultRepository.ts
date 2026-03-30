import dayjs from 'dayjs';
import { eq, sql } from 'drizzle-orm';

import { getDb } from '@backend/db/client';
import { gameRounds } from '@backend/db/schemas/gameRounds';
import { gameScores } from '@backend/db/schemas/gameScores';

import type { GameResult } from '@backend/types/gameResult';

export const gameResultRepository = {
  async getAll(): Promise<GameResult[]> {
    return this._fetchAndAssemble();
  },

  async getByYear(year: number): Promise<GameResult[]> {
    return this._fetchAndAssemble(year);
  },

  async getAvailableYears(): Promise<number[]> {
    const db = getDb();
    const rows = await db
      .selectDistinct({ date: gameRounds.date })
      .from(gameRounds)
      .orderBy(gameRounds.date);

    const years = Array.from(
      new Set(rows.map((r) => dayjs(r.date).year())),
    ).toSorted((a, b) => b - a);

    return years;
  },

  async getByDate(date: string): Promise<GameResult | null> {
    const db = getDb();
    const rounds = await db
      .select()
      .from(gameRounds)
      .where(eq(gameRounds.date, date))
      .limit(1);

    if (rounds.length === 0) {
      return null;
    }

    const round = rounds[0]!;
    const scores = await db
      .select()
      .from(gameScores)
      .where(eq(gameScores.roundId, round.id));

    return {
      date: round.date,
      scores: Object.fromEntries(scores.map((s) => [s.playerName, s.score])),
    };
  },

  async create(
    date: string,
    scores: Record<string, number>,
  ): Promise<GameResult> {
    const db = getDb();

    const [round] = await db.insert(gameRounds).values({ date }).returning();

    if (!round) {
      throw new Error('Failed to create game round');
    }

    const scoreEntries = Object.entries(scores).map(([playerName, score]) => ({
      roundId: round.id,
      playerName,
      score,
    }));

    await db.insert(gameScores).values(scoreEntries);

    return { date, scores };
  },

  async _fetchAndAssemble(year?: number): Promise<GameResult[]> {
    const db = getDb();

    const query = db
      .select({
        date: gameRounds.date,
        playerName: gameScores.playerName,
        score: gameScores.score,
      })
      .from(gameRounds)
      .innerJoin(gameScores, eq(gameScores.roundId, gameRounds.id))
      .$dynamic();

    const rows = year
      ? await query.where(
          sql`EXTRACT(YEAR FROM ${gameRounds.date}::date) = ${year}`,
        )
      : await query;

    const roundMap = new Map<string, Record<string, number>>();
    for (const row of rows) {
      const existing = roundMap.get(row.date) ?? {};
      existing[row.playerName] = row.score;
      roundMap.set(row.date, existing);
    }

    return Array.from(roundMap.entries())
      .map(([date, scores]) => ({ date, scores }))
      .toSorted((a, b) => b.date.localeCompare(a.date));
  },
};
