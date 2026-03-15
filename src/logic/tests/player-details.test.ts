import { expect, test } from 'bun:test';

import { getPlayerDetails } from '../player-details';

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
  {
    date: '2026-01-24',
    scores: {
      Glen: 12,
      Thomas: 12,
      Malin: 8,
    },
  },
  {
    date: '2026-01-31',
    scores: {
      Glen: 0,
      Thomas: 0,
      Malin: 0,
    },
  },
];

test('getPlayerDetails builds cumulative points and counts co-wins deterministically', () => {
  const { details, points } = getPlayerDetails(results, 2026);

  expect(details).toEqual([
    {
      name: 'Thomas',
      played: 3,
      won: 2,
      points: [
        { name: 'Thomas', date: '2026-01-10', total: 5 },
        { name: 'Thomas', date: '2026-01-17', total: 25 },
        { name: 'Thomas', date: '2026-01-24', total: 37 },
        { name: 'Thomas', date: '2026-01-31', total: 37 },
      ],
    },
    {
      name: 'Glen',
      played: 2,
      won: 2,
      points: [
        { name: 'Glen', date: '2026-01-10', total: 10 },
        { name: 'Glen', date: '2026-01-17', total: 10 },
        { name: 'Glen', date: '2026-01-24', total: 22 },
        { name: 'Glen', date: '2026-01-31', total: 22 },
      ],
    },
    {
      name: 'Malin',
      played: 2,
      won: 0,
      points: [
        { name: 'Malin', date: '2026-01-10', total: 0 },
        { name: 'Malin', date: '2026-01-17', total: 15 },
        { name: 'Malin', date: '2026-01-24', total: 23 },
        { name: 'Malin', date: '2026-01-31', total: 23 },
      ],
    },
  ]);

  expect(points).toEqual([
    { date: '2026-01-10', Glen: 10, Thomas: 5, Malin: 0 },
    { date: '2026-01-17', Glen: 10, Thomas: 25, Malin: 15 },
    { date: '2026-01-24', Glen: 22, Thomas: 37, Malin: 23 },
    { date: '2026-01-31', Glen: 22, Thomas: 37, Malin: 23 },
  ]);
});
