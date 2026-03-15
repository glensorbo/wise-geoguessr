import { getPlayerData } from './player-series';
import { getActivePlayers } from './players';
import { isPlayedScore } from './scores';

import type {
  CumulativePointsRow,
  GameResult,
  PlayerDetail,
  PlayerPointTotal,
} from './types';

export const getPlayerDetails = (results: GameResult[], year?: number) => {
  const players = getActivePlayers(results, year);
  const playerData = getPlayerData(results, year).toSorted(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const details = players.map(
    (name) =>
      ({
        name,
        played: 0,
        won: 0,
        points: [] as PlayerPointTotal[],
      }) satisfies PlayerDetail,
  );

  for (const row of playerData) {
    for (const detail of details) {
      const value = row[detail.name];
      const numericValue = typeof value === 'number' ? value : 0;

      if (row.winners.includes(detail.name)) {
        detail.won += 1;
      }

      if (isPlayedScore(numericValue)) {
        detail.played += 1;
      }

      const currentPoints = detail.points.at(-1)?.total ?? 0;
      detail.points.push({
        name: detail.name,
        date: row.date,
        total: currentPoints + numericValue,
      });
    }
  }

  const pointsByDate = new Map<string, CumulativePointsRow>();

  for (const detail of details) {
    for (const score of detail.points) {
      const row = pointsByDate.get(score.date) ?? { date: score.date };
      row[detail.name] = score.total;
      pointsByDate.set(score.date, row);
    }
  }

  const points = playerData.map((row) => {
    return pointsByDate.get(row.date) ?? { date: row.date };
  });

  return {
    details: details.toSorted(
      (a, b) =>
        b.won - a.won ||
        b.points.at(-1)!.total - a.points.at(-1)!.total ||
        a.name.localeCompare(b.name),
    ),
    points,
  };
};
