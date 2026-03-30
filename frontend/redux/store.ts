import { configureStore } from '@reduxjs/toolkit';

import { authSlice } from '../features/login/state/authSlice';
import { loginFormSlice } from '../features/login/state/loginFormSlice';
import { baseApi } from './api/baseApi';
import { localStorageMiddleware } from './middleware/localStorageMiddleware';
import { themeSlice } from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [themeSlice.name]: themeSlice.reducer,
    [authSlice.name]: authSlice.reducer,
    [loginFormSlice.name]: loginFormSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
