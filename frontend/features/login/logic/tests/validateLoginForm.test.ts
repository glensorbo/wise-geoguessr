import { describe, test, expect, mock } from 'bun:test';

import { validateLoginForm } from '../validateLoginForm';

import type { AppDispatch } from '@frontend/redux/store';

const makeDispatch = () => mock(() => {}) as unknown as AppDispatch;

describe('validateLoginForm', () => {
  const valid = {
    email: 'user@example.com',
    password: 'secret',
    rememberMe: false,
  };

  describe('valid input', () => {
    test('returns true', () => {
      expect(validateLoginForm(makeDispatch(), valid)).toBe(true);
    });

    test('dispatches setLoginFormErrors with an empty object', () => {
      const dispatch = makeDispatch();
      validateLoginForm(dispatch, valid);
      const calls = (dispatch as any).mock.calls as Array<
        [{ payload: unknown }]
      >;
      expect(calls).toHaveLength(1);
      expect(calls[0]?.[0]?.payload).toEqual({});
    });
  });

  describe('invalid input', () => {
    test('returns false for an empty email', () => {
      expect(validateLoginForm(makeDispatch(), { ...valid, email: '' })).toBe(
        false,
      );
    });

    test('returns false for an invalid email format', () => {
      expect(
        validateLoginForm(makeDispatch(), { ...valid, email: 'not-an-email' }),
      ).toBe(false);
    });

    test('returns false for an empty password', () => {
      expect(
        validateLoginForm(makeDispatch(), { ...valid, password: '' }),
      ).toBe(false);
    });

    test('dispatches field-level errors on failure', () => {
      const dispatch = makeDispatch();
      validateLoginForm(dispatch, { ...valid, email: '', password: '' });
      const calls = (dispatch as any).mock.calls as Array<
        [{ payload: Record<string, string> }]
      >;
      expect(calls).toHaveLength(1);
      expect(calls[0]?.[0]?.payload.email).toBeTruthy();
      expect(calls[0]?.[0]?.payload.password).toBeTruthy();
    });

    test('only the first error per field is dispatched', () => {
      const dispatch = makeDispatch();
      validateLoginForm(dispatch, { ...valid, email: '' });
      const calls = (dispatch as any).mock.calls as Array<
        [{ payload: Record<string, string> }]
      >;
      expect(typeof calls[0]?.[0]?.payload.email).toBe('string');
    });
  });
});
