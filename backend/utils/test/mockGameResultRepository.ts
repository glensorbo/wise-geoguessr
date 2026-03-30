import type { gameResultRepository } from '@backend/repositories/gameResultRepository';
import type { GameResult } from '@backend/types/gameResult';

const mockData: GameResult[] = [
  {
    date: '2026-03-27',
    scores: { Glen: 15000, Thomas: 12000, Thorjan: 18000 },
  },
  {
    date: '2026-03-13',
    scores: { Glen: 16409, Thomas: 15046, Malin: 20323 },
  },
  {
    date: '2025-12-19',
    scores: { Thomas: 19075, Malin: 16642, Glen: 14050 },
  },
];

export const mockGameResultRepository: typeof gameResultRepository = {
  async getAll() {
    return mockData;
  },
  async getByYear(year: number) {
    return mockData.filter((r) => r.date.startsWith(String(year)));
  },
  async getAvailableYears() {
    return [2026, 2025];
  },
  async getByDate(date: string) {
    return mockData.find((r) => r.date === date) ?? null;
  },
  async create(date: string, scores: Record<string, number>) {
    return { date, scores };
  },
  async _fetchAndAssemble() {
    return mockData;
  },
};
