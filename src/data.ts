export const players = [
  'Glen',
  'Thomas',
  'Margaux',
  'Sigurd',
  'Thorjan',
  'Tor Arve',
  'Malin',
  'Eirik',
  'Lotte',
] as const;

export type Player = (typeof players)[number];

const data: ({ date: string } & Partial<Record<Player, number>>)[] = [
  {
    date: '2025-12-19',
    Thomas: 19075,
    Malin: 16642,
    Glen: 14050,
    Thorjan: 16865,
    Sigurd: 16114,
  },
  {
    date: '2025-12-12',
    Thomas: 16014,
    Malin: 12603,
    Glen: 13536,
    Lotte: 13410,
    Thorjan: 18645,
    'Tor Arve': 0,
    Sigurd: 7246,
  },
  {
    date: '2025-12-05',
    Thomas: 13840,
    Malin: 7101,
    Glen: 9885,
    Lotte: 5912,
    Thorjan: 10812,
    'Tor Arve': 10645,
    Sigurd: 10409,
  },
  {
    date: '2025-11-28',
    'Tor Arve': 10619,
    Thomas: 12233,
    Thorjan: 9356,
    Malin: 3848,
    Eirik: 9053,
    Glen: 2022,
  },
  {
    date: '2025-11-14',
    'Tor Arve': 15924,
    Thomas: 17746,
    Thorjan: 18169,
    Sigurd: 12951,
    Malin: 19505,
    Eirik: 19535,
    Glen: 19105,
  },
  {
    date: '2025-11-07',
    'Tor Arve': 16312,
    Thomas: 12865,
    Thorjan: 9161,
    Sigurd: 7517,
    Malin: 7155,
    Eirik: 6169,
  },
  {
    date: '2025-10-31',
    Thomas: 14828,
    Eirik: 14349,
    Thorjan: 13433,
    Malin: 12887,
    'Tor Arve': 10751,
    Sigurd: 7935,
  },
  {
    date: '2025-10-17',
    Thomas: 13476,
    Thorjan: 11608,
    Malin: 12059,
    Glen: 18361,
    Sigurd: 14827,
    'Tor Arve': 20210,
    Eirik: 15598,
  },
  {
    date: '2025-10-10',
    Thomas: 14456,
    Thorjan: 16027,
    Malin: 10095,
    Glen: 10182,
    Sigurd: 5653,
    'Tor Arve': 15994,
    Eirik: 14926,
  },
  {
    date: '2025-09-26',
    Thomas: 8050,
    Thorjan: 8816,
    Malin: 7181,
    Glen: 12268,
    'Tor Arve': 8483,
  },
  {
    date: '2025-09-19',
    Thomas: 14987,
    Thorjan: 16128,
    Malin: 9546,
    Sigurd: 9038,
    Glen: 13208,
    'Tor Arve': 10706,
  },
  {
    date: '2025-09-12',
    Thomas: 15763,
    Thorjan: 15100,
    Malin: 13233,
    Sigurd: 13762,
    Glen: 11489,
    'Tor Arve': 13968,
    Margaux: 15743,
  },
  {
    date: '2025-09-05',
    Thomas: 21190,
    Thorjan: 14541,
    Malin: 7261,
    Sigurd: 6178,
    Glen: 15915,
    'Tor Arve': 9896,
  },
  {
    date: '2025-08-29',
    Thomas: 20613,
    Thorjan: 17042,
    Malin: 13386,
    Sigurd: 12898,
    'Tor Arve': 10240,
  },
  {
    date: '2025-08-22',
    Thomas: 8863,
    Malin: 7910,
    Thorjan: 5967,
    Sigurd: 5331,
    'Tor Arve': 5034,
  },
  {
    date: '2025-08-14',
    Thomas: 14095,
    Margaux: 12871,
    Thorjan: 14473,
    'Tor Arve': 16943,
    Sigurd: 17296,
  },
  {
    date: '2025-08-08',
    Thomas: 17472,
    Margaux: 7909,
    Thorjan: 12731,
    'Tor Arve': 14464,
    Sigurd: 8585,
  },
  {
    date: '2025-08-01',
    Glen: 7332,
    Thomas: 9290,
    Thorjan: 7287,
    'Tor Arve': 8591,
    Sigurd: 6197,
  },
  {
    date: '2025-06-27',
    Glen: 6795,
    Thomas: 12356,
    'Tor Arve': 10774,
    Sigurd: 373,
  },
  {
    date: '2025-06-20',
    Glen: 11426,
    Thomas: 15835,
    Thorjan: 12917,
    'Tor Arve': 17891,
    Sigurd: 9051,
  },
  {
    date: '2025-06-06',
    Glen: 10881,
    Thomas: 15818,
    Thorjan: 14737,
    'Tor Arve': 14206,
  },
  {
    date: '2025-05-30',
    Glen: 10292,
    Thomas: 8660,
    Thorjan: 10188,
    Sigurd: 5528,
  },
  {
    date: '2025-05-23',
    Glen: 8909,
    Thomas: 8540,
    Margaux: 13059,
    Thorjan: 16194,
    'Tor Arve': 8277,
    Sigurd: 3362,
  },
  {
    date: '2025-05-16',
    Glen: 15500,
    Thomas: 19693,
    'Tor Arve': 17038,
    Sigurd: 16174,
  },
  {
    date: '2025-05-09',
    Glen: 2887,
    Thomas: 13599,
    Margaux: 9751,
    Thorjan: 16319,
    'Tor Arve': 19665,
    Sigurd: 14034,
  },
  {
    date: '2025-05-02',
    Glen: 15924,
    Thomas: 20236,
    Thorjan: 17911,
    'Tor Arve': 15678,
  },
  {
    date: '2025-04-11',
    Glen: 9220,
    Thomas: 9553,
    Thorjan: 16244,
    'Tor Arve': 17601,
    Sigurd: 1865,
  },
  {
    date: '2025-03-28',
    Glen: 11680,
    Thomas: 7594,
    Thorjan: 16515,
    'Tor Arve': 10289,
    Sigurd: 13924,
  },
  {
    date: '2025-03-14',
    Thomas: 14036,
    Margaux: 19170,
    Thorjan: 13663,
    'Tor Arve': 15058,
    Sigurd: 8771,
  },
  {
    date: '2025-03-07',
    Glen: 8466,
    Thomas: 3132,
    Margaux: 7513,
    Thorjan: 6473,
    'Tor Arve': 7460,
    Sigurd: 2673,
  },
  {
    date: '2025-02-21',
    Glen: 8583,
    Thomas: 3305,
    Margaux: 6815,
    Thorjan: 11934,
    'Tor Arve': 10890,
  },
  {
    date: '2025-02-07',
    Glen: 13010,
    Thomas: 17557,
    Thorjan: 13868,
    'Tor Arve': 13993,
    Sigurd: 14360,
  },
  {
    date: '2025-01-31',
    Glen: 11267,
    Thomas: 13397,
    Margaux: 16044,
    Thorjan: 13521,
    'Tor Arve': 7100,
    Sigurd: 7006,
  },
  {
    date: '2025-01-17',
    Glen: 10902,
    Thomas: 14912,
    Margaux: 17455,
    Thorjan: 18254,
  },
  {
    date: '2025-01-10',
    Glen: 6977,
    Thomas: 7832,
    Margaux: 11496,
    Thorjan: 12130,
    'Tor Arve': 9762,
  },
  {
    date: '2024-12-06',
    Glen: 15675,
    Thomas: 12790,
    Margaux: 11038,
    Thorjan: 20633,
    'Tor Arve': 14877,
  },
  {
    date: '2024-11-29',
    Glen: 12320,
    Thomas: 7825,
    Margaux: 9324,
    Thorjan: 11426,
  },
  {
    date: '2024-11-22',
    Thomas: 8315,
    Margaux: 13558,
    Thorjan: 11363,
    'Tor Arve': 11847,
  },
];

const getWinner = (d: Record<string, unknown>) => {
  const entries = Object.entries(d).toSorted(([, a], [, b]) => {
    if (typeof a !== 'number' && typeof b !== 'number') return 0;
    if (typeof a !== 'number') return 1;
    if (typeof b !== 'number') return -1;
    return b - a;
  });
  return entries.at(0)?.[0];
};

/** An object containing a zero score for all players, used as a baseline */
const allZeros = Object.fromEntries(players.map((p) => [p, 0])) as Record<Player, number>;

export const playerData = data.map((v) => {
  const winner = getWinner(v);
  return { ...allZeros, ...v, winner };
});

/**
 * Get information about player performance on the basis of rounds they
 * actually played in
 */
export const getPerPlayedRoundDetails = () => {
  const base = { pointsPerPlayed: 0, roundsPlayed: 0, totalPoints: 0 };
  const details: {
    name: Player;
    /** Average number of points per round played */
    pointsPerPlayed: number;
    /** Total number of rounds played */
    roundsPlayed: number;
    /** Total number of points across all games */
    totalPoints: number;
  }[] = players.map((p) => ({ name: p, ...base }));
  for (const d of playerData) {
    for (const detail of details) {
      const points = d[detail.name];
      if (typeof points !== 'number') continue;
      if (points <= 0) continue;
      detail.totalPoints += points;
      detail.roundsPlayed += 1;
    }
  }

  for (const detail of details) {
    // Avoid dividing by zero in general
    if (detail.roundsPlayed === 0) continue;
    detail.pointsPerPlayed = Math.round(detail.totalPoints / detail.roundsPlayed);
  }

  return details.toSorted((a, b) => b.pointsPerPlayed - a.pointsPerPlayed);
};

export const getPlayerDetails = () => {
  const details: {
    name: Player;
    played: number;
    won: number;
    points: { name: string; date: string; total: number }[];
  }[] = players.map((p) => ({ name: p, won: 0, played: 0, points: [] }));

  const sortedData = playerData.toSorted(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const d of sortedData) {
    for (const [key, value] of Object.entries(d)) {
      const player = details.find((d) => d.name === key);
      if (!player) {
        continue;
      }

      if (player.name === d.winner) {
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

  details.sort((a, b) => b.won - a.won);

  return { details, points };
};
