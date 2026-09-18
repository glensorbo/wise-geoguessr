import { getResultsForYear } from './results';
import { isPlayedScore } from './scores';

import type { GameResult, Player } from './types';

const getPlayers = (results: GameResult[]): Player[] => {
  return Array.from(
    new Set(results.flatMap((result) => Object.keys(result.scores))),
  ).toSorted((a, b) => a.localeCompare(b));
};

export const getActivePlayers = (
  results: GameResult[],
  year?: number,
): Player[] => {
  const yearResults = getResultsForYear(results, year);

  return getPlayers(yearResults).filter((player) => {
    return yearResults.some((result) => isPlayedScore(result.scores[player]));
  });
};
