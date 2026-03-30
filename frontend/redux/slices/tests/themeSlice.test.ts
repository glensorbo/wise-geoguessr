import { describe, test, expect } from 'bun:test';

import { themeSlice, setThemeMode } from '../themeSlice';

const { reducer } = themeSlice;

describe('themeSlice', () => {
  describe('initial state', () => {
    test('mode defaults to "system"', () => {
      const state = reducer(undefined, { type: '@@INIT' });
      expect(state.mode).toBe('system');
    });
  });

  describe('setThemeMode', () => {
    test('sets mode to "light"', () => {
      const state = reducer(undefined, setThemeMode('light'));
      expect(state.mode).toBe('light');
    });

    test('sets mode to "dark"', () => {
      const state = reducer(undefined, setThemeMode('dark'));
      expect(state.mode).toBe('dark');
    });

    test('sets mode to "system"', () => {
      const state = reducer({ mode: 'dark' }, setThemeMode('system'));
      expect(state.mode).toBe('system');
    });

    test('overwrites a previous mode', () => {
      const after = reducer({ mode: 'light' }, setThemeMode('dark'));
      expect(after.mode).toBe('dark');
    });
  });
});
