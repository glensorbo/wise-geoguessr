import { expect, test } from 'bun:test';

import { getActivePlayers, getPlayers } from '../players';

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
    date: '2025-12-20',
    scores: {
      Glen: 999,
      Sigurd: 300,
    },
  },
];

test('getPlayers returns all discovered players alphabetically', () => {
  expect(getPlayers(results)).toEqual([
    'Eirik',
    'Glen',
    'Malin',
    'Sigurd',
    'Thomas',
  ]);
});

test('getActivePlayers excludes players with no positive scores in the selected year', () => {
  expect(getActivePlayers(results, 2026)).toEqual(['Glen', 'Malin', 'Thomas']);
});

test('getActivePlayers uses the selected year when determining activity', () => {
  expect(getActivePlayers(results, 2025)).toEqual(['Glen', 'Sigurd']);
});
