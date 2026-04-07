import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router';

import { formatAxisNumber } from '../constants';
import { PlayerAvatar } from '@frontend/shared/components/playerAvatar';

import type { Rivalry } from '../logic/rivalries';

const getLeadText = (rivalry: Rivalry): string => {
  const { playerA, playerB } = rivalry;
  if (playerA.wins === playerB.wins) {
    return `Tied ${playerA.wins}–${playerB.wins}`;
  }
  const leader = playerA.wins > playerB.wins ? playerA : playerB;
  const trailer = playerA.wins > playerB.wins ? playerB : playerA;
  return `${leader.name} leads ${leader.wins}–${trailer.wins}`;
};

export const RivalryCard = ({ rivalries }: { rivalries: Rivalry[] }) => (
  <Stack spacing={0.75}>
    {rivalries.map((rivalry) => (
      <Box
        key={`${rivalry.playerA.name}-${rivalry.playerB.name}`}
        component={Link}
        to={`/head-to-head?a=${encodeURIComponent(rivalry.playerA.name)}&b=${encodeURIComponent(rivalry.playerB.name)}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          px: 2,
          py: 1.5,
          borderRadius: 1,
          textDecoration: 'none',
          color: 'inherit',
          bgcolor: 'action.hover',
          border: '1px solid transparent',
          transition: 'transform 0.12s ease, box-shadow 0.12s ease',
          '&:hover': {
            transform: 'translateX(3px)',
            boxShadow: 1,
            bgcolor: 'action.selected',
          },
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
          {/* Player A */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}
          >
            <PlayerAvatar name={rivalry.playerA.name} size={28} />
            <Typography variant="body2" noWrap sx={{ fontWeight: 'medium' }}>
              {rivalry.playerA.name}
            </Typography>
          </Stack>

          <Typography
            component="span"
            aria-hidden="true"
            sx={{ flexShrink: 0, fontSize: '1rem', lineHeight: 1 }}
          >
            ⚔️
          </Typography>

          {/* Player B */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              flex: 1,
              minWidth: 0,
              justifyContent: 'flex-end',
            }}
          >
            <Typography variant="body2" noWrap sx={{ fontWeight: 'medium' }}>
              {rivalry.playerB.name}
            </Typography>
            <PlayerAvatar name={rivalry.playerB.name} size={28} />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {getLeadText(rivalry)}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            ·
          </Typography>
          <Typography variant="caption" color="text.disabled">
            avg gap {formatAxisNumber(rivalry.avgScoreGap)} pts
          </Typography>
        </Stack>
      </Box>
    ))}
  </Stack>
);
