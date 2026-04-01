import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';

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
const PLATFORM_DELAY_S = { 1: 0.8, 2: 0.4, 3: 0 } as const;

const PodiumSlot = ({
  entry,
  order,
}: {
  entry: PodiumEntry;
  order: { xs: number; sm: number };
}) => {
  const platformDelay = PLATFORM_DELAY_S[entry.rank];

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
      {/* Card fades + slides in after platform has risen */}
      <motion.div
        style={{ width: '100%' }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: platformDelay + 0.35 }}
      >
        <Paper
          elevation={entry.rank === 1 ? 4 : 0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            width: '100%',
            textAlign: 'center',
            ...(entry.rank === 1 && {
              border: '2px solid #f59e0b !important',
              boxShadow: '0 0 24px rgba(245, 158, 11, 0.25)',
            }),
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
      </motion.div>

      {/* Platform rises from the bottom */}
      <motion.div
        style={{
          width: '100%',
          height: PLATFORM_HEIGHT[entry.rank],
          backgroundColor: PLATFORM_COLOR[entry.rank],
          borderRadius: '4px 4px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          originY: 1,
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{
          type: 'spring',
          bounce: 0.4,
          duration: 0.6,
          delay: platformDelay,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: 'white', fontWeight: 'bold', opacity: 0.85 }}
        >
          {entry.rank}
        </Typography>
      </motion.div>
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
