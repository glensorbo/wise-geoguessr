import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: 2,
      p: 4,
      textAlign: 'center',
    }}
  >
    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
      Something went wrong 😕
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480 }}>
      {(error as Error).message}
    </Typography>
    <Button variant="contained" onClick={resetErrorBoundary}>
      Try again
    </Button>
  </Box>
);

interface Props {
  children: ReactNode;
}

export const ErrorBoundary = ({ children }: Props) => (
  <ReactErrorBoundary FallbackComponent={ErrorFallback}>
    {children}
  </ReactErrorBoundary>
);
