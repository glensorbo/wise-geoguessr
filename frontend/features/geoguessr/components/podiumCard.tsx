import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
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

// rank 3 reveals first, rank 1 last for dramatic effect
const ANIMATION_DELAY_MS = { 1: 800, 2: 400, 3: 0 } as const;

const riseUp = keyframes`
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
`;

const fadeSlideDown = keyframes`
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const reducedMotion = '@media (prefers-reduced-motion: reduce)';

const PodiumSlot = ({
  entry,
  order,
}: {
  entry: PodiumEntry;
  order: { xs: number; sm: number };
}) => {
  const delay = `${ANIMATION_DELAY_MS[entry.rank]}ms`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        order,
        minWidth: 0,
      }}
    >
      {/* Card fades + slides down after its platform has risen */}
      <Box
        sx={{
          width: '100%',
          animation: `${fadeSlideDown} 400ms ease both`,
          animationDelay: `calc(${delay} + 350ms)`,
          [reducedMotion]: { animation: 'none', opacity: 1 },
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
              sx={{ wordBreak: 'break-word' }}
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
      </Box>

      {/* Platform rises from the bottom */}
      <Box
        sx={{
          width: '100%',
          height: PLATFORM_HEIGHT[entry.rank],
          bgcolor: PLATFORM_COLOR[entry.rank],
          borderRadius: '4px 4px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformOrigin: 'bottom',
          animation: `${riseUp} 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both`,
          animationDelay: delay,
          [reducedMotion]: { animation: 'none' },
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
};

export const PodiumCard = ({ podium }: { podium: PodiumEntry[] }) => {
  const first = podium.find((e) => e.rank === 1);
  const second = podium.find((e) => e.rank === 2);
  const third = podium.find((e) => e.rank === 3);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-end' },
        gap: { xs: 1, sm: 2 },
        maxWidth: 640,
        mx: 'auto',
        width: '100%',
      }}
    >
      {second && <PodiumSlot entry={second} order={{ xs: 2, sm: 1 }} />}
      {first && <PodiumSlot entry={first} order={{ xs: 1, sm: 2 }} />}
      {third && <PodiumSlot entry={third} order={{ xs: 3, sm: 3 }} />}
    </Box>
  );
};
