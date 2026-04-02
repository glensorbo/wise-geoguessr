import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import { Link } from 'react-router';

import { DashboardSection } from '@frontend/features/geoguessr/components/dashboardSection';
import {
  formatAxisNumber,
  getPlayerColor,
} from '@frontend/features/geoguessr/constants';
import { usePlayerProfile } from '@frontend/features/geoguessr/hooks/usePlayerProfile';
import { PlayerAvatar } from '@frontend/shared/components/playerAvatar';

type StatCardProps = {
  emoji: string;
  label: string;
  value: string | number;
};

const StatCard = ({ emoji, label, value }: StatCardProps) => (
  <Card variant="outlined" sx={{ flex: '1 1 120px' }}>
    <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
      <Typography sx={{ fontSize: '1.5rem', lineHeight: 1, mb: 0.5 }}>
        {emoji}
      </Typography>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

const ChartSection = ({
  title,
  isLoading,
  hasData,
  noDataYear,
  children,
}: {
  title: string;
  isLoading: boolean;
  hasData: boolean;
  noDataYear: number;
  children: React.ReactNode;
}) => (
  <DashboardSection title={title}>
    {isLoading ? (
      <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
    ) : hasData ? (
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box sx={{ minWidth: { xs: 400, md: '100%' } }}>{children}</Box>
      </Box>
    ) : (
      <Typography color="text.secondary">
        No rounds played in {noDataYear}.
      </Typography>
    )}
  </DashboardSection>
);

const xAxisConfig = {
  scaleType: 'point' as const,
  dataKey: 'date',
  height: 88,
  valueFormatter: (v: unknown) => String(v),
  tickLabelStyle: {
    angle: -45,
    textAnchor: 'end' as const,
    dominantBaseline: 'central' as const,
    fontSize: 11,
  },
};

export const PlayerProfilePage = () => {
  const {
    playerName,
    stats,
    rankHistory,
    accumulatedPoints,
    achievements,
    year,
    isLoading,
    noData,
  } = usePlayerProfile();

  const playerColor = getPlayerColor(playerName);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton component={Link} to="/" aria-label="Back to dashboard">
            <ArrowBackIcon />
          </IconButton>
          <Stack spacing={0.5}>
            {isLoading ? (
              <Skeleton width={200} height={40} />
            ) : (
              <Typography variant="h4" component="h1">
                {playerName}
              </Typography>
            )}
            <Typography color="text.secondary">Player profile</Typography>
          </Stack>
        </Stack>

        {/* Identity card */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, md: 4 },
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            borderLeft: `4px solid ${playerColor}`,
          }}
        >
          {isLoading ? (
            <Skeleton variant="circular" width={96} height={96} />
          ) : (
            <PlayerAvatar name={playerName} size={96} />
          )}
          <Stack spacing={0.5}>
            {isLoading ? (
              <Skeleton width={180} height={40} />
            ) : (
              <Typography variant="h4" fontWeight={700}>
                {playerName}
              </Typography>
            )}
            {!isLoading && (stats?.currentStreak ?? 0) > 0 && (
              <Typography variant="body1" fontWeight={600}>
                🔥 {stats!.currentStreak} win streak
              </Typography>
            )}
          </Stack>
        </Paper>

        {noData ? (
          <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
            <Typography variant="h5">No rounds played yet</Typography>
            <Typography color="text.secondary">
              {playerName} hasn&apos;t participated in any rounds yet.
            </Typography>
          </Stack>
        ) : (
          <>
            <DashboardSection title="📊 All-time stats">
              {isLoading ? (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      height={100}
                      sx={{ flex: '1 1 120px' }}
                    />
                  ))}
                </Box>
              ) : stats ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <StatCard
                    emoji="🎮"
                    label="Rounds played"
                    value={stats.roundsPlayed}
                  />
                  <StatCard emoji="🏆" label="Wins" value={stats.wins} />
                  <StatCard
                    emoji="📈"
                    label="Win rate"
                    value={`${stats.winPercentage}%`}
                  />
                  <StatCard
                    emoji="⭐"
                    label="Personal best"
                    value={
                      stats.personalBest !== null
                        ? formatAxisNumber(stats.personalBest)
                        : '—'
                    }
                  />
                  <StatCard
                    emoji="🎯"
                    label="Avg score"
                    value={
                      stats.averageScore !== null
                        ? formatAxisNumber(stats.averageScore)
                        : '—'
                    }
                  />
                  <StatCard
                    emoji="💰"
                    label="Total points"
                    value={formatAxisNumber(stats.totalPoints)}
                  />
                  <StatCard
                    emoji="🥈"
                    label="Runner-up finishes"
                    value={stats.runnerUpFinishes}
                  />
                  <StatCard
                    emoji="⚡"
                    label="Best streak"
                    value={stats.bestStreak}
                  />
                </Box>
              ) : null}
            </DashboardSection>

            <DashboardSection
              title={
                isLoading
                  ? '🏅 Achievements'
                  : `🏅 Achievements ${achievements.filter((a) => a.earned).length}/${achievements.length}`
              }
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      width={130}
                      height={32}
                      sx={{ borderRadius: 4 }}
                    />
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {achievements.map((a) => (
                    <Tooltip
                      key={a.id}
                      title={a.earned ? a.description : `🔒 ${a.hint}`}
                      arrow
                    >
                      <Chip
                        label={`${a.emoji} ${a.name}`}
                        color={a.earned ? 'primary' : 'default'}
                        variant={a.earned ? 'filled' : 'outlined'}
                        sx={{
                          opacity: a.earned ? 1 : 0.45,
                          fontWeight: a.earned ? 700 : 400,
                          cursor: 'default',
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              )}
            </DashboardSection>

            <ChartSection
              title={`📈 Season ${year} accumulated points`}
              isLoading={isLoading}
              hasData={accumulatedPoints.length > 0}
              noDataYear={year}
            >
              <LineChart
                dataset={accumulatedPoints}
                series={[
                  {
                    dataKey: 'total',
                    label: 'Points',
                    color: playerColor,
                    showMark: true,
                    curve: 'monotoneX',
                    area: true,
                  },
                ]}
                xAxis={[xAxisConfig]}
                yAxis={[
                  {
                    label: 'Points',
                    width: 72,
                    valueFormatter: (v: unknown) => formatAxisNumber(v),
                  },
                ]}
                grid={{ horizontal: true }}
                height={300}
                sx={{
                  width: '100%',
                  '& .MuiAreaElement-root': { opacity: 0.15 },
                }}
              />
            </ChartSection>

            <ChartSection
              title={`📉 Season ${year} rank history`}
              isLoading={isLoading}
              hasData={rankHistory.length > 0}
              noDataYear={year}
            >
              <LineChart
                dataset={rankHistory}
                series={[
                  {
                    dataKey: 'rank',
                    label: 'Rank',
                    color: playerColor,
                    showMark: true,
                    curve: 'monotoneX',
                  },
                ]}
                xAxis={[xAxisConfig]}
                yAxis={[
                  {
                    label: 'Rank',
                    width: 56,
                    reverse: true,
                    tickMinStep: 1,
                    valueFormatter: (v: unknown) =>
                      typeof v === 'number' ? `#${v}` : String(v),
                  },
                ]}
                grid={{ horizontal: true }}
                height={300}
                sx={{ width: '100%' }}
              />
            </ChartSection>
          </>
        )}
      </Stack>
    </Container>
  );
};
