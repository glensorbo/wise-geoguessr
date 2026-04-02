import { describe, expect, test } from 'bun:test';

import { getRivalries } from '../rivalries';

import type { GameResult } from '../types';

const makeResult = (
  date: string,
  scores: Record<string, number>,
): GameResult => ({
  id: date,
  date,
  scores,
});

const glen = 'Glen';
const anna = 'Anna';
const bob = 'Bob';

const year = 2025;

describe('getRivalries', () => {
  describe('minimum shared rounds', () => {
    test('excludes pairs with fewer than 3 shared rounds', () => {
      const results = [
        makeResult(`${year}-01-01`, { [glen]: 4000, [anna]: 3800 }),
        makeResult(`${year}-01-08`, { [glen]: 3500, [anna]: 3600 }),
      ];
      expect(getRivalries(results, year)).toHaveLength(0);
    });

    test('includes pairs with exactly 3 shared rounds', () => {
      const results = [
        makeResult(`${year}-01-01`, { [glen]: 4000, [anna]: 3800 }),
        makeResult(`${year}-01-08`, { [glen]: 3500, [anna]: 3600 }),
        makeResult(`${year}-01-15`, { [glen]: 4200, [anna]: 4100 }),
      ];
      expect(getRivalries(results, year)).toHaveLength(1);
    });

    test('does not count rounds where a player scored 0', () => {
      const results = [
        makeResult(`${year}-01-01`, { [glen]: 4000, [anna]: 0 }),
        makeResult(`${year}-01-08`, { [glen]: 3500, [anna]: 3600 }),
        makeResult(`${year}-01-15`, { [glen]: 4200, [anna]: 4100 }),
      ];
      // Only 2 real shared rounds — should not appear
      expect(getRivalries(results, year)).toHaveLength(0);
    });
  });

  describe('avgScoreGap', () => {
    test('calculates the mean absolute score difference', () => {
      const results = [
        makeResult(`${year}-01-01`, { [glen]: 5000, [anna]: 4800 }), // gap 200
        makeResult(`${year}-01-08`, { [glen]: 4000, [anna]: 4500 }), // gap 500
        makeResult(`${year}-01-15`, { [glen]: 3000, [anna]: 2700 }), // gap 300
      ];
      const [rivalry] = getRivalries(results, year);
      expect(rivalry?.avgScoreGap).toBe(333); // (200 + 500 + 300) / 3 = 333.33 → 333
    });
  });

  describe('head-to-head record', () => {
    test('counts wins correctly for each player', () => {
      const results = [
        makeResult(`${year}-01-01`, { [glen]: 5000, [anna]: 3000 }), // Glen wins
        makeResult(`${year}-01-08`, { [glen]: 3000, [anna]: 5000 }), // Anna wins
        makeResult(`${year}-01-15`, { [glen]: 4000, [anna]: 4000 }), // Tie — both win
      ];
      const [rivalry] = getRivalries(results, year);
      expect(rivalry?.playerA.wins).toBe(2); // Glen: round 1 + tie
      expect(rivalry?.playerB.wins).toBe(2); // Anna: round 2 + tie
    });

    test('playerA is alphabetically first', () => {
      const results = [
        makeResult(`${year}-01-01`, { [glen]: 4000, [anna]: 3800 }),
        makeResult(`${year}-01-08`, { [glen]: 3500, [anna]: 3600 }),
        makeResult(`${year}-01-15`, { [glen]: 4200, [anna]: 4100 }),
      ];
      const [rivalry] = getRivalries(results, year);
      // 'Anna' < 'Glen' alphabetically
      expect(rivalry?.playerA.name).toBe(anna);
      expect(rivalry?.playerB.name).toBe(glen);
    });
  });

  describe('sorting and topN', () => {
    test('sorts by lowest average gap first (closest rivalry first)', () => {
      const results = [
        // Glen vs Anna: gap 100 each round (very close)
        makeResult(`${year}-01-01`, {
          [glen]: 4000,
          [anna]: 3900,
          [bob]: 1000,
        }),
        makeResult(`${year}-01-08`, {
          [glen]: 3500,
          [anna]: 3400,
          [bob]: 1000,
        }),
        makeResult(`${year}-01-15`, {
          [glen]: 4200,
          [anna]: 4100,
          [bob]: 1000,
        }),
        // Glen vs Bob: huge gaps
        makeResult(`${year}-02-01`, { [glen]: 4000, [bob]: 1000 }),
        makeResult(`${year}-02-08`, { [glen]: 3500, [bob]: 800 }),
        makeResult(`${year}-02-15`, { [glen]: 4200, [bob]: 900 }),
      ];
      const rivalries = getRivalries(results, year);
      expect(
        rivalries[0]?.playerA.name === anna ||
          rivalries[0]?.playerB.name === anna,
      ).toBe(true);
      expect(rivalries[0]?.avgScoreGap).toBeLessThan(
        rivalries[1]?.avgScoreGap ?? Infinity,
      );
    });

    test('limits results to topN (default 3)', () => {
      const players = ['Alice', 'Bob', 'Carol', 'Dave'];
      const scores: Record<string, number> = {};
      players.forEach((p) => (scores[p] = 4000));
      const results = Array.from({ length: 5 }, (_, i) =>
        makeResult(`${year}-01-${String(i + 1).padStart(2, '0')}`, {
          ...scores,
        }),
      );
      const rivalries = getRivalries(results, year);
      expect(rivalries.length).toBeLessThanOrEqual(3);
    });

    test('respects a custom topN', () => {
      const players = ['Alice', 'Bob', 'Carol', 'Dave'];
      const scores: Record<string, number> = {};
      players.forEach((p) => (scores[p] = 4000));
      const results = Array.from({ length: 5 }, (_, i) =>
        makeResult(`${year}-01-${String(i + 1).padStart(2, '0')}`, {
          ...scores,
        }),
      );
      expect(getRivalries(results, year, 1)).toHaveLength(1);
      expect(getRivalries(results, year, 5)).toHaveLength(5); // 4 players = 6 pairs, capped at 5
    });
  });

  describe('empty / edge cases', () => {
    test('returns empty array for no results', () => {
      expect(getRivalries([], year)).toEqual([]);
    });

    test('returns empty array for single player', () => {
      const results = [
        makeResult(`${year}-01-01`, { [glen]: 4000 }),
        makeResult(`${year}-01-08`, { [glen]: 3500 }),
        makeResult(`${year}-01-15`, { [glen]: 4200 }),
      ];
      expect(getRivalries(results, year)).toEqual([]);
    });

    test('filters to the requested year only', () => {
      const results = [
        makeResult('2024-01-01', { [glen]: 4000, [anna]: 3800 }),
        makeResult('2024-01-08', { [glen]: 3500, [anna]: 3600 }),
        makeResult('2024-01-15', { [glen]: 4200, [anna]: 4100 }),
        // 2025 has only 2 shared rounds — below threshold
        makeResult(`${year}-06-01`, { [glen]: 4000, [anna]: 3900 }),
        makeResult(`${year}-06-08`, { [glen]: 3500, [anna]: 3400 }),
      ];
      expect(getRivalries(results, year)).toHaveLength(0);
      expect(getRivalries(results, 2024)).toHaveLength(1);
    });
  });
});
