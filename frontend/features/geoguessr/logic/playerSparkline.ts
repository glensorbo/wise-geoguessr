import { isPlayedScore } from './scores';

import type { GameResult } from './types';

export const getPlayerSparklineData = (
  results: GameResult[],
  player: string,
  limit = 5,
): number[] => {
  return results
    .filter((r) => isPlayedScore(r.scores[player]))
    .toSorted((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-limit)
    .map((r) => r.scores[player] as number);
};
