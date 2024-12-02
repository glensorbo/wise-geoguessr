import { BarChart, LineChart } from '@mantine/charts';
import { Flex, Title } from '@mantine/core';
import { data, getPlayerDetails } from '@/data';

export const HomePage = () => {
  const { details, points } = getPlayerDetails();
  return (
    <Flex align="center" justify="center" direction="column" gap={50} pt={50}>
      <Title>Wise GeoGuesser results</Title>
      <LineChart
        h={300}
        w="75%"
        data={data.toSorted((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
        dataKey="date"
        curveType="natural"
        tickLine="x"
        gridAxis="xy"
        withLegend
        legendProps={{ verticalAlign: 'bottom', height: 50 }}
        series={[
          { name: 'Glen', color: 'pink.6' },
          { name: 'Thorjan', color: 'red.6' },
          { name: 'Thomas', color: 'lime.6' },
          { name: 'Margaux', color: 'indigo.6' },
          { name: 'Tor Arve', color: 'orange.6' },
          { name: 'Marta', color: 'violet.6' },
        ].toSorted((a, b) => a.name.localeCompare(b.name))}
      />
      <Title>Won vs played</Title>
      <BarChart
        h={300}
        w="75%"
        data={details}
        withLegend
        legendProps={{ verticalAlign: 'bottom', height: 50 }}
        dataKey="name"
        series={[
          { name: 'played', color: 'violet.6', label: 'Played' },
          { name: 'won', color: 'green.8', label: 'Won' },
        ]}
      />
      <Title>Accumulated points over time</Title>
      <LineChart
        h={300}
        w="75%"
        data={points}
        dataKey="date"
        curveType="natural"
        tickLine="x"
        gridAxis="xy"
        withLegend
        legendProps={{ verticalAlign: 'bottom', height: 50 }}
        series={[
          { name: 'Glen', color: 'pink.6' },
          { name: 'Thorjan', color: 'red.6' },
          { name: 'Thomas', color: 'lime.6' },
          { name: 'Margaux', color: 'indigo.6' },
          { name: 'Tor Arve', color: 'orange.6' },
          { name: 'Marta', color: 'violet.6' },
        ].toSorted((a, b) => a.name.localeCompare(b.name))}
      />
    </Flex>
  );
};
