import { createSlice } from '@reduxjs/toolkit';

import { loadSliceState } from '../middleware/localStorageMiddleware';

import type { PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = loadSliceState('theme', {
  mode: 'system' as ThemeMode,
});

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
});

export const { setThemeMode } = themeSlice.actions;
