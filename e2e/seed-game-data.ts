/**
 * Wipes all game data (game_rounds CASCADE → game_scores) then re-seeds the
 * 48 canonical historical results.
 *
 * Idempotent — always ends in the exact 48-record state regardless of what
 * tests added or removed. Runs as a Bun subprocess via execSync so that
 * Bun-only APIs (getDb, Drizzle) are available.
 */

import { getDb } from '../backend/db/client';
import { gameRounds } from '../backend/db/schemas/gameRounds';
import { gameResultRepository } from '../backend/repositories/gameResultRepository';

const db = getDb();

// Wipe all game data — game_scores has CASCADE DELETE on game_rounds.id
await db.delete(gameRounds);
console.log('🗑️  All game data wiped');

const HISTORICAL_RESULTS = [
  {
    date: '2026-03-27',
    scores: {
      Lotte: 17108,
      Thomas: 15999,
      Glen: 12633,
      Sigurd: 11300,
      Malin: 11926,
      'Tor Arve': 11400,
    },
  },
  {
    date: '2026-03-13',
    scores: {
      Thomas: 15046,
      Glen: 16409,
      Sigurd: 15254,
      Malin: 20323,
      'Tor Arve': 18325,
    },
  },
  {
    date: '2026-03-06',
    scores: {
      Thomas: 13880,
      Glen: 6799,
      Sigurd: 5833,
      Malin: 6101,
      'Tor Arve': 9127,
    },
  },
  {
    date: '2026-02-27',
    scores: { Thomas: 11618, Glen: 8036, Sigurd: 9059, Lotte: 6729 },
  },
  {
    date: '2026-02-20',
    scores: {
      Thomas: 12592,
      Glen: 11054,
      Sigurd: 4397,
      'Tor Arve': 8696,
      Malin: 13716,
      Lotte: 5068,
    },
  },
  {
    date: '2026-02-13',
    scores: {
      Thomas: 17892,
      Glen: 9617,
      Sigurd: 14498,
      'Tor Arve': 19156,
    },
  },
  {
    date: '2026-01-30',
    scores: {
      Thomas: 10963,
      Glen: 11757,
      Sigurd: 9157,
      'Tor Arve': 13386,
      Lotte: 4854,
      Malin: 8142,
    },
  },
  {
    date: '2026-01-23',
    scores: {
      Thomas: 9470,
      Glen: 14049,
      Sigurd: 9857,
      'Tor Arve': 11341,
      Lotte: 10166,
    },
  },
  {
    date: '2026-01-16',
    scores: {
      Thomas: 11792,
      Glen: 12474,
      Sigurd: 8432,
      'Tor Arve': 17761,
    },
  },
  {
    date: '2026-01-09',
    scores: {
      Thomas: 14491,
      Glen: 16423,
      Sigurd: 9950,
      Lotte: 10383,
      'Tor Arve': 15589,
    },
  },
  {
    date: '2025-12-19',
    scores: {
      Thomas: 19075,
      Malin: 16642,
      Glen: 14050,
      Sigurd: 16114,
    },
  },
  {
    date: '2025-12-12',
    scores: {
      Thomas: 16014,
      Malin: 12603,
      Glen: 13536,
      Lotte: 13410,
      'Tor Arve': 0,
      Sigurd: 7246,
    },
  },
  {
    date: '2025-12-05',
    scores: {
      Thomas: 13840,
      Malin: 7101,
      Glen: 9885,
      Lotte: 5912,
      'Tor Arve': 10645,
      Sigurd: 10409,
    },
  },
  {
    date: '2025-11-28',
    scores: {
      'Tor Arve': 10619,
      Thomas: 12233,
      Malin: 3848,
      Glen: 2022,
    },
  },
  {
    date: '2025-11-14',
    scores: {
      'Tor Arve': 15924,
      Thomas: 17746,
      Sigurd: 12951,
      Malin: 19505,
      Glen: 19105,
    },
  },
  {
    date: '2025-11-07',
    scores: {
      'Tor Arve': 16312,
      Thomas: 12865,
      Sigurd: 7517,
      Malin: 7155,
    },
  },
  {
    date: '2025-10-31',
    scores: {
      Thomas: 14828,
      Malin: 12887,
      'Tor Arve': 10751,
      Sigurd: 7935,
    },
  },
  {
    date: '2025-10-17',
    scores: {
      Thomas: 13476,
      Malin: 12059,
      Glen: 18361,
      Sigurd: 14827,
      'Tor Arve': 20210,
    },
  },
  {
    date: '2025-10-10',
    scores: {
      Thomas: 14456,
      Malin: 10095,
      Glen: 10182,
      Sigurd: 5653,
      'Tor Arve': 15994,
    },
  },
  {
    date: '2025-09-26',
    scores: {
      Thomas: 8050,
      Malin: 7181,
      Glen: 12268,
      'Tor Arve': 8483,
    },
  },
  {
    date: '2025-09-19',
    scores: {
      Thomas: 14987,
      Malin: 9546,
      Sigurd: 9038,
      Glen: 13208,
      'Tor Arve': 10706,
    },
  },
  {
    date: '2025-09-12',
    scores: {
      Thomas: 15763,
      Malin: 13233,
      Sigurd: 13762,
      Glen: 11489,
      'Tor Arve': 13968,
      Emilie: 15743,
    },
  },
  {
    date: '2025-09-05',
    scores: {
      Thomas: 21190,
      Malin: 7261,
      Sigurd: 6178,
      Glen: 15915,
      'Tor Arve': 9896,
    },
  },
  {
    date: '2025-08-29',
    scores: {
      Thomas: 20613,
      Malin: 13386,
      Sigurd: 12898,
      'Tor Arve': 10240,
    },
  },
  {
    date: '2025-08-22',
    scores: {
      Thomas: 8863,
      Malin: 7910,
      Sigurd: 5331,
      'Tor Arve': 5034,
    },
  },
  {
    date: '2025-08-14',
    scores: {
      Thomas: 14095,
      Emilie: 12871,
      'Tor Arve': 16943,
      Sigurd: 17296,
    },
  },
  {
    date: '2025-08-08',
    scores: {
      Thomas: 17472,
      Emilie: 7909,
      'Tor Arve': 14464,
      Sigurd: 8585,
    },
  },
  {
    date: '2025-08-01',
    scores: {
      Glen: 7332,
      Thomas: 9290,
      'Tor Arve': 8591,
      Sigurd: 6197,
    },
  },
  {
    date: '2025-06-27',
    scores: { Glen: 6795, Thomas: 12356, 'Tor Arve': 10774, Sigurd: 373 },
  },
  {
    date: '2025-06-20',
    scores: {
      Glen: 11426,
      Thomas: 15835,
      'Tor Arve': 17891,
      Sigurd: 9051,
    },
  },
  {
    date: '2025-06-06',
    scores: { Glen: 10881, Thomas: 15818, 'Tor Arve': 14206 },
  },
  {
    date: '2025-05-30',
    scores: { Glen: 10292, Thomas: 8660, Sigurd: 5528 },
  },
  {
    date: '2025-05-23',
    scores: {
      Glen: 8909,
      Thomas: 8540,
      Emilie: 13059,
      'Tor Arve': 8277,
      Sigurd: 3362,
    },
  },
  {
    date: '2025-05-16',
    scores: { Glen: 15500, Thomas: 19693, 'Tor Arve': 17038, Sigurd: 16174 },
  },
  {
    date: '2025-05-09',
    scores: {
      Glen: 2887,
      Thomas: 13599,
      Emilie: 9751,
      'Tor Arve': 19665,
      Sigurd: 14034,
    },
  },
  {
    date: '2025-05-02',
    scores: { Glen: 15924, Thomas: 20236, 'Tor Arve': 15678 },
  },
  {
    date: '2025-04-11',
    scores: {
      Glen: 9220,
      Thomas: 9553,
      'Tor Arve': 17601,
      Sigurd: 1865,
    },
  },
  {
    date: '2025-03-28',
    scores: {
      Glen: 11680,
      Thomas: 7594,
      'Tor Arve': 10289,
      Sigurd: 13924,
    },
  },
  {
    date: '2025-03-14',
    scores: {
      Thomas: 14036,
      Emilie: 19170,
      'Tor Arve': 15058,
      Sigurd: 8771,
    },
  },
  {
    date: '2025-03-07',
    scores: {
      Glen: 8466,
      Thomas: 3132,
      Emilie: 7513,
      'Tor Arve': 7460,
      Sigurd: 2673,
    },
  },
  {
    date: '2025-02-21',
    scores: {
      Glen: 8583,
      Thomas: 3305,
      Emilie: 6815,
      'Tor Arve': 10890,
    },
  },
  {
    date: '2025-02-07',
    scores: {
      Glen: 13010,
      Thomas: 17557,
      'Tor Arve': 13993,
      Sigurd: 14360,
    },
  },
  {
    date: '2025-01-31',
    scores: {
      Glen: 11267,
      Thomas: 13397,
      Emilie: 16044,
      'Tor Arve': 7100,
      Sigurd: 7006,
    },
  },
  {
    date: '2025-01-17',
    scores: { Glen: 10902, Thomas: 14912, Emilie: 17455 },
  },
  {
    date: '2025-01-10',
    scores: {
      Glen: 6977,
      Thomas: 7832,
      Emilie: 11496,
      'Tor Arve': 9762,
    },
  },
  {
    date: '2024-12-06',
    scores: {
      Glen: 15675,
      Thomas: 12790,
      Emilie: 11038,
      'Tor Arve': 14877,
    },
  },
  {
    date: '2024-11-29',
    scores: { Glen: 12320, Thomas: 7825, Emilie: 9324 },
  },
  {
    date: '2024-11-22',
    scores: { Thomas: 8315, Emilie: 13558, 'Tor Arve': 11847 },
  },
] as const;

let count = 0;
for (const result of HISTORICAL_RESULTS) {
  await gameResultRepository.create(
    result.date,
    result.scores as Record<string, number>,
  );
  count++;
}

console.log(`🌍 ${count} game results seeded`);
process.exit(0);
