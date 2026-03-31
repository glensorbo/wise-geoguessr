import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { formatAxisNumber } from '../constants';

import type { PodiumEntry } from '../logic/podium';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' } as const;
const PLATFORM_HEIGHT = { 1: 80, 2: 60, 3: 40 } as const;
const PLATFORM_COLOR = {
  1: '#f59e0b',
  2: '#94a3b8',
  3: '#b45309',
} as const;

const PodiumSlot = ({ entry }: { entry: PodiumEntry }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
    }}
  >
    <Paper
      elevation={entry.rank === 1 ? 4 : 1}
      sx={{
        p: { xs: 1.5, sm: 2 },
        width: '100%',
        textAlign: 'center',
        border:
          entry.rank === 1
            ? '2px solid #f59e0b'
            : '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <Stack spacing={0.5} alignItems="center">
        <Typography
          component="span"
          sx={{ fontSize: entry.rank === 1 ? '2.5rem' : '1.75rem' }}
        >
          {MEDAL[entry.rank]}
        </Typography>
        <Typography
          variant={entry.rank === 1 ? 'h6' : 'subtitle1'}
          fontWeight="bold"
          noWrap
        >
          {entry.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {entry.wins} win{entry.wins !== 1 ? 's' : ''}
        </Typography>
        <Typography
          variant={entry.rank === 1 ? 'subtitle1' : 'body2'}
          fontWeight={entry.rank === 1 ? 'bold' : 'normal'}
          color={entry.rank === 1 ? 'warning.dark' : 'text.primary'}
        >
          {formatAxisNumber(entry.totalPoints)} pts
        </Typography>
      </Stack>
    </Paper>
    <Box
      sx={{
        width: '100%',
        height: PLATFORM_HEIGHT[entry.rank],
        bgcolor: PLATFORM_COLOR[entry.rank],
        borderRadius: '4px 4px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="h6"
        sx={{ color: 'white', fontWeight: 'bold', opacity: 0.85 }}
      >
        {entry.rank}
      </Typography>
    </Box>
  </Box>
);

export const PodiumCard = ({ podium }: { podium: PodiumEntry[] }) => {
  const first = podium.find((e) => e.rank === 1);
  const second = podium.find((e) => e.rank === 2);
  const third = podium.find((e) => e.rank === 3);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: { xs: 1, sm: 2 },
        maxWidth: 640,
        mx: 'auto',
        width: '100%',
      }}
    >
      {second && <PodiumSlot entry={second} />}
      {first && <PodiumSlot entry={first} />}
      {third && <PodiumSlot entry={third} />}
    </Box>
  );
};
