import { test, expect } from '@playwright/test';

test.describe('Healthcheck', () => {
  test('GET /healthcheck returns 200 OK', async ({ request }) => {
    const res = await request.get('/healthcheck');
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe('OK');
  });
});
