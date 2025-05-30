import { BarChart, LineChart } from '@mantine/charts';
import { Flex, Table, Title } from '@mantine/core';
import { data, getPlayerDetails, Player } from '@/data';

export const HomePage = () => {
  const { details, points } = getPlayerDetails();

  const chartSeries: { name: Player; color: string }[] = [
    { name: 'Glen', color: 'pink.6' },
    { name: 'Thorjan', color: 'red.6' },
    { name: 'Thomas', color: 'lime.6' },
    { name: 'Margaux', color: 'indigo.6' },
    { name: 'Tor Arve', color: 'orange.6' },
    { name: 'Trond', color: 'yellow.6' },
    { name: 'Lars', color: 'orange.6' },
    { name: 'Sigurd', color: 'violet.6' },
  ];

  chartSeries.sort((a, b) => a.name.localeCompare(b.name));

  const rows = data.map((el) => (
    <Table.Tr key={el.date}>
      <Table.Th>{el.date}</Table.Th>
      {chartSeries.map((s) => (
        <Table.Th key={s.name}>{el[s.name]}</Table.Th>
      ))}
    </Table.Tr>
  ));

  return (
    <Flex align="center" justify="center" direction="column" gap={50} pt={50} pb={50}>
      <Title>Points</Title>
      <Table.ScrollContainer minWidth="75vw" maxHeight="30vh">
        <Table stickyHeader striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              {chartSeries.map((s) => (
                <Table.Th key={s.name}>{s.name}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <Title>Wise GeoGuessr results</Title>
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
        series={chartSeries}
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
        series={chartSeries}
      />
    </Flex>
  );
};
