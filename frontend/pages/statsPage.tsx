import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { useMemo } from 'react';

import { getChartSeries, formatAxisNumber } from '@frontend/features/geoguessr/constants';
import { DashboardSection } from '@frontend/features/geoguessr/components/dashboardSection';
import { YearSelector } from '@frontend/features/geoguessr/components/yearSelector';
import { useResults } from '@frontend/features/geoguessr/hooks/useResults';
import {
  getActivePlayers,
  getPerPlayedRoundDetails,
  getPlayerDetails,
} from '@frontend/features/geoguessr/logic';

export const StatsPage = () => {
  const { year, setYear, yearOptions, yearsLoading, results, isLoading, error } =
    useResults();

  const players = useMemo(
    () => getActivePlayers(results, year),
    [results, year],
  );
  const chartSeries = useMemo(() => getChartSeries(players), [players]);
  const { details, points } = useMemo(
    () => getPlayerDetails(results, year),
    [results, year],
  );
  const perPlayedDetails = useMemo(
    () => getPerPlayedRoundDetails(results, year),
    [results, year],
  );
  const playedDetails = useMemo(
    () => details.filter((d) => d.played > 0),
    [details],
  );
  const pointsPerPlayedData = useMemo(
    () => perPlayedDetails.filter((d) => d.pointsPerPlayed > 0),
    [perPlayedDetails],
  );

  const noResults = !isLoading && !error && points.length === 0;
  const hasError = !!error && !isLoading;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={4}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h1">
              Statistics
            </Typography>
            <Typography color="text.secondary">
              Player performance breakdown for {year}.
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

        {hasError && (
          <Alert severity="error">
            <AlertTitle>Could not load results</AlertTitle>
            Something went wrong fetching the data. Try refreshing the page.
          </Alert>
        )}

        {noResults && (
          <Container maxWidth="sm" sx={{ py: 6 }}>
            <Stack spacing={2} alignItems="center">
              <Typography variant="h5">No results for {year}</Typography>
              <Typography color="text.secondary" align="center">
                No data available yet for this year.
              </Typography>
            </Stack>
          </Container>
        )}

        <DashboardSection title="Won vs played">
          {isLoading ? (
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
          ) : noResults || hasError ? null : (
            <Box sx={{ width: '100%' }}>
              <BarChart
                dataset={playedDetails}
                series={[
                  { dataKey: 'played', label: 'Played', color: '#7c3aed' },
                  { dataKey: 'won', label: 'Won', color: '#16a34a' },
                ]}
                xAxis={[
                  {
                    scaleType: 'band',
                    dataKey: 'name',
                    height: 72,
                    tickLabelStyle: {
                      angle: -35,
                      textAnchor: 'end',
                      dominantBaseline: 'central',
                      fontSize: 11,
                    },
                  },
                ]}
                yAxis={[
                  {
                    label: 'Rounds',
                    width: 72,
                    valueFormatter: (v: unknown) => formatAxisNumber(v),
                  },
                ]}
                grid={{ horizontal: true }}
                margin={{ top: 16, right: 24, bottom: 28, left: 24 }}
                height={340}
                sx={{ width: '100%' }}
              />
            </Box>
          )}
        </DashboardSection>

        <DashboardSection title="Points per round played">
          {isLoading ? (
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
          ) : noResults || hasError ? null : (
            <Box sx={{ width: '100%' }}>
              <BarChart
                dataset={pointsPerPlayedData}
                series={[
                  {
                    dataKey: 'pointsPerPlayed',
                    label: 'Points',
                    color: '#2563eb',
                  },
                ]}
                xAxis={[
                  {
                    scaleType: 'band',
                    dataKey: 'name',
                    height: 72,
                    tickLabelStyle: {
                      angle: -35,
                      textAnchor: 'end',
                      dominantBaseline: 'central',
                      fontSize: 11,
                    },
                  },
                ]}
                yAxis={[
                  {
                    label: 'Avg points',
                    width: 84,
                    valueFormatter: (v: unknown) => formatAxisNumber(v),
                  },
                ]}
                grid={{ horizontal: true }}
                margin={{ top: 16, right: 24, bottom: 28, left: 24 }}
                height={340}
                sx={{ width: '100%' }}
              />
            </Box>
          )}
        </DashboardSection>

        <DashboardSection title="Accumulated points over time">
          {isLoading ? (
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
          ) : noResults || hasError ? null : (
            <Box sx={{ width: '100%' }}>
              <LineChart
                dataset={points}
                series={chartSeries.map((s) => ({
                  dataKey: s.name,
                  label: s.name,
                  color: s.color,
                  curve: 'monotoneX',
                  connectNulls: true,
                  showMark: false,
                }))}
                xAxis={[
                  {
                    scaleType: 'point',
                    dataKey: 'date',
                    height: 88,
                    valueFormatter: (v) => String(v),
                    tickLabelStyle: {
                      angle: -45,
                      textAnchor: 'end',
                      dominantBaseline: 'central',
                      fontSize: 11,
                    },
                  },
                ]}
                yAxis={[
                  {
                    label: 'Total points',
                    width: 84,
                    valueFormatter: (v: unknown) => formatAxisNumber(v),
                  },
                ]}
                grid={{ horizontal: true, vertical: true }}
                margin={{ top: 16, right: 24, bottom: 28, left: 24 }}
                height={340}
                sx={{ width: '100%' }}
              />
            </Box>
          )}
        </DashboardSection>

      </Stack>
    </Container>
  );
};
