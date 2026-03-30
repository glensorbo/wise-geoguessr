import { describe, test, expect } from 'bun:test';

import {
  authSlice,
  setToken,
  clearToken,
  setRememberedEmail,
  selectIsAuthenticated,
} from '../authSlice';

const { reducer } = authSlice;

describe('authSlice', () => {
  describe('initial state', () => {
    test('token is null', () => {
      const state = reducer(undefined, { type: '@@INIT' });
      expect(state.token).toBeNull();
    });

    test('rememberedEmail is null', () => {
      const state = reducer(undefined, { type: '@@INIT' });
      expect(state.rememberedEmail).toBeNull();
    });
  });

  describe('setToken', () => {
    test('stores the provided token', () => {
      const state = reducer(undefined, setToken('abc.def.ghi'));
      expect(state.token).toBe('abc.def.ghi');
    });

    test('overwrites an existing token', () => {
      const first = reducer(undefined, setToken('old-token'));
      const second = reducer(first, setToken('new-token'));
      expect(second.token).toBe('new-token');
    });
  });

  describe('clearToken', () => {
    test('sets token back to null', () => {
      const withToken = reducer(undefined, setToken('some-token'));
      const cleared = reducer(withToken, clearToken());
      expect(cleared.token).toBeNull();
    });

    test('does not affect rememberedEmail', () => {
      const state = reducer(
        { token: 'tok', rememberedEmail: 'a@b.com' },
        clearToken(),
      );
      expect(state.rememberedEmail).toBe('a@b.com');
    });
  });

  describe('setRememberedEmail', () => {
    test('stores the provided email', () => {
      const state = reducer(undefined, setRememberedEmail('user@example.com'));
      expect(state.rememberedEmail).toBe('user@example.com');
    });

    test('can be set to null (forget me)', () => {
      const withEmail = reducer(
        undefined,
        setRememberedEmail('user@example.com'),
      );
      const cleared = reducer(withEmail, setRememberedEmail(null));
      expect(cleared.rememberedEmail).toBeNull();
    });

    test('does not affect token', () => {
      const state = reducer(
        { token: 'tok', rememberedEmail: null },
        setRememberedEmail('a@b.com'),
      );
      expect(state.token).toBe('tok');
    });
  });

  describe('selectIsAuthenticated', () => {
    test('returns false when token is null', () => {
      expect(
        selectIsAuthenticated({ auth: { token: null, rememberedEmail: null } }),
      ).toBe(false);
    });

    test('returns true when a token is present', () => {
      expect(
        selectIsAuthenticated({
          auth: { token: 'some-token', rememberedEmail: null },
        }),
      ).toBe(true);
    });
  });
});
