import { createSlice } from '@reduxjs/toolkit';

import { loadSliceState } from '@frontend/redux/middleware/localStorageMiddleware';

import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  rememberedEmail: string | null;
}

const initialState: AuthState = loadSliceState('auth', {
  token: null,
  rememberedEmail: null,
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    clearToken(state) {
      state.token = null;
    },
    setRememberedEmail(state, action: PayloadAction<string | null>) {
      state.rememberedEmail = action.payload;
    },
  },
});

export const { setToken, clearToken, setRememberedEmail } = authSlice.actions;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.token !== null;
