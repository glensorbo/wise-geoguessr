import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  HonorableMentionCard,
  RecordCard,
} from '@frontend/features/hallOfFame/components/recordCard';
import { useGetHallOfFameQuery } from '@frontend/redux/api/hallOfFameApi';

const formatScore = (score: number) => score.toLocaleString();

// Gradient + glow definitions for each record
const RECORD_STYLES = {
  highestScore: {
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
    glowColor: 'rgba(124, 58, 237, 0.45)',
  },
  winStreak: {
    gradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
    glowColor: 'rgba(249, 115, 22, 0.45)',
  },
  seasonTotal: {
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    glowColor: 'rgba(14, 165, 233, 0.45)',
  },
} as const;

// Accent colours for honorable mention cards
const MENTION_COLORS = {
  mostRounds: '#10b981',
  avgScore: '#f59e0b',
  runnerUp: '#8b5cf6',
} as const;

const RecordSkeleton = () => (
  <Skeleton variant="rounded" height={220} sx={{ borderRadius: 4 }} />
);

const MentionSkeleton = () => (
  <Skeleton variant="rounded" height={140} sx={{ borderRadius: 4 }} />
);

export const HallOfFamePage = () => {
  const { data, isLoading, error } = useGetHallOfFameQuery();

  const hasError = !!error && !isLoading;
  const isEmpty =
    !isLoading &&
    !error &&
    !data?.highestSingleRoundScore &&
    !data?.longestWinStreak &&
    !data?.highestSeasonTotal;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={6}>
        {/* ── Page header ── */}
        <Stack spacing={0.75}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              aria-hidden="true"
              sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}
            >
              🏆
            </Box>
            <Typography variant="h3" component="h1" fontWeight={800}>
              Hall of Fame
            </Typography>
          </Stack>
          <Typography color="text.secondary" variant="h6" fontWeight={400}>
            All-time records across every season.
          </Typography>
        </Stack>

        {hasError && (
          <Alert severity="error">
            <AlertTitle>Failed to load Hall of Fame</AlertTitle>
            Something went wrong. Please try again later.
          </Alert>
        )}

        {isEmpty && (
          <Typography color="text.secondary">
            No records yet — play some rounds to get started!
          </Typography>
        )}

        {!hasError && (
          <>
            {/* ── Top 3 records ── */}
            <Grid container spacing={3} alignItems="stretch">
              <Grid size={{ xs: 12, md: 4 }}>
                {isLoading ? (
                  <RecordSkeleton />
                ) : data?.highestSingleRoundScore ? (
                  <RecordCard
                    {...RECORD_STYLES.highestScore}
                    emoji="🎯"
                    title="Highest Single-Round Score"
                    value={formatScore(data.highestSingleRoundScore.score)}
                    holders={data.highestSingleRoundScore.holders.map((h) => ({
                      label: h.playerName,
                      sublabel: h.date,
                    }))}
                  />
                ) : null}
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                {isLoading ? (
                  <RecordSkeleton />
                ) : data?.longestWinStreak ? (
                  <RecordCard
                    {...RECORD_STYLES.winStreak}
                    emoji="🔥"
                    title="Longest Win Streak"
                    value={`${data.longestWinStreak.streak} ${data.longestWinStreak.streak === 1 ? 'round' : 'rounds'}`}
                    holders={data.longestWinStreak.holders.map((h) => ({
                      label: h.playerName,
                      sublabel:
                        h.startDate === h.endDate
                          ? h.startDate
                          : `${h.startDate} → ${h.endDate}`,
                    }))}
                  />
                ) : null}
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                {isLoading ? (
                  <RecordSkeleton />
                ) : data?.highestSeasonTotal ? (
                  <RecordCard
                    {...RECORD_STYLES.seasonTotal}
                    emoji="📅"
                    title="Highest Season Total"
                    value={formatScore(data.highestSeasonTotal.total)}
                    holders={data.highestSeasonTotal.holders.map((h) => ({
                      label: h.playerName,
                      sublabel: String(h.year),
                    }))}
                  />
                ) : null}
              </Grid>
            </Grid>

            {/* ── Honorable mentions ── */}
            {(isLoading ||
              data?.mostRoundsPlayed ||
              data?.highestAverageScore ||
              data?.mostRunnerUpFinishes) && (
              <Stack spacing={3}>
                <Divider>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    fontWeight={700}
                    letterSpacing={2}
                  >
                    Honorable Mentions
                  </Typography>
                </Divider>

                <Grid container spacing={2.5} alignItems="stretch">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    {isLoading ? (
                      <MentionSkeleton />
                    ) : data?.mostRoundsPlayed ? (
                      <HonorableMentionCard
                        accentColor={MENTION_COLORS.mostRounds}
                        emoji="🎮"
                        title="Most Dedicated"
                        value={`${data.mostRoundsPlayed.rounds} rounds`}
                        holders={data.mostRoundsPlayed.holders.map((h) => ({
                          label: h.playerName,
                        }))}
                      />
                    ) : null}
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    {isLoading ? (
                      <MentionSkeleton />
                    ) : data?.highestAverageScore ? (
                      <HonorableMentionCard
                        accentColor={MENTION_COLORS.avgScore}
                        emoji="📈"
                        title="Sharpshooter (avg/round)"
                        value={formatScore(data.highestAverageScore.average)}
                        holders={data.highestAverageScore.holders.map((h) => ({
                          label: h.playerName,
                        }))}
                      />
                    ) : null}
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    {isLoading ? (
                      <MentionSkeleton />
                    ) : data?.mostRunnerUpFinishes ? (
                      <HonorableMentionCard
                        accentColor={MENTION_COLORS.runnerUp}
                        emoji="🥈"
                        title="Silver Fox"
                        value={`${data.mostRunnerUpFinishes.count} runner-ups`}
                        holders={data.mostRunnerUpFinishes.holders.map((h) => ({
                          label: h.playerName,
                        }))}
                      />
                    ) : null}
                  </Grid>
                </Grid>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
};
