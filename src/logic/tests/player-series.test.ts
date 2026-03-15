import { expect, test } from 'bun:test';

import { getPlayerData } from '../player-series';

import type { GameResult } from '../types';

const results: GameResult[] = [
  {
    date: '2026-01-10',
    scores: {
      Eirik: 0,
      Glen: 10,
      Thomas: 5,
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
];

test('getPlayerData filters by year and pads missing scores with zeros for active players', () => {
  expect(getPlayerData(results, 2026)).toEqual([
    {
      date: '2026-01-10',
      Glen: 10,
      Malin: 0,
      Thomas: 5,
      winners: ['Glen'],
    },
    {
      date: '2026-01-17',
      Glen: 0,
      Malin: 15,
      Thomas: 20,
      winners: ['Thomas'],
    },
    {
      date: '2026-01-24',
      Glen: 12,
      Malin: 8,
      Thomas: 12,
      winners: ['Glen', 'Thomas'],
    },
  ]);
});
