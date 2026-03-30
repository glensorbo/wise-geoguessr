import {
  Alert,
  AlertTitle,
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useMemo, useRef, useState, type ReactNode } from 'react';

import {
  getActivePlayers,
  getCurrentYear,
  getPerPlayedRoundDetails,
  getPlayerData,
  getPlayerDetails,
} from '@frontend/features/geoguessr/logic';
import {
  useGetResultsQuery,
  useGetYearsQuery,
} from '@frontend/redux/api/gameResultApi';
import { TableSkeleton } from '@frontend/shared/components/skeleton';

import type { GameResult } from '@backend/types/gameResult';

const currentYear = getCurrentYear();
const numberFormatter = new Intl.NumberFormat('en-US');

const PLAYER_COLORS: Record<string, string> = {
  Glen: '#ec4899',
  Thorjan: '#ef4444',
  Thomas: '#65a30d',
  'Tor Arve': '#f97316',
  Sigurd: '#7c3aed',
  Malin: '#9333ea',
  Lotte: '#0891b2',
  Margaux: '#2563eb',
  Eirik: '#0f766e',
};

const FALLBACK_COLORS = [
  '#4f46e5',
  '#2563eb',
  '#0f766e',
  '#16a34a',
  '#ca8a04',
  '#ea580c',
  '#db2777',
];

const getChartSeries = (players: string[]) =>
  players.map((name, index) => ({
    name,
    color:
      PLAYER_COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
  }));

const formatAxisNumber = (value: unknown) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return typeof value === 'string' ? value : '';
  }
  return numberFormatter.format(value);
};

const DashboardSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Paper elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
    <Stack spacing={2.5}>
      <Typography variant="h5" component="h2">
        {title}
      </Typography>
      {children}
    </Stack>
  </Paper>
);

const SectionSkeleton = ({ height = 340 }: { height?: number }) => (
  <Skeleton variant="rounded" height={height} sx={{ borderRadius: 2 }} />
);

type PointsGridRow = { id: string; date: string } & Record<
  string,
  string | number
>;

export const HomePage = () => {
  const { data: availableYears = [], isLoading: yearsLoading } =
    useGetYearsQuery();

  const [year, setYear] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const y = Number(params.get('year'));
    return y > 2000 ? y : currentYear;
  });

  const handleYearChange = (newYear: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('year', String(newYear));
    window.history.replaceState({}, '', url.toString());
    setYear(newYear);
  };

  const {
    data: freshResults,
    isFetching: resultsFetching,
    error,
  } = useGetResultsQuery(year);

  // Keep the previous year's data visible while the new year is loading.
  // This prevents the "no results" flash and layout collapse during year changes.
  const previousResultsRef = useRef<GameResult[]>([]);
  if (freshResults !== undefined) {
    previousResultsRef.current = freshResults;
  }
  const results = freshResults ?? previousResultsRef.current;

  const yearOptions = useMemo(
    () =>
      Array.from(new Set([currentYear, ...availableYears])).toSorted(
        (a, b) => b - a,
      ),
    [availableYears],
  );

  const players = useMemo(
    () => getActivePlayers(results, year),
    [results, year],
  );
  const chartSeries = useMemo(() => getChartSeries(players), [players]);
  const playerData = useMemo(
    () => getPlayerData(results, year),
    [results, year],
  );
  const { details, points } = useMemo(
    () => getPlayerDetails(results, year),
    [results, year],
  );
  const perPlayedDetails = useMemo(
    () => getPerPlayedRoundDetails(results, year),
    [results, year],
  );
  const sortedPlayerData = useMemo(
    () =>
      playerData.toSorted(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [playerData],
  );
  const playedDetails = useMemo(
    () => details.filter((d) => d.played > 0),
    [details],
  );
  const pointsPerPlayedData = useMemo(
    () => perPlayedDetails.filter((d) => d.pointsPerPlayed > 0),
    [perPlayedDetails],
  );
  const gridRows = useMemo<PointsGridRow[]>(
    () =>
      playerData.map((entry) => ({
        id: entry.date,
        date: entry.date,
        ...Object.fromEntries(
          players.map((p) => [p, typeof entry[p] === 'number' ? entry[p] : 0]),
        ),
      })),
    [playerData, players],
  );
  const gridColumns = useMemo<GridColDef<PointsGridRow>[]>(
    () => [
      { field: 'date', headerName: 'Date', minWidth: 140, flex: 1 },
      ...players.map((p) => ({
        field: p,
        headerName: p,
        type: 'number' as const,
        minWidth: 120,
        flex: 1,
        align: 'right' as const,
        headerAlign: 'right' as const,
        valueFormatter: (value: number) => formatAxisNumber(value),
      })),
    ],
    [players],
  );

  const isLoading = yearsLoading || resultsFetching;
  const hasError = !!error && !resultsFetching;
  const noResults = !isLoading && !hasError && playerData.length === 0;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={4}>
        {/* ── Header ────────────────────────────────────────────────────── */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Stack spacing={1}>
            <Typography variant="h3" component="h1">
              Wise GeoGuessr results
            </Typography>
            <Typography color="text.secondary">
              Weekly standings, charts, and cumulative totals for {year}.
            </Typography>
          </Stack>

          <Stack spacing={1} sx={{ minWidth: 180 }}>
            {yearsLoading ? (
              <Skeleton variant="rounded" height={40} />
            ) : (
              <FormControl size="small">
                <InputLabel id="year-select-label">Year</InputLabel>
                <Select
                  labelId="year-select-label"
                  value={String(year)}
                  label="Year"
                  disabled={resultsFetching}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                >
                  {yearOptions.map((y) => (
                    <MenuItem key={y} value={String(y)}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
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
              <Typography variant="h4" component="h2">
                No results for {year}
              </Typography>
              <Typography color="text.secondary" align="center">
                Log in and use the &ldquo;+ Add results&rdquo; button to add the
                first entry.
              </Typography>
            </Stack>
          </Container>
        )}

        {/* ── Points grid ───────────────────────────────────────────────── */}
        <DashboardSection title="Points">
          {isLoading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : noResults || hasError ? null : (
            <DataGrid
              rows={gridRows}
              columns={gridColumns}
              autoHeight
              pagination
              disableRowSelectionOnClick
              showToolbar
              density="compact"
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } },
                sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
              }}
              pageSizeOptions={[10]}
              sx={{ border: 0 }}
            />
          )}
        </DashboardSection>

        {/* ── Weekly points ─────────────────────────────────────────────── */}
        <DashboardSection title="Weekly points">
          {isLoading ? (
            <SectionSkeleton height={340} />
          ) : noResults || hasError ? null : (
            <Box sx={{ width: '100%' }}>
              <LineChart
                dataset={sortedPlayerData}
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
                    label: 'Points',
                    width: 72,
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

        {/* ── Won vs played ─────────────────────────────────────────────── */}
        <DashboardSection title="Won vs played">
          {isLoading ? (
            <SectionSkeleton height={340} />
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

        {/* ── Points per round ──────────────────────────────────────────── */}
        <DashboardSection title="Points per round played">
          {isLoading ? (
            <SectionSkeleton height={340} />
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

        {/* ── Accumulated points ────────────────────────────────────────── */}
        <DashboardSection title="Accumulated points over time">
          {isLoading ? (
            <SectionSkeleton height={340} />
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
