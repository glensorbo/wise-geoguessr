import { useMemo } from 'react';
import { useParams } from 'react-router';

import { getCurrentYear } from '../logic';
import { getPlayerRankHistory, getPlayerStats } from '../logic/playerProfile';
import { useGetResultsQuery } from '@frontend/redux/api/gameResultApi';

export const usePlayerProfile = () => {
  const { name = '' } = useParams<{ name: string }>();
  const playerName = decodeURIComponent(name);

  const { data: results = [], isLoading } = useGetResultsQuery(undefined);

  const year = getCurrentYear();

  const stats = useMemo(
    () => (results.length > 0 ? getPlayerStats(results, playerName) : null),
    [results, playerName],
  );

  const rankHistory = useMemo(
    () =>
      results.length > 0 ? getPlayerRankHistory(results, playerName, year) : [],
    [results, playerName, year],
  );

  return {
    playerName,
    stats,
    rankHistory,
    year,
    isLoading,
    noData: !isLoading && (stats?.roundsPlayed ?? 0) === 0,
  };
};
