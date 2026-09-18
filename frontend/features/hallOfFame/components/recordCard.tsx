import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { PlayerAvatar } from '@frontend/shared/components/playerAvatar';

import type { ReactNode } from 'react';

type RecordCardProps = {
  gradient: string;
  glowColor: string;
  emoji: string;
  title: string;
  value: ReactNode;
  holders: Array<{ label: string; sublabel?: string }>;
};

export const RecordCard = ({
  gradient,
  glowColor,
  emoji,
  title,
  value,
  holders,
}: RecordCardProps) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 3, md: 4 },
      height: '100%',
      background: gradient,
      color: 'white',
      boxShadow: `0 20px 48px -12px ${glowColor}`,
      border: '1px solid rgba(255,255,255,0.12)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%)',
        pointerEvents: 'none',
      },
    }}
  >
    <Stack
      spacing={2.5}
      sx={{ height: '100%', position: 'relative', zIndex: 1 }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          aria-hidden="true"
          sx={{
            fontSize: '2.25rem',
            lineHeight: 1,
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
          }}
        >
          {emoji}
        </Box>
        <Typography
          variant="subtitle1"
          sx={{ opacity: 0.9, letterSpacing: 0.3, fontWeight: 600 }}
        >
          {title}
        </Typography>
      </Stack>

      <Typography
        variant="h3"
        component="p"
        sx={{ letterSpacing: -1, lineHeight: 1, fontWeight: 800 }}
      >
        {value}
      </Typography>

      <Stack spacing={0.75} sx={{ flexWrap: 'wrap' }}>
        {holders.map(({ label, sublabel }) => (
          <Stack
            key={`${label}-${sublabel ?? ''}`}
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <PlayerAvatar name={label} size={24} />
            <Chip
              label={label}
              size="small"
              sx={{
                color: 'white',
                borderColor: alpha('#fff', 0.55),
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
              variant="outlined"
            />
            {sublabel && (
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                {sublabel}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </Stack>
  </Paper>
);

type HonorableMentionCardProps = {
  accentColor: string;
  emoji: string;
  title: string;
  value: ReactNode;
  holders: Array<{ label: string }>;
};

export const HonorableMentionCard = ({
  accentColor,
  emoji,
  title,
  value,
  holders,
}: HonorableMentionCardProps) => (
  <Paper
    elevation={0}
    sx={(theme) => ({
      p: { xs: 2, md: 2.5 },
      height: '100%',
      border: `1px solid ${alpha(accentColor, 0.22)}`,
      borderLeft: `4px solid ${accentColor}`,
      background: alpha(
        accentColor,
        theme.palette.mode === 'dark' ? 0.06 : 0.04,
      ),
    })}
  >
    <Stack spacing={1.5} sx={{ height: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box aria-hidden="true" sx={{ fontSize: '1.4rem', lineHeight: 1 }}>
          {emoji}
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {title}
        </Typography>
      </Stack>

      <Typography
        variant="h5"
        component="p"
        color="text.primary"
        sx={{ fontWeight: 800 }}
      >
        {value}
      </Typography>

      <Stack
        direction="row"
        spacing={0.75}
        sx={{ flexWrap: 'wrap', alignItems: 'center' }}
      >
        {holders.map(({ label }) => (
          <Stack
            key={label}
            direction="row"
            spacing={0.5}
            sx={{ alignItems: 'center' }}
          >
            <PlayerAvatar name={label} size={24} />
            <Chip
              label={label}
              size="small"
              sx={{
                fontWeight: 600,
                borderColor: alpha(accentColor, 0.5),
                color: accentColor,
              }}
              variant="outlined"
            />
          </Stack>
        ))}
      </Stack>
    </Stack>
  </Paper>
);
