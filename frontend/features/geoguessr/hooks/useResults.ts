import { useMemo, useRef, useState } from 'react';

import {
  useGetResultsQuery,
  useGetYearsQuery,
} from '@frontend/redux/api/gameResultApi';

import { getCurrentYear } from '../logic';

import type { GameResult } from '../logic/types';

const currentYear = getCurrentYear();

export const useResults = () => {
  const { data: availableYears = [], isLoading: yearsLoading } =
    useGetYearsQuery();
  const [year, setYear] = useState(currentYear);

  const {
    data: freshResults,
    isFetching: resultsFetching,
    error,
  } = useGetResultsQuery(year);

  const previousResultsRef = useRef<GameResult[]>([]);
  if (freshResults !== undefined) previousResultsRef.current = freshResults;
  const results = freshResults ?? previousResultsRef.current;

  const yearOptions = useMemo(
    () =>
      Array.from(new Set([currentYear, ...availableYears])).toSorted(
        (a, b) => b - a,
      ),
    [availableYears],
  );

  return {
    year,
    setYear,
    yearOptions,
    results,
    isLoading: yearsLoading || resultsFetching,
    yearsLoading,
    error,
  };
};
