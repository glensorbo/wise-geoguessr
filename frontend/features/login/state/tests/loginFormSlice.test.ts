import { describe, test, expect } from 'bun:test';

import {
  loginFormSlice,
  setLoginFormField,
  setLoginFormErrors,
  clearLoginForm,
} from '../loginFormSlice';

const { reducer } = loginFormSlice;

const initialState = {
  email: '',
  password: '',
  rememberMe: false,
  errors: {},
};

describe('loginFormSlice', () => {
  describe('initial state', () => {
    test('email is empty string', () => {
      expect(reducer(undefined, { type: '@@INIT' }).email).toBe('');
    });

    test('password is empty string', () => {
      expect(reducer(undefined, { type: '@@INIT' }).password).toBe('');
    });

    test('rememberMe is false', () => {
      expect(reducer(undefined, { type: '@@INIT' }).rememberMe).toBe(false);
    });

    test('errors is an empty object', () => {
      expect(reducer(undefined, { type: '@@INIT' }).errors).toEqual({});
    });
  });

  describe('setLoginFormField', () => {
    test('updates the email field', () => {
      const state = reducer(undefined, setLoginFormField({ email: 'a@b.com' }));
      expect(state.email).toBe('a@b.com');
    });

    test('updates the password field', () => {
      const state = reducer(
        undefined,
        setLoginFormField({ password: 'secret' }),
      );
      expect(state.password).toBe('secret');
    });

    test('updates the rememberMe field', () => {
      const state = reducer(undefined, setLoginFormField({ rememberMe: true }));
      expect(state.rememberMe).toBe(true);
    });

    test('partial update does not reset other fields', () => {
      const withEmail = reducer(
        undefined,
        setLoginFormField({ email: 'a@b.com' }),
      );
      const withPassword = reducer(
        withEmail,
        setLoginFormField({ password: 'pw' }),
      );
      expect(withPassword.email).toBe('a@b.com');
      expect(withPassword.password).toBe('pw');
    });

    test('can update multiple fields at once', () => {
      const state = reducer(
        undefined,
        setLoginFormField({ email: 'x@y.com', rememberMe: true }),
      );
      expect(state.email).toBe('x@y.com');
      expect(state.rememberMe).toBe(true);
    });
  });

  describe('setLoginFormErrors', () => {
    test('sets an email error', () => {
      const state = reducer(
        undefined,
        setLoginFormErrors({ email: 'Invalid email' }),
      );
      expect(state.errors.email).toBe('Invalid email');
    });

    test('sets a password error', () => {
      const state = reducer(
        undefined,
        setLoginFormErrors({ password: 'Required' }),
      );
      expect(state.errors.password).toBe('Required');
    });

    test('replaces existing errors entirely', () => {
      const withErrors = reducer(
        undefined,
        setLoginFormErrors({ email: 'Bad', password: 'Bad' }),
      );
      const replaced = reducer(
        withErrors,
        setLoginFormErrors({ email: 'Only email' }),
      );
      expect(replaced.errors.email).toBe('Only email');
      expect(replaced.errors.password).toBeUndefined();
    });

    test('clearing errors sets an empty object', () => {
      const withErrors = reducer(
        undefined,
        setLoginFormErrors({ email: 'Bad' }),
      );
      const cleared = reducer(withErrors, setLoginFormErrors({}));
      expect(cleared.errors).toEqual({});
    });
  });

  describe('clearLoginForm', () => {
    test('resets all fields to initial state', () => {
      const dirty = reducer(
        undefined,
        setLoginFormField({
          email: 'a@b.com',
          password: 'pw',
          rememberMe: true,
        }),
      );
      const withErrors = reducer(dirty, setLoginFormErrors({ email: 'Bad' }));
      const cleared = reducer(withErrors, clearLoginForm());
      expect(cleared).toEqual(initialState);
    });
  });
});
