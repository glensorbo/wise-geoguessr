import { eq, max, sql } from 'drizzle-orm';

import { getDb } from '@backend/db/client';
import { gameRounds } from '@backend/db/schemas/gameRounds';
import { gameScores } from '@backend/db/schemas/gameScores';

import type { HallOfFame } from '@backend/types/hallOfFame';

export const hallOfFameRepository = {
  async getHallOfFame(): Promise<HallOfFame> {
    const db = getDb();

    // ── 1. Highest single-round score ──────────────────────────────────────
    const maxScoreRow = await db
      .select({ maxScore: max(gameScores.score) })
      .from(gameScores);
    const topScore = maxScoreRow[0]?.maxScore ?? null;

    let highestSingleRoundScore: HallOfFame['highestSingleRoundScore'] = null;
    if (topScore !== null) {
      const holders = await db
        .select({
          playerName: gameScores.playerName,
          date: gameRounds.date,
        })
        .from(gameScores)
        .innerJoin(gameRounds, eq(gameScores.roundId, gameRounds.id))
        .where(eq(gameScores.score, topScore));

      highestSingleRoundScore = {
        score: topScore,
        holders: holders.map((h) => ({
          playerName: h.playerName,
          date: h.date,
        })),
      };
    }

    // ── 2. Highest season total ────────────────────────────────────────────
    const seasonRows = await db
      .select({
        playerName: gameScores.playerName,
        year: sql<number>`EXTRACT(YEAR FROM ${gameRounds.date}::date)`,
        total: sql<number>`SUM(${gameScores.score})`,
      })
      .from(gameScores)
      .innerJoin(gameRounds, eq(gameScores.roundId, gameRounds.id))
      .groupBy(
        gameScores.playerName,
        sql`EXTRACT(YEAR FROM ${gameRounds.date}::date)`,
      );

    let highestSeasonTotal: HallOfFame['highestSeasonTotal'] = null;
    if (seasonRows.length > 0) {
      const maxTotal = Math.max(...seasonRows.map((r) => Number(r.total)));
      const seasonHolders = seasonRows
        .filter((r) => Number(r.total) === maxTotal)
        .map((r) => ({ playerName: r.playerName, year: Number(r.year) }));

      highestSeasonTotal = {
        total: maxTotal,
        holders: seasonHolders,
      };
    }

    // ── 3. Win streak + runner-up finishes (share one DB fetch) ───────────
    // Fetch all rounds with scores, ordered by date ascending
    const allRows = await db
      .select({
        date: gameRounds.date,
        playerName: gameScores.playerName,
        score: gameScores.score,
      })
      .from(gameRounds)
      .innerJoin(gameScores, eq(gameScores.roundId, gameRounds.id))
      .orderBy(gameRounds.date);

    // Group by date -> Map<date, Map<playerName, score>>
    const roundsByDate = new Map<string, Map<string, number>>();
    for (const row of allRows) {
      if (!roundsByDate.has(row.date)) {
        roundsByDate.set(row.date, new Map());
      }
      roundsByDate.get(row.date)!.set(row.playerName, row.score);
    }

    // For each date, find winner(s) = player(s) with max score in that round
    const dateWinners = new Map<string, Set<string>>();
    for (const [date, scores] of roundsByDate) {
      const roundMax = Math.max(...scores.values());
      dateWinners.set(
        date,
        new Set(
          [...scores.entries()]
            .filter(([, s]) => s === roundMax)
            .map(([p]) => p),
        ),
      );
    }

    // For each player, build participation history (only rounds they played)
    const playerHistory = new Map<
      string,
      Array<{ date: string; won: boolean }>
    >();
    for (const [date, scores] of roundsByDate) {
      const winners = dateWinners.get(date)!;
      for (const [playerName] of scores) {
        if (!playerHistory.has(playerName)) {
          playerHistory.set(playerName, []);
        }
        playerHistory
          .get(playerName)!
          .push({ date, won: winners.has(playerName) });
      }
    }

    // Compute best consecutive win streak per player
    type StreakResult = { streak: number; startDate: string; endDate: string };
    const playerBestStreak = new Map<string, StreakResult>();

    for (const [player, history] of playerHistory) {
      let current = 0;
      let currentStart = '';
      let best = 0;
      let bestStart = '';
      let bestEnd = '';

      for (const { date, won } of history) {
        if (won) {
          if (current === 0) {
            currentStart = date;
          }
          current++;
          if (current > best) {
            best = current;
            bestStart = currentStart;
            bestEnd = date;
          }
        } else {
          current = 0;
        }
      }

      if (best > 0) {
        playerBestStreak.set(player, {
          streak: best,
          startDate: bestStart,
          endDate: bestEnd,
        });
      }
    }

    let longestWinStreak: HallOfFame['longestWinStreak'] = null;
    if (playerBestStreak.size > 0) {
      const maxStreak = Math.max(
        ...[...playerBestStreak.values()].map((s) => s.streak),
      );

      const streakHolders = [...playerBestStreak.entries()]
        .filter(([, s]) => s.streak === maxStreak)
        .map(([playerName, s]) => ({
          playerName,
          startDate: s.startDate,
          endDate: s.endDate,
        }));

      longestWinStreak = {
        streak: maxStreak,
        holders: streakHolders,
      };
    }

    // ── 4. Most rounds played ─────────────────────────────────────────────
    // Reuse allRows already fetched: count distinct rounds per player
    const playerRoundCount = new Map<string, number>();
    for (const row of allRows) {
      playerRoundCount.set(
        row.playerName,
        (playerRoundCount.get(row.playerName) ?? 0) + 1,
      );
    }

    let mostRoundsPlayed: HallOfFame['mostRoundsPlayed'] = null;
    if (playerRoundCount.size > 0) {
      const maxRounds = Math.max(...playerRoundCount.values());
      mostRoundsPlayed = {
        rounds: maxRounds,
        holders: [...playerRoundCount.entries()]
          .filter(([, r]) => r === maxRounds)
          .map(([playerName]) => ({ playerName })),
      };
    }

    // ── 5. Highest average score (min 3 rounds) ───────────────────────────
    // Reuse playerRoundCount and allRows: compute per-player total to derive average
    const playerScoreTotal = new Map<string, number>();
    for (const row of allRows) {
      playerScoreTotal.set(
        row.playerName,
        (playerScoreTotal.get(row.playerName) ?? 0) + row.score,
      );
    }

    let highestAverageScore: HallOfFame['highestAverageScore'] = null;
    const qualifiedAverages: Array<{ playerName: string; average: number }> =
      [];
    for (const [playerName, total] of playerScoreTotal) {
      const rounds = playerRoundCount.get(playerName) ?? 0;
      if (rounds >= 3) {
        qualifiedAverages.push({
          playerName,
          average: Math.round(total / rounds),
        });
      }
    }
    if (qualifiedAverages.length > 0) {
      const maxAvg = Math.max(...qualifiedAverages.map((p) => p.average));
      highestAverageScore = {
        average: maxAvg,
        holders: qualifiedAverages
          .filter((p) => p.average === maxAvg)
          .map(({ playerName }) => ({ playerName })),
      };
    }

    // ── 6. Most runner-up finishes ────────────────────────────────────────
    // 2nd place = highest score in a round that is strictly less than the winner's score
    const playerRunnerUpCount = new Map<string, number>();
    for (const [date, scores] of roundsByDate) {
      const sortedScores = [...scores.values()].sort((a, b) => b - a);
      const firstScore = sortedScores[0]!;
      const secondScore = sortedScores.find((s) => s < firstScore);
      if (secondScore === undefined) {
        continue;
      }

      const dateRunnerUps = dateWinners.get(date)!;
      for (const [playerName, score] of scores) {
        if (score === secondScore && !dateRunnerUps.has(playerName)) {
          playerRunnerUpCount.set(
            playerName,
            (playerRunnerUpCount.get(playerName) ?? 0) + 1,
          );
        }
      }
    }

    let mostRunnerUpFinishes: HallOfFame['mostRunnerUpFinishes'] = null;
    if (playerRunnerUpCount.size > 0) {
      const maxRunnerUps = Math.max(...playerRunnerUpCount.values());
      mostRunnerUpFinishes = {
        count: maxRunnerUps,
        holders: [...playerRunnerUpCount.entries()]
          .filter(([, c]) => c === maxRunnerUps)
          .map(([playerName]) => ({ playerName })),
      };
    }

    // ── 7. All-time points leader ─────────────────────────────────────────
    // Reuse playerScoreTotal (already summed from allRows)
    let allTimePointsLeader: HallOfFame['allTimePointsLeader'] = null;
    if (playerScoreTotal.size > 0) {
      const maxAllTime = Math.max(...playerScoreTotal.values());
      allTimePointsLeader = {
        total: maxAllTime,
        holders: [...playerScoreTotal.entries()]
          .filter(([, t]) => t === maxAllTime)
          .map(([playerName]) => ({ playerName })),
      };
    }

    // ── 8. Highest win rate (min 5 rounds) ────────────────────────────────
    // Reuse playerHistory (already built for streak computation)
    let highestWinRate: HallOfFame['highestWinRate'] = null;
    const winRates: Array<{ playerName: string; winRate: number }> = [];
    for (const [playerName, history] of playerHistory) {
      if (history.length < 5) {
        continue;
      }
      const wins = history.filter((h) => h.won).length;
      const winRate = Math.round((wins / history.length) * 1000) / 10;
      winRates.push({ playerName, winRate });
    }
    if (winRates.length > 0) {
      const maxRate = Math.max(...winRates.map((p) => p.winRate));
      highestWinRate = {
        winRate: maxRate,
        holders: winRates
          .filter((p) => p.winRate === maxRate)
          .map(({ playerName }) => ({ playerName })),
      };
    }

    // ── 9. Biggest winning margin ─────────────────────────────────────────
    // For each round: winner's score minus the second-highest score
    let biggestWinningMargin: HallOfFame['biggestWinningMargin'] = null;
    let maxMargin = 0;
    const marginHolders: Array<{ playerName: string; date: string }> = [];

    for (const [date, scores] of roundsByDate) {
      if (scores.size < 2) {
        continue;
      }
      const sortedScores = [...scores.values()].sort((a, b) => b - a);
      const firstScore = sortedScores[0]!;
      const secondScore = sortedScores[1]!;
      const margin = firstScore - secondScore;

      if (margin > maxMargin) {
        maxMargin = margin;
        marginHolders.length = 0;
        for (const [playerName, score] of scores) {
          if (score === firstScore) {
            marginHolders.push({ playerName, date });
          }
        }
      } else if (margin === maxMargin && margin > 0) {
        for (const [playerName, score] of scores) {
          if (score === firstScore) {
            marginHolders.push({ playerName, date });
          }
        }
      }
    }

    if (maxMargin > 0) {
      biggestWinningMargin = { margin: maxMargin, holders: marginHolders };
    }

    return {
      highestSingleRoundScore,
      longestWinStreak,
      highestSeasonTotal,
      mostRoundsPlayed,
      highestAverageScore,
      mostRunnerUpFinishes,
      allTimePointsLeader,
      highestWinRate,
      biggestWinningMargin,
    };
  },
};
