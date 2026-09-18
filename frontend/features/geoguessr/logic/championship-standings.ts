import { getActivePlayers } from './players';
import { getResultsForYear } from './results';
import { isPlayedScore } from './scores';

import type { GameResult } from './types';

type ChampionshipStandingsRow = Record<string, string | number | null>;

export const getChampionshipStandings = (
  results: GameResult[],
  year?: number,
): ChampionshipStandingsRow[] => {
  const yearResults = getResultsForYear(results, year).toSorted((a, b) =>
    a.date.localeCompare(b.date),
  );

  if (yearResults.length === 0) {
    return [];
  }

  const players = getActivePlayers(results, year);

  const cumPoints: Record<string, number> = Object.fromEntries(
    players.map((p) => [p, 0]),
  );
  const hasPlayed: Record<string, boolean> = Object.fromEntries(
    players.map((p) => [p, false]),
  );

  const standings: ChampionshipStandingsRow[] = [];

  for (const result of yearResults) {
    for (const [player, score] of Object.entries(result.scores)) {
      if (isPlayedScore(score)) {
        cumPoints[player] = (cumPoints[player] ?? 0) + score;
        hasPlayed[player] = true;
      }
    }

    const sortedPoints = Object.values(cumPoints).toSorted((a, b) => b - a);

    const row: ChampionshipStandingsRow = { date: result.date };
    for (const player of players) {
      if (!hasPlayed[player]) {
        row[player] = null;
      } else {
        const playerPoints = cumPoints[player] ?? 0;
        row[player] = sortedPoints.indexOf(playerPoints) + 1;
      }
    }

    standings.push(row);
  }

  return standings;
};
