import { describe, test, expect, beforeEach } from 'bun:test';

import {
  loadSliceState,
  localStorageMiddleware,
} from '../localStorageMiddleware';

const STORAGE_KEY = 'redux_state';

beforeEach(() => {
  localStorage.clear();
});

describe('loadSliceState', () => {
  test('returns the fallback when localStorage is empty', () => {
    const result = loadSliceState('auth', { token: null });
    expect(result).toEqual({ token: null });
  });

  test('returns the fallback when the key is not in the stored state', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ theme: { mode: 'dark' } }),
    );
    const result = loadSliceState('auth', { token: null });
    expect(result).toEqual({ token: null });
  });

  test('returns the persisted value when the key exists', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ auth: { token: 'abc', rememberedEmail: null } }),
    );
    const result = loadSliceState<{
      token: string | null;
      rememberedEmail: string | null;
    }>('auth', { token: null, rememberedEmail: null });
    expect(result).toEqual({ token: 'abc', rememberedEmail: null });
  });

  test('returns the fallback when JSON is malformed', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json');
    const result = loadSliceState('auth', { token: null });
    expect(result).toEqual({ token: null });
  });
});

describe('localStorageMiddleware', () => {
  const buildStore = (state: Record<string, unknown>) => ({
    getState: () => state,
  });

  const next = (action: unknown) => action;

  test('persists whitelisted keys (auth, theme) to localStorage', () => {
    const store = buildStore({
      auth: { token: 'tok' },
      theme: { mode: 'dark' },
    });
    localStorageMiddleware(store as any)(next)({ type: 'test' });
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '{}',
    ) as Record<string, unknown>;
    expect(saved.auth).toEqual({ token: 'tok' });
    expect(saved.theme).toEqual({ mode: 'dark' });
  });

  test('does not persist non-whitelisted keys', () => {
    const store = buildStore({
      auth: { token: 'tok' },
      loginForm: { email: 'a@b.com' },
    });
    localStorageMiddleware(store as any)(next)({ type: 'test' });
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '{}',
    ) as Record<string, unknown>;
    expect(saved.loginForm).toBeUndefined();
  });

  test('passes the action through to next', () => {
    const store = buildStore({});
    const received: unknown[] = [];
    const capturingNext = (a: unknown) => {
      received.push(a);
      return a;
    };
    const action = { type: 'some/action' };
    localStorageMiddleware(store as any)(capturingNext)(action);
    expect(received).toEqual([action]);
  });
});
