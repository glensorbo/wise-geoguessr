import { getActivePlayers } from './players';
import { getResultsForYear } from './results';
import { isPlayedScore } from './scores';
import { getWinners } from './winners';

import type { GameResult, Player } from './types';

export type RivalryPlayer = {
  name: Player;
  wins: number;
};

export type Rivalry = {
  playerA: RivalryPlayer;
  playerB: RivalryPlayer;
  sharedRounds: number;
  avgScoreGap: number;
};

const MIN_SHARED_ROUNDS = 3;

export const getRivalries = (
  results: GameResult[],
  year?: number,
  topN = 3,
): Rivalry[] => {
  const yearResults = getResultsForYear(results, year);
  const players = getActivePlayers(results, year);

  const rivalries: Rivalry[] = [];

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const playerA = players[i]!;
      const playerB = players[j]!;

      const sharedResults = yearResults.filter(
        (result) =>
          isPlayedScore(result.scores[playerA]) &&
          isPlayedScore(result.scores[playerB]),
      );

      if (sharedResults.length < MIN_SHARED_ROUNDS) {
        continue;
      }

      let winsA = 0;
      let winsB = 0;
      let totalGap = 0;

      for (const result of sharedResults) {
        const scoreA = result.scores[playerA]!;
        const scoreB = result.scores[playerB]!;
        totalGap += Math.abs(scoreA - scoreB);

        const winners = getWinners(result.scores);
        if (winners.includes(playerA)) {
          winsA++;
        }
        if (winners.includes(playerB)) {
          winsB++;
        }
      }

      rivalries.push({
        playerA: { name: playerA, wins: winsA },
        playerB: { name: playerB, wins: winsB },
        sharedRounds: sharedResults.length,
        avgScoreGap: Math.round(totalGap / sharedResults.length),
      });
    }
  }

  return rivalries.sort((a, b) => a.avgScoreGap - b.avgScoreGap).slice(0, topN);
};
