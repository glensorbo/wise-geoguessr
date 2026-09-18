import { getPlayerData } from './player-series';
import { getActivePlayers } from './players';
import { isPlayedScore } from './scores';

import type { GameResult, PerPlayedRoundDetail } from './types';

export const getPerPlayedRoundDetails = (
  results: GameResult[],
  year?: number,
): PerPlayedRoundDetail[] => {
  const playerData = getPlayerData(results, year);

  const details = getActivePlayers(results, year).map(
    (name) =>
      ({
        name,
        pointsPerPlayed: 0,
        roundsPlayed: 0,
        totalPoints: 0,
      }) satisfies PerPlayedRoundDetail,
  );

  for (const row of playerData) {
    for (const detail of details) {
      const points = row[detail.name];
      const numericPoints = typeof points === 'number' ? points : undefined;

      if (!isPlayedScore(numericPoints)) {
        continue;
      }

      detail.totalPoints += numericPoints;
      detail.roundsPlayed += 1;
    }
  }

  for (const detail of details) {
    if (detail.roundsPlayed === 0) {
      continue;
    }

    detail.pointsPerPlayed = Math.round(
      detail.totalPoints / detail.roundsPlayed,
    );
  }

  return details.toSorted(
    (a, b) =>
      b.pointsPerPlayed - a.pointsPerPlayed ||
      b.totalPoints - a.totalPoints ||
      a.name.localeCompare(b.name),
  );
};
