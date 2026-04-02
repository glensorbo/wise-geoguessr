import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';

import { DashboardSection } from '@frontend/features/geoguessr/components/dashboardSection';
import { LastRoundCard } from '@frontend/features/geoguessr/components/lastRoundCard';
import { PodiumCard } from '@frontend/features/geoguessr/components/podiumCard';
import { RivalryCard } from '@frontend/features/geoguessr/components/rivalryCard';
import { YearSelector } from '@frontend/features/geoguessr/components/yearSelector';
import { useResults } from '@frontend/features/geoguessr/hooks/useResults';
import {
  getLastRound,
  getPodium,
  getRivalries,
} from '@frontend/features/geoguessr/logic';

export const HomePage = () => {
  const { year, setYear, yearOptions, yearsLoading, results, isLoading } =
    useResults();

  const podium = useMemo(() => getPodium(results, year), [results, year]);
  const lastRound = useMemo(() => getLastRound(results), [results]);
  const rivalries = useMemo(() => getRivalries(results, year), [results, year]);

  const noResults = !isLoading && results.length === 0;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={4}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h1">
              Dashboard
            </Typography>
            <Typography color="text.secondary">
              Season standings for {year}.
            </Typography>
          </Stack>
          <YearSelector
            year={year}
            yearOptions={yearOptions}
            yearsLoading={yearsLoading}
            disabled={isLoading}
            onChange={setYear}
          />
        </Stack>

        {noResults ? (
          <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
            <Typography variant="h5">No results for {year}</Typography>
            <Typography color="text.secondary" align="center">
              Log in and use the &ldquo;+ Add results&rdquo; button to get
              started.
            </Typography>
          </Stack>
        ) : (
          <>
            <DashboardSection title="🏆 Season Podium">
              {isLoading ? (
                <Skeleton
                  variant="rounded"
                  height={300}
                  sx={{ borderRadius: 2 }}
                />
              ) : podium.length > 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <PodiumCard key={year} podium={podium} />
                </Box>
              ) : null}
            </DashboardSection>

            <DashboardSection title="🎮 Last Round">
              {isLoading ? (
                <Skeleton
                  variant="rounded"
                  height={200}
                  sx={{ borderRadius: 2 }}
                />
              ) : lastRound ? (
                <LastRoundCard lastRound={lastRound} />
              ) : null}
            </DashboardSection>

            {(isLoading || rivalries.length > 0) && (
              <DashboardSection title="⚔️ Closest Rivalries">
                {isLoading ? (
                  <Skeleton
                    variant="rounded"
                    height={160}
                    sx={{ borderRadius: 2 }}
                  />
                ) : (
                  <RivalryCard rivalries={rivalries} />
                )}
              </DashboardSection>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
};
