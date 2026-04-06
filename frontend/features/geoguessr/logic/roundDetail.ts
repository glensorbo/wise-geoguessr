import type { PodiumEntry } from './podium';
import type { GameResult, RoundDetailData, RoundDetailEntry } from './types';

export const getRoundDetail = (
  results: GameResult[],
  roundId: string,
): RoundDetailData | null => {
  const round = results.find((r) => r.id === roundId);
  if (!round) {
    return null;
  }

  const roundYear = new Date(round.date).getFullYear();

  const priorRounds = results.filter(
    (r) => r.date < round.date && new Date(r.date).getFullYear() === roundYear,
  );

  const unsorted: RoundDetailEntry[] = Object.entries(round.scores).map(
    ([name, score]) => {
      const priorScores = priorRounds
        .filter((r) => name in r.scores)
        .map((r) => r.scores[name]!);

      const delta =
        priorScores.length > 0
          ? score -
            priorScores.reduce((sum, s) => sum + s, 0) / priorScores.length
          : null;

      return { name, score, delta, rank: 0, isWinner: false };
    },
  );

  const sorted = unsorted.toSorted(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );

  const maxScore = sorted[0]?.score ?? 0;
  let rank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]!.score < sorted[i - 1]!.score) {
      rank = i + 1;
    }
    sorted[i]!.rank = rank;
    sorted[i]!.isWinner = sorted[i]!.score === maxScore;
  }

  return {
    id: round.id,
    date: round.date,
    gameLink: round.gameLink,
    entries: sorted,
  };
};

export const getRoundPodium = (detail: RoundDetailData): PodiumEntry[] =>
  detail.entries.slice(0, 3).map((e, i) => ({
    rank: (i + 1) as 1 | 2 | 3,
    name: e.name,
    totalPoints: e.score,
  }));
