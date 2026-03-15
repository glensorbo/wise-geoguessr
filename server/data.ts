import type { GameResult } from '../src/logic';

const dataFile = new URL('./data/data.json', import.meta.url);

const getResultYear = (result: GameResult) => {
  return Number.parseInt(result.date.slice(0, 4), 10);
};

export const filterResultsByYear = (results: GameResult[], year: number) => {
  return results.filter((result) => getResultYear(result) === year);
};

export const getAvailableYears = (results: GameResult[]) => {
  return Array.from(new Set(results.map(getResultYear))).toSorted(
    (a, b) => b - a,
  );
};

export const parseYearParam = (value: string | null) => {
  if (value == null) {
    return null;
  }

  if (!/^\d{4}$/.test(value)) {
    return null;
  }

  return Number.parseInt(value, 10);
};

export const loadResults = async (): Promise<GameResult[]> => {
  return (await Bun.file(dataFile).json()) as GameResult[];
};
