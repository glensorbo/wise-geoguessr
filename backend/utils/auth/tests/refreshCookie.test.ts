import { describe, test, expect } from 'bun:test';

import { buildRefreshCookie } from '../buildRefreshCookie';
import { clearRefreshCookie } from '../clearRefreshCookie';
import { readRefreshCookie } from '../readRefreshCookie';
import { refreshTokenConfig } from '../refreshTokenConfig';

const makeRequest = (cookieHeader: string | null): unknown => ({
  headers: {
    get: (name: string) =>
      name.toLowerCase() === 'cookie' ? cookieHeader : null,
  },
});

describe('buildRefreshCookie', () => {
  test('includes the token value', () => {
    const cookie = buildRefreshCookie('abc123');
    expect(cookie).toContain(`${refreshTokenConfig.cookieName}=abc123`);
  });

  test('is HttpOnly', () => {
    expect(buildRefreshCookie('tok')).toContain('HttpOnly');
  });

  test('is Secure', () => {
    expect(buildRefreshCookie('tok')).toContain('Secure');
  });

  test('is SameSite=Strict', () => {
    expect(buildRefreshCookie('tok')).toContain('SameSite=Strict');
  });

  test('is scoped to /api/auth', () => {
    expect(buildRefreshCookie('tok')).toContain('Path=/api/auth');
  });

  test('sets Max-Age to the correct TTL', () => {
    expect(buildRefreshCookie('tok')).toContain(
      `Max-Age=${refreshTokenConfig.ttlSeconds}`,
    );
  });
});

describe('clearRefreshCookie', () => {
  const cookie = clearRefreshCookie();

  test('sets Max-Age to 0', () => {
    expect(cookie).toContain('Max-Age=0');
  });

  test('uses the correct cookie name', () => {
    expect(cookie).toContain(`${refreshTokenConfig.cookieName}=`);
  });

  test('is HttpOnly', () => {
    expect(cookie).toContain('HttpOnly');
  });

  test('is scoped to /api/auth', () => {
    expect(cookie).toContain('Path=/api/auth');
  });
});

describe('readRefreshCookie', () => {
  test('returns the token when the cookie is present', () => {
    const req = makeRequest(
      `${refreshTokenConfig.cookieName}=mytoken123`,
    ) as never;
    expect(readRefreshCookie(req)).toBe('mytoken123');
  });

  test('returns the token when other cookies are also present', () => {
    const req = makeRequest(
      `other=value; ${refreshTokenConfig.cookieName}=mytoken456; another=x`,
    ) as never;
    expect(readRefreshCookie(req)).toBe('mytoken456');
  });

  test('returns null when the cookie is absent', () => {
    const req = makeRequest('other=value') as never;
    expect(readRefreshCookie(req)).toBeNull();
  });

  test('returns null when there is no Cookie header', () => {
    const req = makeRequest(null) as never;
    expect(readRefreshCookie(req)).toBeNull();
  });

  test('handles a token that contains equals signs', () => {
    const token = 'abc=def=ghi';
    const req = makeRequest(
      `${refreshTokenConfig.cookieName}=${token}`,
    ) as never;
    expect(readRefreshCookie(req)).toBe(token);
  });
});
