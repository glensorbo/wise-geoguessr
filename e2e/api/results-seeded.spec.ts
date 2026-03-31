/**
 * API tests for GET /api/results and GET /api/results/years that rely on the
 * 48 canonical game records seeded in global-setup.ts.
 *
 * These tests verify exact counts, ordering, content, and year-filtering
 * behaviour that can only be asserted reliably with a known dataset.
 */

import { test, expect } from '@playwright/test';

import { test as authedTest } from '../fixtures';

test.describe.configure({ mode: 'serial' });

// ---------------------------------------------------------------------------
// Seeded dataset constants (mirrors seed-game-data.ts)
// ---------------------------------------------------------------------------

const TOTAL_RECORDS = 48;
const YEAR_2024_COUNT = 3; // 2024-11-22, 2024-11-29, 2024-12-06
const YEAR_2025_COUNT = 35;
const YEAR_2026_COUNT = 10;

const MOST_RECENT_DATE = '2026-03-27';
const OLDEST_DATE = '2024-11-22';

// Known record used for content assertions
const KNOWN_RECORD = {
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
};

// A record known to contain a score of 0 (valid edge case)
const ZERO_SCORE_RECORD = {
  date: '2025-12-12',
  player: 'Tor Arve',
  score: 0,
};

// ---------------------------------------------------------------------------
// GET /api/results/years — exact years from seeded data
// ---------------------------------------------------------------------------

test.describe('GET /api/results/years — seeded data', () => {
  test('returns exactly [2026, 2025, 2024] in descending order', async ({
    request,
  }) => {
    const res = await request.get('/api/results/years');
    expect(res.status()).toBe(200);

    const body = (await res.json()) as { data: number[] };
    expect(body.data).toEqual([2026, 2025, 2024]);
  });

  test('returns exactly 3 distinct years', async ({ request }) => {
    const res = await request.get('/api/results/years');
    const body = (await res.json()) as { data: number[] };
    expect(body.data).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// GET /api/results — all records
// ---------------------------------------------------------------------------

test.describe('GET /api/results — all seeded records', () => {
  test(`returns exactly ${TOTAL_RECORDS} records`, async ({ request }) => {
    const res = await request.get('/api/results');
    expect(res.status()).toBe(200);

    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    expect(body.data).toHaveLength(TOTAL_RECORDS);
  });

  test('results are sorted by date descending (newest first)', async ({
    request,
  }) => {
    const res = await request.get('/api/results');
    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };

    const dates = body.data.map((r) => r.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  test(`most recent record is ${MOST_RECENT_DATE}`, async ({ request }) => {
    const res = await request.get('/api/results');
    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    expect(body.data[0]?.date).toBe(MOST_RECENT_DATE);
  });

  test(`oldest record is ${OLDEST_DATE}`, async ({ request }) => {
    const res = await request.get('/api/results');
    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    const last = body.data.at(-1);
    expect(last?.date).toBe(OLDEST_DATE);
  });

  test('all dates are in YYYY-MM-DD format', async ({ request }) => {
    const res = await request.get('/api/results');
    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const result of body.data) {
      expect(result.date).toMatch(dateRegex);
    }
  });

  test('all score values are non-negative integers', async ({ request }) => {
    const res = await request.get('/api/results');
    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    for (const result of body.data) {
      for (const score of Object.values(result.scores)) {
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(score)).toBe(true);
      }
    }
  });

  test('score of 0 is present and valid (edge case from seed data)', async ({
    request,
  }) => {
    const res = await request.get('/api/results');
    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    const record = body.data.find((r) => r.date === ZERO_SCORE_RECORD.date);
    expect(record).toBeDefined();
    expect(record?.scores[ZERO_SCORE_RECORD.player]).toBe(
      ZERO_SCORE_RECORD.score,
    );
  });

  test('each record has at least one score', async ({ request }) => {
    const res = await request.get('/api/results');
    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    for (const result of body.data) {
      expect(Object.keys(result.scores).length).toBeGreaterThanOrEqual(1);
    }
  });

  test('known record has correct scores', async ({ request }) => {
    const res = await request.get('/api/results');
    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    const record = body.data.find((r) => r.date === KNOWN_RECORD.date);
    expect(record).toBeDefined();
    for (const [player, score] of Object.entries(KNOWN_RECORD.scores)) {
      expect(record?.scores[player]).toBe(score);
    }
  });
});

// ---------------------------------------------------------------------------
// GET /api/results?year=N — filtered counts
// ---------------------------------------------------------------------------

test.describe('GET /api/results?year=N — year filtering', () => {
  test(`?year=2024 returns exactly ${YEAR_2024_COUNT} records`, async ({
    request,
  }) => {
    const res = await request.get('/api/results?year=2024');
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(YEAR_2024_COUNT);
  });

  test(`?year=2025 returns exactly ${YEAR_2025_COUNT} records`, async ({
    request,
  }) => {
    const res = await request.get('/api/results?year=2025');
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(YEAR_2025_COUNT);
  });

  test(`?year=2026 returns exactly ${YEAR_2026_COUNT} records`, async ({
    request,
  }) => {
    const res = await request.get('/api/results?year=2026');
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(YEAR_2026_COUNT);
  });

  test('?year=2099 returns an empty array (no data for that year)', async ({
    request,
  }) => {
    const res = await request.get('/api/results?year=2099');
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(0);
  });

  test('?year=2024 only returns records with 2024 dates', async ({
    request,
  }) => {
    const res = await request.get('/api/results?year=2024');
    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    for (const result of body.data) {
      expect(result.date.startsWith('2024-')).toBe(true);
    }
  });

  test('?year=2025 only returns records with 2025 dates', async ({
    request,
  }) => {
    const res = await request.get('/api/results?year=2025');
    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    for (const result of body.data) {
      expect(result.date.startsWith('2025-')).toBe(true);
    }
  });

  test('?year=2026 includes the most recent seeded date', async ({
    request,
  }) => {
    const res = await request.get('/api/results?year=2026');
    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    const dates = body.data.map((r) => r.date);
    expect(dates).toContain(MOST_RECENT_DATE);
  });

  test('?year=2024 includes all 3 known 2024 dates', async ({ request }) => {
    const res = await request.get('/api/results?year=2024');
    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    const dates = body.data.map((r) => r.date);
    expect(dates).toContain('2024-11-22');
    expect(dates).toContain('2024-11-29');
    expect(dates).toContain('2024-12-06');
  });
});

// ---------------------------------------------------------------------------
// POST /api/results — side-effect tests (add + verify round-trip)
// ---------------------------------------------------------------------------

authedTest.describe('POST /api/results — round-trip verification', () => {
  const FAR_FUTURE_DATE = '2098-07-04';

  authedTest(
    'newly created record appears in GET /api/results',
    async ({ authedRequest }) => {
      const scores = { E2EPlayer1: 15000, E2EPlayer2: 12000 };

      const post = await authedRequest.post('/api/results', {
        data: { date: FAR_FUTURE_DATE, scores },
      });
      expect(post.status()).toBe(201);

      const get = await authedRequest.get('/api/results');
      const body = (await get.json()) as {
        data: Array<{ date: string; scores: Record<string, number> }>;
      };
      const record = body.data.find((r) => r.date === FAR_FUTURE_DATE);
      expect(record).toBeDefined();
      expect(record?.scores['E2EPlayer1']).toBe(15000);
      expect(record?.scores['E2EPlayer2']).toBe(12000);
    },
  );

  authedTest(
    'newly created record appears in GET /api/results?year=2098',
    async ({ authedRequest }) => {
      const get = await authedRequest.get('/api/results?year=2098');
      const body = (await get.json()) as {
        data: Array<{ date: string; scores: Record<string, number> }>;
      };
      const record = body.data.find((r) => r.date === FAR_FUTURE_DATE);
      expect(record).toBeDefined();
    },
  );

  authedTest(
    'year 2098 appears in GET /api/results/years after posting to it',
    async ({ authedRequest }) => {
      const years = await authedRequest.get('/api/results/years');
      const body = (await years.json()) as { data: number[] };
      expect(body.data).toContain(2098);
    },
  );

  authedTest(
    'posting to a seeded date returns 409 conflict',
    async ({ authedRequest }) => {
      const res = await authedRequest.post('/api/results', {
        data: {
          date: KNOWN_RECORD.date,
          scores: { SomePlayer: 5000 },
        },
      });
      expect(res.status()).toBe(409);
    },
  );

  authedTest(
    'total count increases by 1 after a successful POST',
    async ({ authedRequest }) => {
      const before = await authedRequest.get('/api/results');
      const beforeBody = (await before.json()) as { data: unknown[] };
      const countBefore = beforeBody.data.length;

      // Use a separate unique date that definitely does not exist yet
      const uniqueDate = '2098-07-05';
      const post = await authedRequest.post('/api/results', {
        data: { date: uniqueDate, scores: { CountTest: 9999 } },
      });
      expect(post.status()).toBe(201);

      const after = await authedRequest.get('/api/results');
      const afterBody = (await after.json()) as { data: unknown[] };
      expect(afterBody.data.length).toBe(countBefore + 1);
    },
  );

  authedTest(
    'score of 0 is accepted and stored correctly',
    async ({ authedRequest }) => {
      const res = await authedRequest.post('/api/results', {
        data: { date: '2098-07-06', scores: { ZeroScorePlayer: 0 } },
      });
      expect(res.status()).toBe(201);

      const get = await authedRequest.get('/api/results?year=2098');
      const body = (await get.json()) as {
        data: Array<{ date: string; scores: Record<string, number> }>;
      };
      const record = body.data.find((r) => r.date === '2098-07-06');
      expect(record?.scores['ZeroScorePlayer']).toBe(0);
    },
  );

  authedTest(
    'record with many players is stored and retrieved correctly',
    async ({ authedRequest }) => {
      const manyScores: Record<string, number> = {
        Glen: 18000,
        Thorjan: 17000,
        Thomas: 16000,
        'Tor Arve': 15000,
        Sigurd: 14000,
        Malin: 13000,
        Lotte: 12000,
        Margaux: 11000,
        Eirik: 10000,
      };

      const post = await authedRequest.post('/api/results', {
        data: { date: '2098-07-07', scores: manyScores },
      });
      expect(post.status()).toBe(201);

      const get = await authedRequest.get('/api/results?year=2098');
      const body = (await get.json()) as {
        data: Array<{ date: string; scores: Record<string, number> }>;
      };
      const record = body.data.find((r) => r.date === '2098-07-07');
      expect(record).toBeDefined();
      expect(Object.keys(record?.scores ?? {})).toHaveLength(
        Object.keys(manyScores).length,
      );
      for (const [player, score] of Object.entries(manyScores)) {
        expect(record?.scores[player]).toBe(score);
      }
    },
  );
});
