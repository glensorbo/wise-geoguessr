import { describe, expect, test } from 'bun:test';

import { getHeadToHead } from '../headToHead';

import type { GameResult } from '../types';

const make = (date: string, scores: Record<string, number>): GameResult => ({
  id: date,
  date,
  gameLink: null,
  scores,
});

const A = 'Alice';
const B = 'Bob';
const C = 'Carol';
const year = 2025;

describe('getHeadToHead', () => {
  describe('shared rounds', () => {
    test('returns 0 shared rounds when no overlap', () => {
      const results = [
        make(`${year}-01-01`, { [A]: 4000, [C]: 3500 }),
        make(`${year}-01-08`, { [B]: 4000, [C]: 3500 }),
      ];
      const data = getHeadToHead(results, A, B, year);
      expect(data.sharedRounds).toBe(0);
      expect(data.entries).toHaveLength(0);
    });

    test('only counts rounds where both players have a positive score', () => {
      const results = [
        make(`${year}-01-01`, { [A]: 4000, [B]: 0 }),
        make(`${year}-01-08`, { [A]: 4000, [B]: 3800 }),
        make(`${year}-01-15`, { [A]: 4200, [B]: 4100 }),
      ];
      const data = getHeadToHead(results, A, B, year);
      expect(data.sharedRounds).toBe(2);
    });

    test('entries are sorted by date ascending', () => {
      const results = [
        make(`${year}-03-01`, { [A]: 4000, [B]: 3800 }),
        make(`${year}-01-01`, { [A]: 4200, [B]: 4100 }),
        make(`${year}-02-01`, { [A]: 3500, [B]: 3600 }),
      ];
      const { entries } = getHeadToHead(results, A, B, year);
      expect(entries.map((e) => e.date)).toEqual([
        `${year}-01-01`,
        `${year}-02-01`,
        `${year}-03-01`,
      ]);
    });
  });

  describe('win counting', () => {
    test('counts wins correctly', () => {
      const results = [
        make(`${year}-01-01`, { [A]: 5000, [B]: 3000 }), // A wins
        make(`${year}-01-08`, { [A]: 3000, [B]: 5000 }), // B wins
        make(`${year}-01-15`, { [A]: 4000, [B]: 3500 }), // A wins
      ];
      const data = getHeadToHead(results, A, B, year);
      expect(data.winsA).toBe(2);
      expect(data.winsB).toBe(1);
    });

    test('both players win a tied round', () => {
      const results = [
        make(`${year}-01-01`, { [A]: 4000, [B]: 4000 }), // tie
        make(`${year}-01-08`, { [A]: 4000, [B]: 3500 }), // A wins
        make(`${year}-01-15`, { [A]: 3500, [B]: 4000 }), // B wins
      ];
      const data = getHeadToHead(results, A, B, year);
      expect(data.winsA).toBe(2); // tie + outright
      expect(data.winsB).toBe(2); // tie + outright
    });

    test('entry.winnerA and entry.winnerB reflect per-round outcome', () => {
      const results = [
        make(`${year}-01-01`, { [A]: 5000, [B]: 3000 }),
        make(`${year}-01-08`, { [A]: 3000, [B]: 5000 }),
      ];
      const { entries } = getHeadToHead(results, A, B, year);
      expect(entries[0]).toMatchObject({ winnerA: true, winnerB: false });
      expect(entries[1]).toMatchObject({ winnerA: false, winnerB: true });
    });

    test('win is determined by round-wide highest score, not just vs each other', () => {
      // Carol beats both — neither A nor B wins
      const results = [
        make(`${year}-01-01`, { [A]: 4000, [B]: 3800, [C]: 5000 }),
        make(`${year}-01-08`, { [A]: 4000, [B]: 3800, [C]: 5000 }),
        make(`${year}-01-15`, { [A]: 4000, [B]: 3800, [C]: 5000 }),
      ];
      const data = getHeadToHead(results, A, B, year);
      expect(data.winsA).toBe(0);
      expect(data.winsB).toBe(0);
    });
  });

  describe('year filter', () => {
    test('only includes rounds from the specified year', () => {
      const results = [
        make('2024-06-01', { [A]: 4000, [B]: 3800 }),
        make('2024-06-08', { [A]: 4200, [B]: 4100 }),
        make(`${year}-01-01`, { [A]: 4000, [B]: 3800 }),
      ];
      const data = getHeadToHead(results, A, B, year);
      expect(data.sharedRounds).toBe(1);
    });
  });

  describe('scores in entries', () => {
    test('entry contains correct scores for each player', () => {
      const results = [
        make(`${year}-01-01`, { [A]: 4567, [B]: 3210 }),
        make(`${year}-01-08`, { [A]: 4567, [B]: 3210 }),
        make(`${year}-01-15`, { [A]: 4567, [B]: 3210 }),
      ];
      const { entries } = getHeadToHead(results, A, B, year);
      expect(entries[0]).toMatchObject({ scoreA: 4567, scoreB: 3210 });
    });

    test('roundId is set on each entry', () => {
      const results = [
        make(`${year}-01-01`, { [A]: 4000, [B]: 3800 }),
        make(`${year}-01-08`, { [A]: 4200, [B]: 4100 }),
        make(`${year}-01-15`, { [A]: 4200, [B]: 4100 }),
      ];
      const { entries } = getHeadToHead(results, A, B, year);
      expect(entries.every((e) => typeof e.roundId === 'string')).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('returns empty data for empty results', () => {
      const data = getHeadToHead([], A, B, year);
      expect(data.sharedRounds).toBe(0);
      expect(data.winsA).toBe(0);
      expect(data.winsB).toBe(0);
      expect(data.entries).toHaveLength(0);
    });

    test('works when playerA and playerB are the same string (no shared rounds with themselves)', () => {
      const results = [
        make(`${year}-01-01`, { [A]: 4000 }),
        make(`${year}-01-08`, { [A]: 4200 }),
        make(`${year}-01-15`, { [A]: 4200 }),
      ];
      // Single-player round: both "A vs A" counts as shared but both win every round
      const data = getHeadToHead(results, A, A, year);
      expect(data.winsA).toBe(3);
      expect(data.winsB).toBe(3);
    });
  });
});
