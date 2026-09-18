import { useMemo } from 'react';
import { useParams } from 'react-router';

import { getCurrentYear } from '../logic';
import { getPlayerAchievements } from '../logic/achievements';
import {
  getPlayerAccumulatedPoints,
  getPlayerRankHistory,
  getPlayerStats,
} from '../logic/playerProfile';
import { useGetResultsQuery } from '@frontend/redux/api/gameResultApi';

import type { Achievement } from '../logic/achievements';

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

  const accumulatedPoints = useMemo(
    () =>
      results.length > 0
        ? getPlayerAccumulatedPoints(results, playerName, year)
        : [],
    [results, playerName, year],
  );

  const achievements: Achievement[] = useMemo(
    () =>
      results.length > 0 ? getPlayerAchievements(results, playerName) : [],
    [results, playerName],
  );

  return {
    playerName,
    stats,
    rankHistory,
    accumulatedPoints,
    achievements,
    year,
    isLoading,
    noData: !isLoading && (stats?.roundsPlayed ?? 0) === 0,
  };
};
