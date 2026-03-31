import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';

import { getCurrentYear } from '../logic';
import {
  useGetResultsQuery,
  useGetYearsQuery,
} from '@frontend/redux/api/gameResultApi';

import type { GameResult } from '../logic/types';

const currentYear = getCurrentYear();

export const useResults = () => {
  const { data: availableYears = [], isLoading: yearsLoading } =
    useGetYearsQuery();

  const [searchParams, setSearchParams] = useSearchParams();
  const yearParam = Number(searchParams.get('year'));
  const year = yearParam > 2000 ? yearParam : currentYear;

  const setYear = (newYear: number) => {
    setSearchParams({ year: String(newYear) }, { replace: true });
  };

  const {
    data: freshResults,
    isFetching: resultsFetching,
    error,
  } = useGetResultsQuery(year);

  const previousResultsRef = useRef<GameResult[]>([]);
  if (freshResults !== undefined) {
    previousResultsRef.current = freshResults;
  }
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
