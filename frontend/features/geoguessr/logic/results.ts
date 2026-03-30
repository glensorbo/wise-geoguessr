import dayjs from 'dayjs';

import type { GameResult } from './types';

export const getCurrentYear = () => dayjs().year();

export const getResultsForYear = (
  results: GameResult[],
  year = getCurrentYear(),
) => {
  return results.filter((result) => dayjs(result.date).year() === year);
};
