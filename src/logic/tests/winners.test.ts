import { expect, test } from 'bun:test';

import { getWinningScore, getWinners } from '../winners';

test('getWinningScore returns the highest positive score', () => {
  expect(getWinningScore({ Glen: 12000, Thomas: 18000, Malin: 9000 })).toBe(
    18000,
  );
});

test('getWinners returns all players tied for the best score', () => {
  expect(getWinners({ Glen: 18000, Thomas: 18000, Malin: 9000 })).toEqual([
    'Glen',
    'Thomas',
  ]);
});

test('getWinners ignores zero-only rounds', () => {
  expect(getWinners({ Glen: 0, Thomas: 0 })).toEqual([]);
});
