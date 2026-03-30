import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

export type LoginFormFields = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type LoginFormErrors = Partial<Record<keyof LoginFormFields, string>>;

interface LoginFormState extends LoginFormFields {
  errors: LoginFormErrors;
}

const initialState: LoginFormState = {
  email: '',
  password: '',
  rememberMe: false,
  errors: {},
};

/**
 * Ephemeral form state — controlled inputs dispatch here on every onChange.
 * NOT persisted to localStorage (intentionally omitted from PERSISTED_KEYS).
 */
export const loginFormSlice = createSlice({
  name: 'loginForm',
  initialState,
  reducers: {
    setLoginFormField(state, action: PayloadAction<Partial<LoginFormFields>>) {
      Object.assign(state, action.payload);
    },
    setLoginFormErrors(state, action: PayloadAction<LoginFormErrors>) {
      state.errors = action.payload;
    },
    clearLoginForm() {
      return initialState;
    },
  },
});

export const { setLoginFormField, setLoginFormErrors, clearLoginForm } =
  loginFormSlice.actions;
