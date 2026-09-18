import { useMemo } from 'react';

import { getRecapStats } from '../logic/recapStats';
import { useGetResultsQuery } from '@frontend/redux/api/gameResultApi';

export const useRecap = (year: number) => {
  const { data: currentResults = [], isFetching: currentLoading } =
    useGetResultsQuery(year);
  const { data: prevResults = [], isFetching: prevLoading } =
    useGetResultsQuery(year - 1);

  const stats = useMemo(
    () => getRecapStats(currentResults, prevResults),
    [currentResults, prevResults],
  );

  const isLoading = currentLoading || prevLoading;
  const hasData = currentResults.length > 0;

  return { stats, isLoading, hasData };
};
