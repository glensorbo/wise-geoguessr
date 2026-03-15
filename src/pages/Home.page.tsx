import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
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
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  getActivePlayers,
  getCurrentYear,
  getPerPlayedRoundDetails,
  getPlayerData,
  getPlayerDetails,
  type GameResult,
  type Player,
} from '../logic';

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

const getChartSeries = (players: Player[]) => {
  return players.map((name, index) => ({
    name,
    color:
      PLAYER_COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
  }));
};

const formatAxisNumber = (value: unknown) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    if (typeof value === 'string') {
      return value;
    }

    return '';
  }

  return numberFormatter.format(value);
};

const SectionLoadingState = ({
  height = 280,
  label = 'Loading results...',
}: {
  height?: number;
  label?: string;
}) => {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: height }}
    >
      <CircularProgress size={28} />
      <Typography color="text.secondary">{label}</Typography>
    </Stack>
  );
};

const DashboardSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={2.5}>
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
        {children}
      </Stack>
    </Paper>
  );
};

type PointsGridRow = {
  id: string;
  date: string;
} & Record<string, string | number>;

export const HomePage = () => {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [results, setResults] = useState<GameResult[]>([]);
  const [isResultsLoading, setIsResultsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearsWarning, setYearsWarning] = useState<string | null>(null);

  useEffect(() => {
    let isDisposed = false;

    const fetchYears = async () => {
      try {
        const response = await fetch('/api/results/years');
        if (!response.ok) {
          throw new Error(
            `Failed to load available years (${response.status})`,
          );
        }

        const payload = (await response.json()) as number[];
        if (!isDisposed) {
          setAvailableYears(payload);
          setYearsWarning(null);
        }
      } catch (caughtError) {
        console.error(caughtError);
        if (!isDisposed) {
          setYearsWarning(
            'Could not load available years. Showing the current year only.',
          );
        }
      }
    };

    void fetchYears();

    return () => {
      isDisposed = true;
    };
  }, []);

  useEffect(() => {
    let isDisposed = false;

    const fetchResults = async () => {
      setIsResultsLoading(true);

      try {
        const response = await fetch(`/api/results?year=${selectedYear}`);
        if (!response.ok) {
          throw new Error(`Failed to load results (${response.status})`);
        }

        const payload = (await response.json()) as GameResult[];
        if (!isDisposed) {
          setResults(payload);
          setError(null);
        }
      } catch (caughtError) {
        if (!isDisposed) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Failed to load results.',
          );
        }
      } finally {
        if (!isDisposed) {
          setIsResultsLoading(false);
        }
      }
    };

    void fetchResults();

    return () => {
      isDisposed = true;
    };
  }, [selectedYear]);

  const yearOptions = useMemo(() => {
    return Array.from(new Set([currentYear, ...availableYears])).toSorted(
      (a, b) => b - a,
    );
  }, [availableYears]);
  const players = useMemo(
    () => getActivePlayers(results, selectedYear),
    [results, selectedYear],
  );
  const chartSeries = useMemo(() => getChartSeries(players), [players]);
  const playerData = useMemo(
    () => getPlayerData(results, selectedYear),
    [results, selectedYear],
  );
  const { details, points } = useMemo(
    () => getPlayerDetails(results, selectedYear),
    [results, selectedYear],
  );
  const perPlayedDetails = useMemo(
    () => getPerPlayedRoundDetails(results, selectedYear),
    [results, selectedYear],
  );
  const sortedPlayerData = useMemo(
    () =>
      playerData.toSorted(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [playerData],
  );
  const playedDetails = useMemo(
    () => details.filter((detail) => detail.played > 0),
    [details],
  );
  const pointsPerPlayedData = useMemo(
    () => perPlayedDetails.filter((detail) => detail.pointsPerPlayed > 0),
    [perPlayedDetails],
  );
  const gridRows = useMemo<PointsGridRow[]>(() => {
    return playerData.map((entry) => ({
      id: entry.date,
      date: entry.date,
      ...Object.fromEntries(
        players.map((player) => [
          player,
          typeof entry[player] === 'number' ? entry[player] : 0,
        ]),
      ),
    }));
  }, [playerData, players]);
  const gridColumns = useMemo<GridColDef<PointsGridRow>[]>(() => {
    return [
      {
        field: 'date',
        headerName: 'Date',
        minWidth: 140,
        flex: 1,
      },
      ...players.map((player) => ({
        field: player,
        headerName: player,
        type: 'number' as const,
        minWidth: 120,
        flex: 1,
        align: 'right' as const,
        headerAlign: 'right' as const,
        valueFormatter: (value: number) => formatAxisNumber(value),
      })),
    ];
  }, [players]);
  const showNoResults =
    !isResultsLoading && error === null && playerData.length === 0;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={4}>
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
              Weekly standings, charts, and cumulative totals for {selectedYear}
              .
            </Typography>
          </Stack>

          <Stack spacing={1} sx={{ minWidth: 180 }}>
            {availableYears.length === 0 && yearsWarning === null ? (
              <Skeleton variant="rounded" height={40} />
            ) : (
              <FormControl size="small">
                <InputLabel id="year-select-label">Year</InputLabel>
                <Select
                  labelId="year-select-label"
                  value={String(selectedYear)}
                  label="Year"
                  disabled={isResultsLoading}
                  onChange={(event) => {
                    setSelectedYear(Number(event.target.value));
                  }}
                >
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={String(year)}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Stack>

        {yearsWarning ? <Alert severity="warning">{yearsWarning}</Alert> : null}
        {error ? (
          <Alert severity="error">
            <AlertTitle>Could not load results</AlertTitle>
            {error}
          </Alert>
        ) : null}

        {showNoResults ? (
          <Container maxWidth="sm" sx={{ py: 6 }}>
            <Stack spacing={2} alignItems="center">
              <Typography variant="h4" component="h2">
                No results available for {selectedYear}
              </Typography>
              <Typography color="text.secondary" align="center">
                Add entries to `server/data/data.json` to populate the
                dashboard.
              </Typography>
            </Stack>
          </Container>
        ) : null}

        <DashboardSection title="Points">
          {isResultsLoading ? (
            <SectionLoadingState height={280} />
          ) : showNoResults || error ? null : (
            <DataGrid
              rows={gridRows}
              columns={gridColumns}
              autoHeight
              pagination
              disableRowSelectionOnClick
              showToolbar
              density="compact"
              initialState={{
                pagination: {
                  paginationModel: {
                    page: 0,
                    pageSize: 10,
                  },
                },
                sorting: {
                  sortModel: [{ field: 'date', sort: 'desc' }],
                },
              }}
              pageSizeOptions={[10]}
              sx={{
                border: 0,
                '& .MuiDataGrid-columnHeaders': {
                  borderRadius: 1,
                },
              }}
            />
          )}
        </DashboardSection>

        <DashboardSection title="Weekly points">
          {isResultsLoading ? (
            <SectionLoadingState height={340} />
          ) : showNoResults || error ? null : (
            <Box sx={{ width: '100%' }}>
              <LineChart
                dataset={sortedPlayerData}
                series={chartSeries.map((series) => ({
                  dataKey: series.name,
                  label: series.name,
                  color: series.color,
                  curve: 'monotoneX',
                  connectNulls: true,
                  showMark: false,
                }))}
                xAxis={[
                  {
                    scaleType: 'point',
                    dataKey: 'date',
                    height: 88,
                    valueFormatter: (value) => String(value),
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
                    valueFormatter: (value: unknown) => formatAxisNumber(value),
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

        <DashboardSection title="Won vs played">
          {isResultsLoading ? (
            <SectionLoadingState height={340} />
          ) : showNoResults || error ? null : (
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
                    valueFormatter: (value: unknown) => formatAxisNumber(value),
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
          {isResultsLoading ? (
            <SectionLoadingState height={340} />
          ) : showNoResults || error ? null : (
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
                    label: 'Average points',
                    width: 84,
                    valueFormatter: (value: unknown) => formatAxisNumber(value),
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
          {isResultsLoading ? (
            <SectionLoadingState height={340} />
          ) : showNoResults || error ? null : (
            <Box sx={{ width: '100%' }}>
              <LineChart
                dataset={points}
                series={chartSeries.map((series) => ({
                  dataKey: series.name,
                  label: series.name,
                  color: series.color,
                  curve: 'monotoneX',
                  connectNulls: true,
                  showMark: false,
                }))}
                xAxis={[
                  {
                    scaleType: 'point',
                    dataKey: 'date',
                    height: 88,
                    valueFormatter: (value) => String(value),
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
                    valueFormatter: (value: unknown) => formatAxisNumber(value),
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
