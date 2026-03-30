# 🗂️ redux/

State management for the frontend, powered by Redux Toolkit.

## Structure

| Path       | Purpose                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `store.ts` | Configures the Redux store, wires RTK Query middleware, and exports `RootState` and `AppDispatch` types |
| `api/`     | RTK Query API definitions — one file per backend controller                                             |

## Usage

The store is provided at the app root via `<Provider store={store}>` in `main.tsx`.

Import hooks directly from the relevant api file:

```ts
import { useGetUsersQuery } from '@frontend/redux/api/usersApi';
import { useCreateUserMutation } from '@frontend/redux/api/authApi';
```

## Adding a new slice

For client-side state (not server data), create a slice in `redux/` alongside `store.ts` and register its reducer in `store.ts`:

```ts
import { counterSlice } from './counterSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    counter: counterSlice.reducer,
  },
  ...
});
```
