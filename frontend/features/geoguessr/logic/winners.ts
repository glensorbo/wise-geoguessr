import { isPlayedScore } from './scores';

import type { Player } from './types';

const getWinningScore = (scores: Record<Player, number>) => {
  const playedScores = Object.values(scores).filter((score) =>
    isPlayedScore(score),
  );

  if (playedScores.length === 0) {
    return undefined;
  }

  return Math.max(...playedScores);
};

export const getWinners = (scores: Record<Player, number>): Player[] => {
  const winningScore = getWinningScore(scores);

  if (winningScore === undefined) {
    return [];
  }

  return Object.entries(scores)
    .filter(([, score]) => score === winningScore)
    .map(([player]) => player)
    .toSorted((a, b) => a.localeCompare(b));
};
