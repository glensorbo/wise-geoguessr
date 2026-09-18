import { describe, expect, test } from 'bun:test';

import {
  setDesktopSidebarCollapsed,
  sidebarSlice,
  toggleDesktopSidebar,
} from '../sidebarSlice';

const { reducer } = sidebarSlice;

describe('sidebarSlice', () => {
  describe('initial state', () => {
    test('desktopCollapsed defaults to false', () => {
      const state = reducer(undefined, { type: '@@INIT' });
      expect(state.desktopCollapsed).toBe(false);
    });
  });

  describe('setDesktopSidebarCollapsed', () => {
    test('sets desktopCollapsed to true', () => {
      const state = reducer(undefined, setDesktopSidebarCollapsed(true));
      expect(state.desktopCollapsed).toBe(true);
    });

    test('sets desktopCollapsed to false', () => {
      const state = reducer(
        { desktopCollapsed: true },
        setDesktopSidebarCollapsed(false),
      );
      expect(state.desktopCollapsed).toBe(false);
    });
  });

  describe('toggleDesktopSidebar', () => {
    test('toggles from expanded to collapsed', () => {
      const state = reducer(
        { desktopCollapsed: false },
        toggleDesktopSidebar(),
      );
      expect(state.desktopCollapsed).toBe(true);
    });

    test('toggles from collapsed to expanded', () => {
      const state = reducer({ desktopCollapsed: true }, toggleDesktopSidebar());
      expect(state.desktopCollapsed).toBe(false);
    });
  });
});
