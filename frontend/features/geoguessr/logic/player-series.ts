import { getActivePlayers } from './players';
import { getResultsForYear } from './results';
import { getWinners } from './winners';

import type { GameResult, PlayerSeriesRow } from './types';

export const getPlayerData = (
  results: GameResult[],
  year?: number,
): PlayerSeriesRow[] => {
  const yearResults = getResultsForYear(results, year);
  const players = getActivePlayers(results, year);
  const zeroScores = Object.fromEntries(players.map((player) => [player, 0]));

  return yearResults.map((result) => ({
    ...zeroScores,
    ...Object.fromEntries(
      players.map((player) => [player, result.scores[player] ?? 0]),
    ),
    date: result.date,
    winners: getWinners(result.scores),
  }));
};
