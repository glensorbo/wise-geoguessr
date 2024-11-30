import dayjs from 'dayjs';
import { LineChart } from '@mantine/charts';
import { Flex } from '@mantine/core';

export const HomePage = () => {
  const data: Record<string, any>[] = [
    {
      date: '2024-11-22',
      Glen: 0,
      Thomas: 8315,
      Margaux: 13558,
      Thorjan: 11363,
      'Tor Arve': 11847,
      Marta: 4707,
    },
    {
      date: '2024-11-29',
      Glen: 12320,
      Thomas: 7825,
      Margaux: 9324,
      Thorjan: 11426,
      'Tor Arve': 0,
      Marta: 0,
    },
  ];
  return (
    <Flex align="center" justify="center">
      <LineChart
        h={300}
        w="75%"
        data={data}
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
        ]}
      />
    </Flex>
  );
};
