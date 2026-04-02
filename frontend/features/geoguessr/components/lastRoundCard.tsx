import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router';

import { formatAxisNumber } from '../constants';
import { useConfetti } from '../hooks/useConfetti';
import { PlayerAvatar } from '@frontend/shared/components/playerAvatar';

import type { LastRound } from '../logic/lastRound';

const rankLabel = (rank: number): string => {
  if (rank === 1) {
    return '👑';
  }
  if (rank === 2) {
    return '🥈';
  }
  if (rank === 3) {
    return '🥉';
  }
  return `${rank}.`;
};

export const LastRoundCard = ({ lastRound }: { lastRound: LastRound }) => {
  useConfetti(lastRound.rankings.some((e) => e.isWinner));

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Played on {lastRound.date}
      </Typography>
      <Stack spacing={0.75}>
        {lastRound.rankings.map((entry) => (
          <Box
            key={entry.name}
            component={Link}
            to={`/players/${encodeURIComponent(entry.name)}`}
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexWrap: 'wrap',
              gap: 2,
              px: 2,
              py: 1.25,
              borderRadius: 1,
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              bgcolor: entry.isWinner
                ? 'rgba(245, 158, 11, 0.08)'
                : 'action.hover',
              border: entry.isWinner
                ? '1px solid rgba(245, 158, 11, 0.3)'
                : '1px solid transparent',
              transition: 'transform 0.12s ease, box-shadow 0.12s ease',
              '&:hover': {
                transform: 'translateX(3px)',
                boxShadow: 1,
                bgcolor: entry.isWinner
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'action.selected',
              },
            }}
          >
            <Typography
              component="span"
              sx={{ width: 28, textAlign: 'center', flexShrink: 0 }}
            >
              {rankLabel(entry.rank)}
            </Typography>
            <PlayerAvatar name={entry.name} size={32} />
            <Typography
              variant="body1"
              fontWeight={entry.isWinner ? 'bold' : 'normal'}
              sx={{ flex: 1, minWidth: 140 }}
            >
              {entry.name}
            </Typography>
            <Typography
              variant="body1"
              fontWeight={entry.isWinner ? 'bold' : 'normal'}
              color={entry.isWinner ? 'warning.dark' : 'text.secondary'}
            >
              {formatAxisNumber(entry.score)}
            </Typography>
            {entry.isWinner && (
              <Chip
                label="Winner"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};
