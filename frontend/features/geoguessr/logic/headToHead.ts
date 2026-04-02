import { getResultsForYear } from './results';
import { isPlayedScore } from './scores';
import { getWinners } from './winners';

import type { GameResult } from './types';

type HeadToHeadEntry = {
  date: string;
  roundId: string;
  scoreA: number;
  scoreB: number;
  /** True when playerA had the highest score this round (ties count). */
  winnerA: boolean;
  /** True when playerB had the highest score this round (ties count). */
  winnerB: boolean;
};

type HeadToHeadData = {
  playerA: string;
  playerB: string;
  sharedRounds: number;
  /** Rounds where playerA had the top score (ties count for both). */
  winsA: number;
  /** Rounds where playerB had the top score (ties count for both). */
  winsB: number;
  entries: HeadToHeadEntry[];
};

export const getHeadToHead = (
  results: GameResult[],
  playerA: string,
  playerB: string,
  year?: number,
): HeadToHeadData => {
  const yearResults = getResultsForYear(results, year);

  const sharedResults = yearResults
    .filter(
      (r) =>
        isPlayedScore(r.scores[playerA]) && isPlayedScore(r.scores[playerB]),
    )
    .toSorted(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

  let winsA = 0;
  let winsB = 0;

  const entries: HeadToHeadEntry[] = sharedResults.map((result) => {
    const scoreA = result.scores[playerA]!;
    const scoreB = result.scores[playerB]!;
    const winners = getWinners(result.scores);
    const winnerA = winners.includes(playerA);
    const winnerB = winners.includes(playerB);

    if (winnerA) {
      winsA++;
    }
    if (winnerB) {
      winsB++;
    }

    return {
      date: result.date,
      roundId: result.id,
      scoreA,
      scoreB,
      winnerA,
      winnerB,
    };
  });

  return {
    playerA,
    playerB,
    sharedRounds: sharedResults.length,
    winsA,
    winsB,
    entries,
  };
};
