import { expect, test } from 'bun:test';

import { getPerPlayedRoundDetails } from '../per-played-round-details';

import type { GameResult } from '../types';

const results: GameResult[] = [
  {
    date: '2026-01-10',
    scores: {
      Glen: 10,
      Thomas: 5,
      Malin: 0,
    },
  },
  {
    date: '2026-01-17',
    scores: {
      Thomas: 20,
      Malin: 15,
    },
  },
];

test('getPerPlayedRoundDetails only averages rounds where a player actually scored', () => {
  expect(getPerPlayedRoundDetails(results, 2026)).toEqual([
    { name: 'Malin', pointsPerPlayed: 15, roundsPlayed: 1, totalPoints: 15 },
    { name: 'Thomas', pointsPerPlayed: 13, roundsPlayed: 2, totalPoints: 25 },
    { name: 'Glen', pointsPerPlayed: 10, roundsPlayed: 1, totalPoints: 10 },
  ]);
});
