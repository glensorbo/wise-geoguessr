import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';

import { DashboardSection } from '@frontend/features/geoguessr/components/dashboardSection';
import { YearSelector } from '@frontend/features/geoguessr/components/yearSelector';
import {
  getChartSeries,
  formatAxisNumber,
} from '@frontend/features/geoguessr/constants';
import { useResults } from '@frontend/features/geoguessr/hooks/useResults';
import {
  getActivePlayers,
  getPlayerData,
} from '@frontend/features/geoguessr/logic';
import { TableSkeleton } from '@frontend/shared/components/skeleton';

type PointsGridRow = { id: string; date: string } & Record<
  string,
  string | number
>;

export const ResultsPage = () => {
  const {
    year,
    setYear,
    yearOptions,
    yearsLoading,
    results,
    isLoading,
    error,
  } = useResults();

  const players = useMemo(
    () => getActivePlayers(results, year),
    [results, year],
  );
  const chartSeries = useMemo(() => getChartSeries(players), [players]);
  const playerData = useMemo(
    () => getPlayerData(results, year),
    [results, year],
  );
  const sortedPlayerData = useMemo(
    () =>
      playerData.toSorted(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [playerData],
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

  const noResults = !isLoading && !error && playerData.length === 0;
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
              Results
            </Typography>
            <Typography color="text.secondary">
              Round-by-round scores for {year}.
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
                Log in and use the &ldquo;+ Add results&rdquo; button to add the
                first entry.
              </Typography>
            </Stack>
          </Container>
        )}

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

        <DashboardSection title="Weekly points">
          {isLoading ? (
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
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
      </Stack>
    </Container>
  );
};
