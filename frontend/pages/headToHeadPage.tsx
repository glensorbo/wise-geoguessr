import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { LineChart } from '@mui/x-charts/LineChart';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import { DashboardSection } from '@frontend/features/geoguessr/components/dashboardSection';
import { YearSelector } from '@frontend/features/geoguessr/components/yearSelector';
import {
  formatAxisNumber,
  getPlayerColor,
} from '@frontend/features/geoguessr/constants';
import { useResults } from '@frontend/features/geoguessr/hooks/useResults';
import {
  getActivePlayers,
  getHeadToHead,
} from '@frontend/features/geoguessr/logic';
import { PlayerAvatar } from '@frontend/shared/components/playerAvatar';

type StatCardProps = {
  emoji: string;
  label: string;
  value: string | number;
  highlight?: boolean;
  color?: string;
};

const StatCard = ({
  emoji,
  label,
  value,
  highlight = false,
  color,
}: StatCardProps) => (
  <Card
    variant="outlined"
    sx={{
      flex: '1 1 120px',
      borderColor: highlight && color ? color : undefined,
      borderWidth: highlight ? 2 : 1,
    }}
  >
    <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
      <Typography sx={{ fontSize: '1.5rem', lineHeight: 1, mb: 0.5 }}>
        {emoji}
      </Typography>
      <Typography variant="h5" color={color} sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

const PlayerPicker = ({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string | null;
  options: string[];
  disabled: boolean;
  onChange: (v: string | null) => void;
}) => (
  <Autocomplete
    value={value}
    options={options}
    disabled={disabled}
    onChange={(_, v) => onChange(v)}
    renderOption={(props, option) => {
      const { key, ...rest } = props as {
        key: string;
      } & React.HTMLAttributes<HTMLLIElement>;
      return (
        <Box component="li" key={key} {...rest} sx={{ gap: 1.5 }}>
          <PlayerAvatar name={option} size={24} />
          {option}
        </Box>
      );
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        size="small"
        slotProps={{
          input: {
            ...params.slotProps.input,
            startAdornment: value ? (
              <Box sx={{ ml: 0.5, mr: -0.5, display: 'flex' }}>
                <PlayerAvatar name={value} size={24} />
              </Box>
            ) : null,
          },
          htmlInput: params.slotProps.htmlInput,
        }}
      />
    )}
    sx={{ flex: 1, minWidth: 160 }}
  />
);

export const HeadToHeadPage = () => {
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const [searchParams, setSearchParams] = useSearchParams();

  const { year, setYear, yearOptions, yearsLoading, results, isLoading } =
    useResults();

  const [playerA, setPlayerA] = useState<string | null>(
    searchParams.get('a') ?? null,
  );
  const [playerB, setPlayerB] = useState<string | null>(
    searchParams.get('b') ?? null,
  );

  const players = useMemo(
    () => getActivePlayers(results, year),
    [results, year],
  );

  const syncParams = (a: string | null, b: string | null) => {
    const params: Record<string, string> = {
      year: String(year),
    };
    if (a) {
      params['a'] = a;
    }
    if (b) {
      params['b'] = b;
    }
    setSearchParams(params, { replace: true });
  };

  const handlePlayerAChange = (v: string | null) => {
    setPlayerA(v);
    syncParams(v, playerB);
  };

  const handlePlayerBChange = (v: string | null) => {
    setPlayerB(v);
    syncParams(playerA, v);
  };

  const samePlayer = playerA !== null && playerA === playerB;
  const canCompare = playerA !== null && playerB !== null && !samePlayer;

  const headToHead = useMemo(() => {
    if (!canCompare) {
      return null;
    }
    return getHeadToHead(results, playerA, playerB, year);
  }, [canCompare, results, playerA, playerB, year]);

  const chartDataset = useMemo(() => {
    if (!headToHead) {
      return [];
    }
    return headToHead.entries.map((e) => ({
      date: e.date,
      [headToHead.playerA]: e.scoreA,
      [headToHead.playerB]: e.scoreB,
    }));
  }, [headToHead]);

  const colorA = playerA ? getPlayerColor(playerA) : undefined;
  const colorB = playerB ? getPlayerColor(playerB) : undefined;

  const leaderA = headToHead !== null && headToHead.winsA > headToHead.winsB;
  const leaderB = headToHead !== null && headToHead.winsB > headToHead.winsA;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={4}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h1">
              Head-to-Head
            </Typography>
            <Typography color="text.secondary">
              Direct record between two players for {year}.
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

        {/* Player pickers */}
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: 'center' }}
          >
            {isLoading ? (
              <>
                <Skeleton
                  variant="rounded"
                  height={40}
                  sx={{ flex: 1, minWidth: 160 }}
                />
                <Typography
                  variant="h6"
                  color="text.disabled"
                  sx={{ flexShrink: 0 }}
                >
                  ⚔️
                </Typography>
                <Skeleton
                  variant="rounded"
                  height={40}
                  sx={{ flex: 1, minWidth: 160 }}
                />
              </>
            ) : (
              <>
                <PlayerPicker
                  label="Player A"
                  value={playerA}
                  options={players.filter((p) => p !== playerB)}
                  disabled={isLoading}
                  onChange={handlePlayerAChange}
                />
                <Typography
                  variant="h6"
                  color="text.disabled"
                  sx={{ flexShrink: 0 }}
                >
                  ⚔️
                </Typography>
                <PlayerPicker
                  label="Player B"
                  value={playerB}
                  options={players.filter((p) => p !== playerA)}
                  disabled={isLoading}
                  onChange={handlePlayerBChange}
                />
              </>
            )}
          </Stack>
          {samePlayer && (
            <Typography
              variant="caption"
              color="error"
              sx={{ mt: 1, display: 'block' }}
            >
              Please select two different players.
            </Typography>
          )}
        </Paper>

        {/* Prompt when nothing selected */}
        {!canCompare && !samePlayer && (
          <Stack sx={{ alignItems: 'center', py: 6 }}>
            <Typography variant="h5" color="text.secondary">
              ⚔️
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Select two players above to see their head-to-head record.
            </Typography>
          </Stack>
        )}

        {/* Results */}
        {canCompare && headToHead && (
          <>
            {headToHead.sharedRounds === 0 ? (
              <Stack sx={{ alignItems: 'center', py: 6 }}>
                <Typography variant="h5">No shared rounds</Typography>
                <Typography
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  {playerA} and {playerB} have not played in the same round in{' '}
                  {year}.
                </Typography>
              </Stack>
            ) : (
              <>
                <DashboardSection title="⚔️ Record">
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <StatCard
                      emoji="🎮"
                      label="Shared rounds"
                      value={headToHead.sharedRounds}
                    />
                    <StatCard
                      emoji="🏆"
                      label={`${headToHead.playerA} wins`}
                      value={headToHead.winsA}
                      highlight={leaderA}
                      color={colorA}
                    />
                    <StatCard
                      emoji="🏆"
                      label={`${headToHead.playerB} wins`}
                      value={headToHead.winsB}
                      highlight={leaderB}
                      color={colorB}
                    />
                  </Box>
                </DashboardSection>

                <DashboardSection title="📊 Score comparison">
                  <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <Box sx={{ minWidth: { xs: 400, md: '100%' } }}>
                      <LineChart
                        dataset={chartDataset}
                        series={[
                          {
                            dataKey: headToHead.playerA,
                            label: headToHead.playerA,
                            color: colorA,
                            curve: 'monotoneX',
                            showMark: true,
                          },
                          {
                            dataKey: headToHead.playerB,
                            label: headToHead.playerB,
                            color: colorB,
                            curve: 'monotoneX',
                            showMark: true,
                          },
                        ]}
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
                            label: 'Score',
                            width: 84,
                            valueFormatter: (v: unknown) => formatAxisNumber(v),
                          },
                        ]}
                        grid={{ horizontal: true, vertical: true }}
                        margin={{
                          top: 16,
                          right: isPhone ? 12 : 24,
                          bottom: 28,
                          left: isPhone ? 12 : 24,
                        }}
                        height={isPhone ? 300 : 360}
                        sx={{ width: '100%' }}
                      />
                    </Box>
                  </Box>
                </DashboardSection>
              </>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
};
