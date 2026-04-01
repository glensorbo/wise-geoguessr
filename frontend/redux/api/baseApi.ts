import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { clearToken, setToken } from '@frontend/features/login/state/authSlice';

import type { ApiErrorResponse } from '@backend/types/apiErrorResponse';
import type { ApiSuccessResponse } from '@backend/types/apiSuccessResponse';
import type { RootState } from '@frontend/redux/store';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Wraps fetchBaseQuery and narrows the error type to ApiErrorResponse.
 */
const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ApiErrorResponse
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const fetchError = result.error as FetchBaseQueryError;
    return { error: fetchError.data as ApiErrorResponse };
  }

  return result;
};

/**
 * Simple async lock to prevent concurrent refresh storms.
 * If multiple requests fail with 401 simultaneously, only the first one
 * triggers a refresh — the rest wait and then retry with the new token.
 */
let refreshPromise: Promise<boolean> | null = null;

/**
 * Wraps baseQuery with automatic token refresh on 401 responses.
 *
 * Flow:
 *  1. Make the request.
 *  2. If 401 → call POST /api/auth/refresh (sends the HttpOnly cookie automatically).
 *  3. On success → store the new access token in Redux and retry the original request.
 *  4. On failure → clear the token so the user is sent to login.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ApiErrorResponse
> = async (args, api, extraOptions) => {
  // If a refresh is already in flight, wait for it before making the request.
  // This avoids using a stale token while another request is refreshing.
  if (refreshPromise) {
    const refreshed = await refreshPromise;
    if (!refreshed) {
      return {
        error: {
          message: 'Session expired',
          status: 401,
          error: { type: 'unauthorized', errors: [] },
        } satisfies ApiErrorResponse,
      };
    }
    return baseQuery(args, api, extraOptions);
  }

  let result = await baseQuery(args, api, extraOptions);

  const isUnauthorized =
    result.error &&
    (result.error as ApiErrorResponse).error?.type === 'unauthorized';

  if (isUnauthorized) {
    // Kick off refresh and share the promise so concurrent callers wait
    refreshPromise = (async () => {
      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const data = refreshResult.data as ApiSuccessResponse<{
          token: string;
        }>;
        api.dispatch(setToken(data.data.token));
        return true;
      }

      api.dispatch(clearToken());
      return false;
    })().finally(() => {
      refreshPromise = null;
    });

    const refreshed = await refreshPromise;
    if (refreshed) {
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['GameResults', 'GameResultYears', 'HallOfFame'],
  endpoints: () => ({}),
});
