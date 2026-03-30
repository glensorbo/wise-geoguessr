import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

import { LoginForm } from '@frontend/features/login/components/loginForm';
import { selectIsAuthenticated } from '@frontend/features/login/state/authSlice';

import type { RootState } from '@frontend/redux/store';

export const LoginPage = () => {
  const isAuthenticated = useSelector((state: RootState) =>
    selectIsAuthenticated(state),
  );

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 440, p: 1 }}>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </Box>
  );
};
