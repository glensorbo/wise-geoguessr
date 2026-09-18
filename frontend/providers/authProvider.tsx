import { decodeJwt } from 'jose';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { clearToken, setToken } from '@frontend/features/login/state/authSlice';

import type { ApiSuccessResponse } from '@backend/types/apiSuccessResponse';
import type { AppDispatch, RootState } from '@frontend/redux/store';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

/**
 * Validates the stored JWT on mount and whenever it changes.
 *
 * - If the token is valid and not yet expired: do nothing.
 * - If the token is expired (or malformed): attempt a silent refresh via the
 *   HttpOnly refresh token cookie. On success the new access token replaces
 *   the old one in Redux. On failure the token is cleared and the user is
 *   redirected to login by the app's protected-route layer.
 */
export const AuthProvider = ({ children }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const hasAttemptedRefresh = useRef(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let expired = false;
    try {
      const { exp } = decodeJwt(token);
      expired = exp !== undefined && Date.now() / 1000 > exp;
    } catch {
      expired = true;
    }

    if (!expired) {
      return;
    }

    // Token is expired — attempt a silent refresh using the HttpOnly cookie.
    // Guard with a ref so we only try once per mount, not on every render.
    if (hasAttemptedRefresh.current) {
      dispatch(clearToken());
      return;
    }

    hasAttemptedRefresh.current = true;

    void (async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'same-origin',
        });
        if (!res.ok) {
          dispatch(clearToken());
          return;
        }
        const body = (await res.json()) as ApiSuccessResponse<{
          token: string;
        }>;
        dispatch(setToken(body.data.token));
      } catch {
        dispatch(clearToken());
      }
    })();
  }, [token, dispatch]);

  return <>{children}</>;
};
