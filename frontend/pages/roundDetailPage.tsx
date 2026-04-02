import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router';

import { DashboardSection } from '@frontend/features/geoguessr/components/dashboardSection';
import { PodiumCard } from '@frontend/features/geoguessr/components/podiumCard';
import { formatAxisNumber } from '@frontend/features/geoguessr/constants';
import { useRoundDetail } from '@frontend/features/geoguessr/hooks/useRoundDetail';
import { PlayerAvatar } from '@frontend/shared/components/playerAvatar';

const DeltaChip = ({ delta }: { delta: number | null }) => {
  if (delta === null) {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }
  const positive = delta >= 0;
  const label = `${positive ? '+' : ''}${formatAxisNumber(Math.round(delta))}`;
  return (
    <Chip
      label={label}
      size="small"
      color={positive ? 'success' : 'error'}
      variant="outlined"
      sx={{ fontWeight: 600, minWidth: 72, justifyContent: 'center' }}
    />
  );
};

export const RoundDetailPage = () => {
  const { detail, podium, isLoading, notFound } = useRoundDetail();

  if (notFound) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Typography variant="h4" fontWeight={700}>
            Round not found
          </Typography>
          <Typography color="text.secondary">
            This round doesn&apos;t exist or may have been removed.
          </Typography>
          <IconButton
            component={Link}
            to="/results"
            size="large"
            sx={{ mt: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            component={Link}
            to="/results"
            aria-label="Back to results"
          >
            <ArrowBackIcon />
          </IconButton>
          <Stack spacing={0.5}>
            {isLoading ? (
              <Skeleton width={200} height={40} />
            ) : (
              <Typography variant="h4" component="h1">
                {detail?.date}
              </Typography>
            )}
            <Typography color="text.secondary">Round results</Typography>
          </Stack>
        </Stack>

        {!isLoading && !detail && (
          <Alert severity="error">Could not load round data.</Alert>
        )}

        {(isLoading || podium.length > 0) && (
          <DashboardSection title="🏆 Podium">
            {isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  maxWidth: 640,
                  mx: 'auto',
                  width: '100%',
                }}
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={180}
                    sx={{ flex: 1 }}
                  />
                ))}
              </Box>
            ) : (
              <PodiumCard podium={podium} />
            )}
          </DashboardSection>
        )}

        <DashboardSection title="📊 Score breakdown">
          {isLoading ? (
            <Stack spacing={1}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rounded" height={52} />
              ))}
            </Stack>
          ) : detail ? (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Player</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Score
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      vs avg
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detail.entries.map((entry) => (
                    <TableRow
                      key={entry.name}
                      sx={{
                        ...(entry.isWinner && {
                          backgroundColor: 'rgba(245,158,11,0.06)',
                        }),
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={entry.isWinner ? 700 : 400}
                          color={
                            entry.isWinner ? 'warning.dark' : 'text.primary'
                          }
                        >
                          {entry.rank === 1
                            ? '🥇'
                            : entry.rank === 2
                              ? '🥈'
                              : entry.rank === 3
                                ? '🥉'
                                : `#${entry.rank}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PlayerAvatar name={entry.name} size={28} />
                          <Typography
                            variant="body2"
                            fontWeight={entry.isWinner ? 700 : 400}
                          >
                            {entry.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={entry.isWinner ? 700 : 400}
                          color={
                            entry.isWinner ? 'warning.dark' : 'text.primary'
                          }
                        >
                          {formatAxisNumber(entry.score)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <DeltaChip delta={entry.delta} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </DashboardSection>
      </Stack>
    </Container>
  );
};
