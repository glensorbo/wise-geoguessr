import { expect, test } from 'bun:test';

import { filterResultsByYear, getAvailableYears, parseYearParam } from './data';

import type { GameResult } from '../src/logic';

const results: GameResult[] = [
  { date: '2026-01-10', scores: { Glen: 10 } },
  { date: '2025-12-20', scores: { Thomas: 20 } },
  { date: '2026-02-01', scores: { Malin: 30 } },
];

test('filterResultsByYear returns only matching rows', () => {
  expect(filterResultsByYear(results, 2026)).toEqual([
    { date: '2026-01-10', scores: { Glen: 10 } },
    { date: '2026-02-01', scores: { Malin: 30 } },
  ]);
});

test('getAvailableYears returns unique years in descending order', () => {
  expect(getAvailableYears(results)).toEqual([2026, 2025]);
});

test('parseYearParam accepts YYYY and rejects invalid values', () => {
  expect(parseYearParam('2026')).toBe(2026);
  expect(parseYearParam('26')).toBeNull();
  expect(parseYearParam('abcd')).toBeNull();
  expect(parseYearParam(null)).toBeNull();
});
