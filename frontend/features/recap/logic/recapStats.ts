import { isPlayedScore } from '@frontend/features/geoguessr/logic/scores';
import { getWinners } from '@frontend/features/geoguessr/logic/winners';

import type {
  GameResult,
  Player,
} from '@frontend/features/geoguessr/logic/types';

export type RecapStats = {
  champion: { name: string; wins: number } | null;
  mostImproved: {
    name: string;
    avgThisYear: number;
    avgLastYear: number;
    delta: number;
  } | null;
  sharpshooter: { name: string; score: number; date: string } | null;
  closestRivalry: {
    player1: string;
    player2: string;
    avgDiff: number;
    rounds: number;
  } | null;
  mostInconsistent: { name: string; stdDev: number } | null;
  longestWinStreak: { name: string; streak: number } | null;
  totalRounds: number;
};

const getAvgScore = (results: GameResult[], player: Player): number | null => {
  const scores = results
    .map((r) => r.scores[player])
    .filter((s): s is number => isPlayedScore(s));
  if (scores.length === 0) {
    return null;
  }
  return scores.reduce((a, b) => a + b, 0) / scores.length;
};

const getChampion = (results: GameResult[]): RecapStats['champion'] => {
  const wins: Record<Player, number> = {};
  for (const result of results) {
    for (const winner of getWinners(result.scores)) {
      wins[winner] = (wins[winner] ?? 0) + 1;
    }
  }
  const entries = Object.entries(wins);
  if (entries.length === 0) {
    return null;
  }
  const [name, count] = entries.reduce((best, cur) =>
    cur[1] > best[1] ? cur : best,
  );
  return { name, wins: count };
};

const getMostImproved = (
  currentResults: GameResult[],
  prevResults: GameResult[],
): RecapStats['mostImproved'] => {
  const currentPlayers = new Set(
    currentResults.flatMap((r) => Object.keys(r.scores)),
  );
  const prevPlayers = new Set(
    prevResults.flatMap((r) => Object.keys(r.scores)),
  );

  let best: RecapStats['mostImproved'] = null;

  for (const player of currentPlayers) {
    if (!prevPlayers.has(player)) {
      continue;
    }
    const avgThisYear = getAvgScore(currentResults, player);
    const avgLastYear = getAvgScore(prevResults, player);
    if (avgThisYear === null || avgLastYear === null) {
      continue;
    }
    const delta = avgThisYear - avgLastYear;
    if (delta <= 0) {
      continue;
    }
    if (best === null || delta > best.delta) {
      best = { name: player, avgThisYear, avgLastYear, delta };
    }
  }

  return best;
};

const getSharpshooter = (results: GameResult[]): RecapStats['sharpshooter'] => {
  let best: RecapStats['sharpshooter'] = null;
  for (const result of results) {
    for (const [player, score] of Object.entries(result.scores)) {
      if (!isPlayedScore(score)) {
        continue;
      }
      if (best === null || score > best.score) {
        best = { name: player, score, date: result.date };
      }
    }
  }
  return best;
};

const getClosestRivalry = (
  results: GameResult[],
): RecapStats['closestRivalry'] => {
  const players = Array.from(
    new Set(results.flatMap((r) => Object.keys(r.scores))),
  ).toSorted((a, b) => a.localeCompare(b));

  let best: RecapStats['closestRivalry'] = null;

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const p1 = players[i]!;
      const p2 = players[j]!;

      const shared = results.filter(
        (r) => isPlayedScore(r.scores[p1]) && isPlayedScore(r.scores[p2]),
      );
      if (shared.length < 3) {
        continue;
      }

      const totalGap = shared.reduce(
        (sum, r) => sum + Math.abs(r.scores[p1]! - r.scores[p2]!),
        0,
      );
      const avgDiff = Math.round(totalGap / shared.length);

      if (best === null || avgDiff < best.avgDiff) {
        best = { player1: p1, player2: p2, avgDiff, rounds: shared.length };
      }
    }
  }

  return best;
};

const getMostInconsistent = (
  results: GameResult[],
): RecapStats['mostInconsistent'] => {
  const playerScores: Record<Player, number[]> = {};

  for (const result of results) {
    for (const [player, score] of Object.entries(result.scores)) {
      if (!isPlayedScore(score)) {
        continue;
      }
      playerScores[player] ??= [];
      playerScores[player]!.push(score);
    }
  }

  let best: RecapStats['mostInconsistent'] = null;

  for (const [player, scores] of Object.entries(playerScores)) {
    if (scores.length < 3) {
      continue;
    }
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance =
      scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    if (best === null || stdDev > best.stdDev) {
      best = { name: player, stdDev };
    }
  }

  return best;
};

const getLongestWinStreak = (
  results: GameResult[],
): RecapStats['longestWinStreak'] => {
  const sorted = [...results].sort((a, b) => a.date.localeCompare(b.date));
  const players = new Set(sorted.flatMap((r) => Object.keys(r.scores)));

  let best: RecapStats['longestWinStreak'] = null;

  for (const player of players) {
    let streak = 0;
    let maxStreak = 0;

    for (const result of sorted) {
      if (!isPlayedScore(result.scores[player])) {
        continue;
      }
      const winners = getWinners(result.scores);
      if (winners.includes(player)) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 0;
      }
    }

    if (maxStreak > 0 && (best === null || maxStreak > best.streak)) {
      best = { name: player, streak: maxStreak };
    }
  }

  return best;
};

export const getRecapStats = (
  currentResults: GameResult[],
  prevResults: GameResult[],
): RecapStats => ({
  champion: getChampion(currentResults),
  mostImproved: getMostImproved(currentResults, prevResults),
  sharpshooter: getSharpshooter(currentResults),
  closestRivalry: getClosestRivalry(currentResults),
  mostInconsistent: getMostInconsistent(currentResults),
  longestWinStreak: getLongestWinStreak(currentResults),
  totalRounds: currentResults.length,
});
