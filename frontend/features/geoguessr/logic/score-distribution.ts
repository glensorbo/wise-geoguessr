import { getResultsForYear } from './results';
import { isPlayedScore } from './scores';

import type { GameResult, Player, ScoreDistributionBucket } from './types';

const BUCKET_SIZE = 2500;
const MAX_SCORE = 25000;
const BUCKET_COUNT = MAX_SCORE / BUCKET_SIZE;

export const getScoreDistribution = (
  results: GameResult[],
  year: number,
  players: Player[],
): ScoreDistributionBucket[] => {
  const yearResults = getResultsForYear(results, year);

  const buckets: ScoreDistributionBucket[] = Array.from(
    { length: BUCKET_COUNT },
    (_, i) => {
      const low = i * BUCKET_SIZE;
      const high = low + BUCKET_SIZE;
      const row: ScoreDistributionBucket = {
        label: `${low.toLocaleString('en-US')}–${high.toLocaleString('en-US')}`,
      };
      for (const player of players) {
        row[player] = 0;
      }
      return row;
    },
  );

  for (const result of yearResults) {
    for (const [player, score] of Object.entries(result.scores)) {
      if (!isPlayedScore(score) || !players.includes(player)) {
        continue;
      }
      const bucketIdx = Math.min(
        Math.floor(score / BUCKET_SIZE),
        BUCKET_COUNT - 1,
      );
      const bucket = buckets[bucketIdx];
      if (bucket) {
        bucket[player] = ((bucket[player] as number) ?? 0) + 1;
      }
    }
  }

  return buckets;
};
