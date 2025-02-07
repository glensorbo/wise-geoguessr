import { BarChart, LineChart } from '@mantine/charts';
import { Flex, Table, TableScrollContainer, Title } from '@mantine/core';
import { data, getPlayerDetails } from '@/data';

export const HomePage = () => {
  const { details, points } = getPlayerDetails();

  const rows = data.map((el) => (
    <Table.Tr key={el.date}>
      <Table.Th>{el.date}</Table.Th>
      <Table.Th>{el.Glen}</Table.Th>
      <Table.Th>{el.Margaux}</Table.Th>
      <Table.Th>{el.Sigurd}</Table.Th>
      <Table.Th>{el.Thomas}</Table.Th>
      <Table.Th>{el.Thorjan}</Table.Th>
      <Table.Th>{el['Tor Arve']}</Table.Th>
      <Table.Th>{el.Trond}</Table.Th>
    </Table.Tr>
  ));
  return (
    <Flex align="center" justify="center" direction="column" gap={50} pt={50}>
      <Title>Points</Title>
      <TableScrollContainer minWidth="75vw" mah="40vh">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Glen</Table.Th>
              <Table.Th>Margaux</Table.Th>
              <Table.Th>Sigurd</Table.Th>
              <Table.Th>Thomas</Table.Th>
              <Table.Th>Thorjan</Table.Th>
              <Table.Th>Tor Arve</Table.Th>
              <Table.Th>Trond</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </TableScrollContainer>
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
        series={[
          { name: 'Glen', color: 'pink.6' },
          { name: 'Thorjan', color: 'red.6' },
          { name: 'Thomas', color: 'lime.6' },
          { name: 'Margaux', color: 'indigo.6' },
          { name: 'Tor Arve', color: 'orange.6' },
          { name: 'Trond', color: 'yellow.6' },
          { name: 'Sigurd', color: 'violet.6' },
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
          { name: 'Trond', color: 'yellow.6' },
          { name: 'Sigurd', color: 'violet.6' },
        ].toSorted((a, b) => a.name.localeCompare(b.name))}
      />
    </Flex>
  );
};
