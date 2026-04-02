import { baseApi } from './baseApi';

import type { ApiSuccessResponse } from '@backend/types/apiSuccessResponse';
import type { GameResult } from '@backend/types/gameResult';

const gameResultApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getYears: build.query<number[], void>({
      query: () => ({ url: '/results/years', method: 'GET' }),
      transformResponse: (res: ApiSuccessResponse<number[]>) => res.data,
      providesTags: ['GameResultYears'],
    }),

    getResults: build.query<GameResult[], number | undefined>({
      query: (year) => ({
        url: year !== undefined ? `/results?year=${year}` : '/results',
        method: 'GET',
      }),
      transformResponse: (res: ApiSuccessResponse<GameResult[]>) => res.data,
      providesTags: (_, __, year) => [
        { type: 'GameResults', id: year ?? 'ALL' },
      ],
    }),

    getRoundById: build.query<GameResult, string>({
      query: (id) => ({ url: `/results/${id}`, method: 'GET' }),
      transformResponse: (res: ApiSuccessResponse<GameResult>) => res.data,
      providesTags: (_, __, id) => [{ type: 'GameResults', id }],
    }),

    addResult: build.mutation<
      GameResult,
      { date: string; scores: Record<string, number> }
    >({
      query: (body) => ({ url: '/results', method: 'POST', body }),
      transformResponse: (res: ApiSuccessResponse<GameResult>) => res.data,
      invalidatesTags: (result) => [
        'GameResultYears',
        {
          type: 'GameResults',
          id: result ? Number(result.date.slice(0, 4)) : 'ALL',
        },
      ],
    }),
  }),
});

export const {
  useGetYearsQuery,
  useGetResultsQuery,
  useGetRoundByIdQuery,
  useAddResultMutation,
} = gameResultApi;
