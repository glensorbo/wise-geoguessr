import { test, expect } from '@playwright/test';

import { test as authedTest } from '../fixtures';

// ---------------------------------------------------------------------------
// GET /api/results/years — public
// ---------------------------------------------------------------------------

test.describe('GET /api/results/years', () => {
  test('returns 200 with an array of year numbers', async ({ request }) => {
    const res = await request.get('/api/results/years');
    expect(res.status()).toBe(200);

    const body = (await res.json()) as { data: unknown };
    expect(Array.isArray(body.data)).toBe(true);

    // Each element must be a number if the array is non-empty
    const years = body.data as number[];
    for (const y of years) {
      expect(typeof y).toBe('number');
      expect(y).toBeGreaterThanOrEqual(2000);
    }
  });

  test('does not require authentication', async ({ request }) => {
    const res = await request.get('/api/results/years');
    expect(res.status()).not.toBe(401);
    expect(res.status()).not.toBe(403);
  });
});

// ---------------------------------------------------------------------------
// GET /api/results — public (optional ?year= filter)
// ---------------------------------------------------------------------------

test.describe('GET /api/results', () => {
  test('returns 200 with an array', async ({ request }) => {
    const res = await request.get('/api/results');
    expect(res.status()).toBe(200);

    const body = (await res.json()) as { data: unknown };
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('accepts a valid year query param and returns 200', async ({
    request,
  }) => {
    const res = await request.get('/api/results?year=2024');
    expect(res.status()).toBe(200);

    const body = (await res.json()) as { data: unknown };
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('returns 400 for an invalid year param', async ({ request }) => {
    const res = await request.get('/api/results?year=not-a-year');
    expect(res.status()).toBe(400);
  });

  test('does not require authentication', async ({ request }) => {
    const res = await request.get('/api/results');
    expect(res.status()).not.toBe(401);
    expect(res.status()).not.toBe(403);
  });

  test('result objects have date and scores properties', async ({
    request,
  }) => {
    const res = await request.get('/api/results');
    expect(res.status()).toBe(200);

    const body = (await res.json()) as {
      data: Array<{ date: string; scores: Record<string, number> }>;
    };
    for (const result of body.data) {
      expect(typeof result.date).toBe('string');
      expect(result.scores).toBeDefined();
      expect(typeof result.scores).toBe('object');
    }
  });
});

// ---------------------------------------------------------------------------
// POST /api/results — requires auth
// ---------------------------------------------------------------------------

test.describe('POST /api/results — unauthenticated', () => {
  test('returns 401 without a token', async ({ request }) => {
    const res = await request.post('/api/results', {
      data: {
        date: '2099-06-15',
        scores: { TestPlayer: 5000 },
      },
    });
    expect(res.status()).toBe(401);
  });
});

authedTest.describe('POST /api/results — authenticated', () => {
  // Generate a unique far-future date for each test run to avoid 409 conflicts
  const uniqueDate = () => {
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    return `2098-${month}-${day}`;
  };

  authedTest(
    'returns 201 when given valid date and scores',
    async ({ authedRequest }) => {
      const date = uniqueDate();
      const res = await authedRequest.post('/api/results', {
        data: {
          date,
          scores: { E2EPlayer: 12000 },
        },
      });
      expect(res.status()).toBe(201);

      const body = (await res.json()) as { data: unknown };
      expect(body.data).toBeDefined();
    },
  );

  authedTest(
    'returns 409 when posting a duplicate date',
    async ({ authedRequest }) => {
      const date = uniqueDate();

      // First POST — must succeed
      const first = await authedRequest.post('/api/results', {
        data: { date, scores: { E2EPlayer: 12000 } },
      });
      expect(first.status()).toBe(201);

      // Second POST with the same date — must conflict
      const second = await authedRequest.post('/api/results', {
        data: { date, scores: { E2EPlayer: 9000 } },
      });
      expect(second.status()).toBe(409);
    },
  );

  authedTest(
    'returns 400 when the request body is missing a date',
    async ({ authedRequest }) => {
      const res = await authedRequest.post('/api/results', {
        data: { scores: { E2EPlayer: 5000 } },
      });
      expect(res.status()).toBe(400);
    },
  );

  authedTest(
    'returns 400 when scores is an empty object',
    async ({ authedRequest }) => {
      const res = await authedRequest.post('/api/results', {
        data: { date: '2097-01-01', scores: {} },
      });
      expect(res.status()).toBe(400);
    },
  );

  authedTest(
    'returns 400 when the date format is invalid',
    async ({ authedRequest }) => {
      const res = await authedRequest.post('/api/results', {
        data: { date: '01-01-2097', scores: { E2EPlayer: 5000 } },
      });
      expect(res.status()).toBe(400);
    },
  );

  authedTest(
    'returns 400 when a score value is negative',
    async ({ authedRequest }) => {
      const res = await authedRequest.post('/api/results', {
        data: { date: '2097-02-01', scores: { E2EPlayer: -100 } },
      });
      expect(res.status()).toBe(400);
    },
  );
});
