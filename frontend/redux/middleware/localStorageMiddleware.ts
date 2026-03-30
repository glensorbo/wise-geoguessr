import type { Middleware } from '@reduxjs/toolkit';

/**
 * Keys of the Redux state that should be persisted to localStorage.
 * Add a key here whenever a new slice should survive page refreshes.
 */
const PERSISTED_KEYS = ['theme', 'auth'] as const;

const STORAGE_KEY = 'redux_state';

/**
 * Load a single slice's persisted state from localStorage.
 * Called from each slice's `initialState` to self-hydrate on startup.
 */
export const loadSliceState = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return (parsed[key] as T) ?? fallback;
  } catch {
    return fallback;
  }
};

/** Middleware that writes whitelisted slices to localStorage after every action. */
export const localStorageMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);

    const state = store.getState() as Record<string, unknown>;
    const toSave: Record<string, unknown> = {};
    for (const key of PERSISTED_KEYS) {
      if (key in state) {
        toSave[key] = state[key];
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Silently ignore — storage quota exceeded or private browsing
    }

    return result;
  };
