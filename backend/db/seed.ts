import { gameResultRepository } from '../repositories/gameResultRepository';
import { userRepository } from '../repositories/userRepository';

/**
 * Seed script — idempotent, safe to run multiple times.
 *
 * 1. Creates the initial admin user from env vars.
 * 2. Seeds all historical GeoGuessr game results.
 *
 * Env vars:
 *   SEED_ADMIN_EMAIL    (required)
 *   SEED_ADMIN_PASSWORD (required)
 *   SEED_ADMIN_NAME     (optional, defaults to "Admin")
 */

// ── Admin user ────────────────────────────────────────────────────────────────

const email = Bun.env.SEED_ADMIN_EMAIL;
const password = Bun.env.SEED_ADMIN_PASSWORD;
const name = Bun.env.SEED_ADMIN_NAME ?? 'Admin';

if (!email || !password) {
  console.error('❌ SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required');
  process.exit(1);
}

const existing = await userRepository.getByEmail(email);

if (existing) {
  console.log(`✅ Admin user already exists: ${email}`);
} else {
  const hashedPassword = await Bun.password.hash(password);
  await userRepository.create(email, name, hashedPassword, 'admin');
  console.log(`🌱 Admin user seeded: ${email}`);
}

// ── Historical game results ───────────────────────────────────────────────────

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
      Thorjan: 12814,
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
      Thorjan: 16079,
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
      Thorjan: 17845,
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
      Thorjan: 7236,
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
      Thorjan: 14578,
      Sigurd: 14498,
      'Tor Arve': 19156,
    },
  },
  {
    date: '2026-01-30',
    scores: {
      Thomas: 10963,
      Glen: 11757,
      Thorjan: 15597,
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
      Thorjan: 15848,
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
      Thorjan: 16566,
      Sigurd: 8432,
      'Tor Arve': 17761,
    },
  },
  {
    date: '2026-01-09',
    scores: {
      Thomas: 14491,
      Glen: 16423,
      Thorjan: 13327,
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
      Thorjan: 16865,
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
      Thorjan: 18645,
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
      Thorjan: 10812,
      'Tor Arve': 10645,
      Sigurd: 10409,
    },
  },
  {
    date: '2025-11-28',
    scores: {
      'Tor Arve': 10619,
      Thomas: 12233,
      Thorjan: 9356,
      Malin: 3848,
      Eirik: 9053,
      Glen: 2022,
    },
  },
  {
    date: '2025-11-14',
    scores: {
      'Tor Arve': 15924,
      Thomas: 17746,
      Thorjan: 18169,
      Sigurd: 12951,
      Malin: 19505,
      Eirik: 19535,
      Glen: 19105,
    },
  },
  {
    date: '2025-11-07',
    scores: {
      'Tor Arve': 16312,
      Thomas: 12865,
      Thorjan: 9161,
      Sigurd: 7517,
      Malin: 7155,
      Eirik: 6169,
    },
  },
  {
    date: '2025-10-31',
    scores: {
      Thomas: 14828,
      Eirik: 14349,
      Thorjan: 13433,
      Malin: 12887,
      'Tor Arve': 10751,
      Sigurd: 7935,
    },
  },
  {
    date: '2025-10-17',
    scores: {
      Thomas: 13476,
      Thorjan: 11608,
      Malin: 12059,
      Glen: 18361,
      Sigurd: 14827,
      'Tor Arve': 20210,
      Eirik: 15598,
    },
  },
  {
    date: '2025-10-10',
    scores: {
      Thomas: 14456,
      Thorjan: 16027,
      Malin: 10095,
      Glen: 10182,
      Sigurd: 5653,
      'Tor Arve': 15994,
      Eirik: 14926,
    },
  },
  {
    date: '2025-09-26',
    scores: {
      Thomas: 8050,
      Thorjan: 8816,
      Malin: 7181,
      Glen: 12268,
      'Tor Arve': 8483,
    },
  },
  {
    date: '2025-09-19',
    scores: {
      Thomas: 14987,
      Thorjan: 16128,
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
      Thorjan: 15100,
      Malin: 13233,
      Sigurd: 13762,
      Glen: 11489,
      'Tor Arve': 13968,
      Margaux: 15743,
    },
  },
  {
    date: '2025-09-05',
    scores: {
      Thomas: 21190,
      Thorjan: 14541,
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
      Thorjan: 17042,
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
      Thorjan: 5967,
      Sigurd: 5331,
      'Tor Arve': 5034,
    },
  },
  {
    date: '2025-08-14',
    scores: {
      Thomas: 14095,
      Margaux: 12871,
      Thorjan: 14473,
      'Tor Arve': 16943,
      Sigurd: 17296,
    },
  },
  {
    date: '2025-08-08',
    scores: {
      Thomas: 17472,
      Margaux: 7909,
      Thorjan: 12731,
      'Tor Arve': 14464,
      Sigurd: 8585,
    },
  },
  {
    date: '2025-08-01',
    scores: {
      Glen: 7332,
      Thomas: 9290,
      Thorjan: 7287,
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
      Thorjan: 12917,
      'Tor Arve': 17891,
      Sigurd: 9051,
    },
  },
  {
    date: '2025-06-06',
    scores: { Glen: 10881, Thomas: 15818, Thorjan: 14737, 'Tor Arve': 14206 },
  },
  {
    date: '2025-05-30',
    scores: { Glen: 10292, Thomas: 8660, Thorjan: 10188, Sigurd: 5528 },
  },
  {
    date: '2025-05-23',
    scores: {
      Glen: 8909,
      Thomas: 8540,
      Margaux: 13059,
      Thorjan: 16194,
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
      Margaux: 9751,
      Thorjan: 16319,
      'Tor Arve': 19665,
      Sigurd: 14034,
    },
  },
  {
    date: '2025-05-02',
    scores: { Glen: 15924, Thomas: 20236, Thorjan: 17911, 'Tor Arve': 15678 },
  },
  {
    date: '2025-04-11',
    scores: {
      Glen: 9220,
      Thomas: 9553,
      Thorjan: 16244,
      'Tor Arve': 17601,
      Sigurd: 1865,
    },
  },
  {
    date: '2025-03-28',
    scores: {
      Glen: 11680,
      Thomas: 7594,
      Thorjan: 16515,
      'Tor Arve': 10289,
      Sigurd: 13924,
    },
  },
  {
    date: '2025-03-14',
    scores: {
      Thomas: 14036,
      Margaux: 19170,
      Thorjan: 13663,
      'Tor Arve': 15058,
      Sigurd: 8771,
    },
  },
  {
    date: '2025-03-07',
    scores: {
      Glen: 8466,
      Thomas: 3132,
      Margaux: 7513,
      Thorjan: 6473,
      'Tor Arve': 7460,
      Sigurd: 2673,
    },
  },
  {
    date: '2025-02-21',
    scores: {
      Glen: 8583,
      Thomas: 3305,
      Margaux: 6815,
      Thorjan: 11934,
      'Tor Arve': 10890,
    },
  },
  {
    date: '2025-02-07',
    scores: {
      Glen: 13010,
      Thomas: 17557,
      Thorjan: 13868,
      'Tor Arve': 13993,
      Sigurd: 14360,
    },
  },
  {
    date: '2025-01-31',
    scores: {
      Glen: 11267,
      Thomas: 13397,
      Margaux: 16044,
      Thorjan: 13521,
      'Tor Arve': 7100,
      Sigurd: 7006,
    },
  },
  {
    date: '2025-01-17',
    scores: { Glen: 10902, Thomas: 14912, Margaux: 17455, Thorjan: 18254 },
  },
  {
    date: '2025-01-10',
    scores: {
      Glen: 6977,
      Thomas: 7832,
      Margaux: 11496,
      Thorjan: 12130,
      'Tor Arve': 9762,
    },
  },
  {
    date: '2024-12-06',
    scores: {
      Glen: 15675,
      Thomas: 12790,
      Margaux: 11038,
      Thorjan: 20633,
      'Tor Arve': 14877,
    },
  },
  {
    date: '2024-11-29',
    scores: { Glen: 12320, Thomas: 7825, Margaux: 9324, Thorjan: 11426 },
  },
  {
    date: '2024-11-22',
    scores: { Thomas: 8315, Margaux: 13558, Thorjan: 11363, 'Tor Arve': 11847 },
  },
] as const;

let seeded = 0;
let skipped = 0;

for (const result of HISTORICAL_RESULTS) {
  const exists = await gameResultRepository.getByDate(result.date);
  if (exists) {
    skipped++;
    continue;
  }
  await gameResultRepository.create(
    result.date,
    result.scores as Record<string, number>,
  );
  seeded++;
}

console.log(`🌍 Game results: ${seeded} seeded, ${skipped} already existed`);
process.exit(0);
