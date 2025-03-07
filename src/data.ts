export type Player = 'Glen' | 'Thomas' | 'Margaux' | 'Sigurd' | 'Thorjan' | 'Tor Arve' | 'Trond';

export const data: Record<'date' | Player | 'Winner', string | number>[] = [
  {
    date: '2025-03-07',
    Glen: 8466,
    Thomas: 3132,
    Margaux: 7513,
    Thorjan: 6473,
    'Tor Arve': 7460,
    Sigurd: 2673,
    Trond: 0,
    Winner: 'Glen',
  },
  {
    date: '2025-02-21',
    Glen: 8583,
    Thomas: 3305,
    Margaux: 6815,
    Thorjan: 11934,
    'Tor Arve': 10890,
    Sigurd: 0,
    Trond: 0,
    Winner: 'Thorjan',
  },
  {
    date: '2025-02-07',
    Glen: 13010,
    Thomas: 17557,
    Margaux: 0,
    Thorjan: 13868,
    'Tor Arve': 13993,
    Sigurd: 14360,
    Trond: 8134,
    Winner: 'Thomas',
  },
  {
    date: '2025-01-31',
    Glen: 11267,
    Thomas: 13397,
    Margaux: 16044,
    Thorjan: 13521,
    'Tor Arve': 7100,
    Sigurd: 7006,
    Trond: 0,
    Winner: 'Margaux',
  },
  {
    date: '2025-01-17',
    Glen: 10902,
    Thomas: 14912,
    Margaux: 17455,
    Thorjan: 18254,
    'Tor Arve': 0,
    Sigurd: 0,
    Trond: 0,
    Winner: 'Thorjan',
  },
  {
    date: '2025-01-10',
    Glen: 6977,
    Thomas: 7832,
    Margaux: 11496,
    Thorjan: 12130,
    'Tor Arve': 9762,
    Sigurd: 0,
    Trond: 0,
    Winner: 'Daniel',
  },
  {
    date: '2024-12-06',
    Glen: 15675,
    Thomas: 12790,
    Margaux: 11038,
    Thorjan: 20633,
    'Tor Arve': 14877,
    Sigurd: 0,
    Trond: 0,
    Winner: 'Thorjan',
  },
  {
    date: '2024-11-29',
    Glen: 12320,
    Thomas: 7825,
    Margaux: 9324,
    Thorjan: 11426,
    'Tor Arve': 0,
    Sigurd: 0,
    Trond: 0,
    Winner: 'Glen',
  },
  {
    date: '2024-11-22',
    Glen: 0,
    Thomas: 8315,
    Margaux: 13558,
    Thorjan: 11363,
    'Tor Arve': 11847,
    Sigurd: 0,
    Trond: 0,
    Winner: 'Margaux',
  },
];

export const getPlayerDetails = () => {
  const details: {
    name: string;
    played: number;
    won: number;
    points: { name: string; date: string; total: number }[];
  }[] = [
    { name: 'Glen', won: 0, played: 0, points: [] },
    { name: 'Thomas', won: 0, played: 0, points: [] },
    { name: 'Thorjan', won: 0, played: 0, points: [] },
    { name: 'Margaux', won: 0, played: 0, points: [] },
    { name: 'Tor Arve', won: 0, played: 0, points: [] },
    { name: 'Trond', won: 0, played: 0, points: [] },
    { name: 'Sigurd', won: 0, played: 0, points: [] },
  ];
  for (const d of data.toSorted(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )) {
    for (const [key, value] of Object.entries(d)) {
      const player = details.find((d) => d.name === key);
      if (!player) {
        continue;
      }

      if (player.name === d.Winner) {
        player.won += 1;
      }

      if (typeof value === 'number' && value > 0) {
        player.played += 1;
      }

      const currentPoints = player.points.at(-1)?.total ?? 0;

      if (typeof value === 'number' && typeof d.date === 'string') {
        player.points.push({ name: player.name, date: d.date, total: currentPoints + value });
      }
    }
  }

  const points: Record<string, string | number>[] = [];

  for (const player of details) {
    for (const score of player.points) {
      const date = points.find((p) => p.date === score.date);

      if (date) {
        date[player.name] = score.total;
      } else {
        points.push({
          date: score.date,
          [player.name]: score.total,
        });
      }
    }
  }

  return { details, points };
};
