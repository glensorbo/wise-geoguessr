import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { ReactNode } from 'react';

export const DashboardSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Paper
    sx={(theme) => ({
      p: { xs: 2.5, md: 3.5 },
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        opacity: theme.palette.mode === 'dark' ? 0.6 : 0.4,
      },
    })}
  >
    <Stack spacing={3}>
      <Typography variant="h5" component="h2" sx={{ pt: 0.25 }}>
        {title}
      </Typography>
      {children}
    </Stack>
  </Paper>
);
