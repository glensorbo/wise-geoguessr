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
  bestStreak: number;
  averageScore: number | null;
  runnerUpFinishes: number;
  totalPoints: number;
};

type RankPoint = {
  date: string;
  rank: number;
};

type AccumulatedPoint = {
  date: string;
  total: number;
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
  let bestStreak = 0;
  let totalPoints = 0;
  let runnerUpFinishes = 0;

  for (const result of sorted) {
    const score = result.scores[playerName];
    if (!isPlayedScore(score)) {
      continue;
    }

    roundsPlayed++;
    totalPoints += score;

    if (personalBest === null || score > personalBest) {
      personalBest = score;
    }

    const winners = getWinners(result.scores);
    if (winners.includes(playerName)) {
      wins++;
      streak++;
      if (streak > bestStreak) {
        bestStreak = streak;
      }
    } else {
      streak = 0;

      // Runner-up: highest non-winner score in this round
      const winnerScore = Math.max(
        ...Object.values(result.scores).filter(isPlayedScore),
      );
      const sortedScores = Object.values(result.scores)
        .filter(isPlayedScore)
        .toSorted((a, b) => b - a);
      const secondScore = sortedScores.find((s) => s < winnerScore);
      if (secondScore !== undefined && score === secondScore) {
        runnerUpFinishes++;
      }
    }
  }

  const winPercentage =
    roundsPlayed > 0 ? Math.round((wins / roundsPlayed) * 1000) / 10 : 0;

  const averageScore =
    roundsPlayed > 0 ? Math.round(totalPoints / roundsPlayed) : null;

  return {
    roundsPlayed,
    wins,
    winPercentage,
    personalBest,
    currentStreak: streak,
    bestStreak,
    averageScore,
    runnerUpFinishes,
    totalPoints,
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

    const sortedPoints = Object.values(cumPoints).toSorted((a, b) => b - a);
    const playerPoints = cumPoints[playerName] ?? 0;
    const rank = sortedPoints.indexOf(playerPoints) + 1;

    rankHistory.push({ date: result.date, rank });
  }

  return rankHistory;
};

export const getPlayerAccumulatedPoints = (
  results: GameResult[],
  playerName: string,
  year: number,
): AccumulatedPoint[] => {
  const yearResults = getResultsForYear(results, year).toSorted((a, b) =>
    a.date.localeCompare(b.date),
  );

  let cumTotal = 0;
  const points: AccumulatedPoint[] = [];

  for (const result of yearResults) {
    const score = result.scores[playerName];
    if (!isPlayedScore(score)) {
      continue;
    }
    cumTotal += score;
    points.push({ date: result.date, total: cumTotal });
  }

  return points;
};
