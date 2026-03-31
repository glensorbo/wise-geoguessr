import { getPlayerDetails } from './player-details';

import type { GameResult } from './types';

export type PodiumEntry = {
  rank: 1 | 2 | 3;
  name: string;
  wins: number;
  totalPoints: number;
};

export const getPodium = (
  results: GameResult[],
  year?: number,
): PodiumEntry[] =>
  getPlayerDetails(results, year)
    .details.filter((d) => d.played > 0)
    .slice(0, 3)
    .map((player, i) => ({
      rank: (i + 1) as 1 | 2 | 3,
      name: player.name,
      wins: player.won,
      totalPoints: player.points.at(-1)?.total ?? 0,
    }));
