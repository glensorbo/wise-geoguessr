import { getWinners } from './winners';

import type { GameResult } from './types';

export type LastRoundEntry = {
  rank: number;
  name: string;
  score: number;
  isWinner: boolean;
};

export type LastRound = {
  date: string;
  rankings: LastRoundEntry[];
};

export const getLastRound = (results: GameResult[]): LastRound | null => {
  if (results.length === 0) return null;

  const latest = [...results].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];

  const winners = getWinners(latest.scores);

  const rankings = Object.entries(latest.scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([name, score], index) => ({
      rank: index + 1,
      name,
      score,
      isWinner: winners.includes(name),
    }));

  return { date: latest.date, rankings };
};
