import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';

import { selectIsAuthenticated } from '@frontend/features/login/state/authSlice';

import type { RootState } from '@frontend/redux/store';

export const ProtectedRoute = () => {
  const isAuthenticated = useSelector((state: RootState) =>
    selectIsAuthenticated(state),
  );
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};
