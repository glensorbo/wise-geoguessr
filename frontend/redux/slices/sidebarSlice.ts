import { createSlice } from '@reduxjs/toolkit';

import { loadSliceState } from '../middleware/localStorageMiddleware';

import type { PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  desktopCollapsed: boolean;
}

const initialState: SidebarState = loadSliceState('sidebar', {
  desktopCollapsed: false,
});

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setDesktopSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.desktopCollapsed = action.payload;
    },
    toggleDesktopSidebar(state) {
      state.desktopCollapsed = !state.desktopCollapsed;
    },
  },
});

export const { setDesktopSidebarCollapsed, toggleDesktopSidebar } =
  sidebarSlice.actions;
