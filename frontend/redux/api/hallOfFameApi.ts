import { baseApi } from './baseApi';

import type { ApiSuccessResponse } from '@backend/types/apiSuccessResponse';
import type { HallOfFame } from '@backend/types/hallOfFame';

const hallOfFameApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getHallOfFame: build.query<HallOfFame, void>({
      query: () => ({ url: '/hall-of-fame', method: 'GET' }),
      transformResponse: (res: ApiSuccessResponse<HallOfFame>) => res.data,
      providesTags: ['HallOfFame'],
    }),
  }),
});

export const { useGetHallOfFameQuery } = hallOfFameApi;
