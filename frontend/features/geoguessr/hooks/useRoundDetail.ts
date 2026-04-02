import { useMemo } from 'react';
import { useParams } from 'react-router';

import { getRoundDetail, getRoundPodium } from '../logic';
import {
  useGetRoundByIdQuery,
  useGetResultsQuery,
} from '@frontend/redux/api/gameResultApi';

export const useRoundDetail = () => {
  const { roundId = '' } = useParams<{ roundId: string }>();

  const {
    data: round,
    isLoading: roundLoading,
    isError,
  } = useGetRoundByIdQuery(roundId, {
    skip: !roundId,
  });

  const year = round ? Number(round.date.slice(0, 4)) : undefined;

  const { data: results = [], isLoading: resultsLoading } = useGetResultsQuery(
    year,
    {
      skip: !year,
    },
  );

  const allResults = useMemo(() => {
    if (!round) {
      return [];
    }
    const exists = results.some((r) => r.id === round.id);
    return exists ? results : [...results, round];
  }, [results, round]);

  const detail = useMemo(
    () =>
      roundId && allResults.length > 0
        ? getRoundDetail(allResults, roundId)
        : null,
    [allResults, roundId],
  );

  const podium = useMemo(
    () => (detail ? getRoundPodium(detail) : []),
    [detail],
  );

  return {
    roundId,
    detail,
    podium,
    isLoading: roundLoading || resultsLoading,
    notFound:
      !roundLoading && (isError || (!roundLoading && !round && !!roundId)),
  };
};
