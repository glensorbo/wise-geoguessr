import { getResultsForYear } from './results';
import { isPlayedScore } from './scores';
import { getWinners } from './winners';

import type { GameResult } from './types';

type PlayerStats = {
  roundsPlayed: number;
  wins: number;
  winPercentage: number;
  personalBest: number | null;
  currentStreak: number;
};

type RankPoint = {
  date: string;
  rank: number;
};

export const getPlayerStats = (
  results: GameResult[],
  playerName: string,
): PlayerStats => {
  const sorted = results.toSorted((a, b) => a.date.localeCompare(b.date));

  let roundsPlayed = 0;
  let wins = 0;
  let personalBest: number | null = null;
  let streak = 0;

  for (const result of sorted) {
    const score = result.scores[playerName];
    if (!isPlayedScore(score)) {
      continue;
    }

    roundsPlayed++;

    if (personalBest === null || score > personalBest) {
      personalBest = score;
    }

    if (getWinners(result.scores).includes(playerName)) {
      wins++;
      streak++;
    } else {
      streak = 0;
    }
  }

  const winPercentage =
    roundsPlayed > 0 ? Math.round((wins / roundsPlayed) * 1000) / 10 : 0;

  return {
    roundsPlayed,
    wins,
    winPercentage,
    personalBest,
    currentStreak: streak,
  };
};

export const getPlayerRankHistory = (
  results: GameResult[],
  playerName: string,
  year: number,
): RankPoint[] => {
  const yearResults = getResultsForYear(results, year).toSorted((a, b) =>
    a.date.localeCompare(b.date),
  );

  if (yearResults.length === 0) {
    return [];
  }

  const allPlayers = Array.from(
    new Set(yearResults.flatMap((r) => Object.keys(r.scores))),
  );

  const cumPoints: Record<string, number> = Object.fromEntries(
    allPlayers.map((p) => [p, 0]),
  );

  const rankHistory: RankPoint[] = [];

  for (const result of yearResults) {
    for (const [p, score] of Object.entries(result.scores)) {
      if (isPlayedScore(score)) {
        cumPoints[p] = (cumPoints[p] ?? 0) + score;
      }
    }

    if (!isPlayedScore(result.scores[playerName])) {
      continue;
    }

    const sorted = Object.values(cumPoints).toSorted((a, b) => b - a);
    const playerPoints = cumPoints[playerName] ?? 0;
    const rank = sorted.indexOf(playerPoints) + 1;

    rankHistory.push({ date: result.date, rank });
  }

  return rankHistory;
};
