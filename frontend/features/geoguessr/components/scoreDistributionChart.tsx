import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { BarChart } from '@mui/x-charts/BarChart';
import { useState } from 'react';

import { DashboardSection } from './dashboardSection';
import {
  getChartSeries,
  formatAxisNumber,
} from '@frontend/features/geoguessr/constants';
import { getScoreDistribution } from '@frontend/features/geoguessr/logic';

import type { GameResult } from '@frontend/features/geoguessr/logic/types';
import type { SeriesLegendItemContext } from '@mui/x-charts/ChartsLegend';
import type { ComponentProps, MouseEvent } from 'react';

type HighlightItemData = NonNullable<
  ComponentProps<typeof BarChart>['highlightedItem']
>;

type Props = {
  results: GameResult[];
  year: number;
  players: string[];
  isLoading: boolean;
  isPhone: boolean;
};

export const ScoreDistributionChart = ({
  results,
  year,
  players,
  isLoading,
  isPhone,
}: Props) => {
  const [highlightedItem, setHighlightedItem] =
    useState<HighlightItemData | null>(null);

  const distributionData = getScoreDistribution(results, year, players);
  const chartSeries = getChartSeries(players);

  return (
    <DashboardSection title="Score distribution">
      {isLoading ? (
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
      ) : (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Box sx={{ minWidth: { xs: 560, md: '100%' } }}>
            <BarChart
              dataset={distributionData}
              series={chartSeries.map((s) => ({
                id: s.name,
                dataKey: s.name,
                label: s.name,
                color: s.color,
                stack: 'distribution',
                highlightScope: {
                  highlight: 'series',
                  fade: 'global',
                } as const,
                valueFormatter: (v: number | null) =>
                  v !== null && v > 0
                    ? `${v} score${v === 1 ? '' : 's'}`
                    : '0 scores',
              }))}
              highlightedItem={highlightedItem}
              onHighlightChange={setHighlightedItem}
              xAxis={[
                {
                  scaleType: 'band',
                  dataKey: 'label',
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
                  label: 'Count',
                  width: 72,
                  tickMinStep: 1,
                  valueFormatter: (v: unknown) => formatAxisNumber(v),
                },
              ]}
              slotProps={{
                legend: {
                  onItemClick: (
                    _event: MouseEvent<HTMLButtonElement>,
                    context: SeriesLegendItemContext,
                  ) => {
                    setHighlightedItem((prev) =>
                      prev?.seriesId === context.seriesId
                        ? null
                        : { seriesId: context.seriesId },
                    );
                  },
                },
              }}
              grid={{ horizontal: true }}
              margin={{
                top: 16,
                right: isPhone ? 12 : 24,
                bottom: 28,
                left: isPhone ? 12 : 24,
              }}
              height={isPhone ? 300 : 340}
              sx={{ width: '100%' }}
            />
          </Box>
        </Box>
      )}
    </DashboardSection>
  );
};
