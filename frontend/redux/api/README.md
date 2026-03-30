# 🌐 redux/api/

RTK Query API definitions. One file per backend controller.

## Structure

| File               | Endpoints                                                                   | Exported hooks                                                   |
| ------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `baseApi.ts`       | —                                                                           | —                                                                |
| `authApi.ts`       | `POST /api/auth/create-user`, `POST /api/auth/set-password`                 | `useCreateUserMutation`, `useSetPasswordMutation`                |
| `usersApi.ts`      | `GET /api/user`, `GET /api/user/:id`                                        | `useGetUsersQuery`, `useGetUserByIdQuery`                        |
| `gameResultApi.ts` | `GET /api/results/years`, `GET /api/results?year=YYYY`, `POST /api/results` | `useGetYearsQuery`, `useGetResultsQuery`, `useAddResultMutation` |

## Architecture

### `baseApi.ts`

Creates the root `createApi` instance with a custom `baseQuery` that wraps `fetchBaseQuery` and narrows all errors to `ApiErrorResponse`. No endpoints are defined here — they are injected per file.

### Per-controller files

Each file calls `baseApi.injectEndpoints()` and exports the generated React hooks. `transformResponse` unwraps `ApiSuccessResponse<T>` so hook consumers receive `T` directly.

## Error handling

All errors are typed as `ApiErrorResponse`:

```ts
const { data, error } = useGetUsersQuery();

if (error) {
  // error is ApiErrorResponse — fully typed
  console.log(error.error.type); // 'validation' | 'notFound' | 'unauthorized'
  console.log(error.error.errors); // FieldError[]
}
```

## Adding a new controller

1. Create `redux/api/myThingApi.ts`
2. Call `baseApi.injectEndpoints()` with your endpoints
3. Export the generated hooks

```ts
import { baseApi } from './baseApi';
import type { ApiSuccessResponse } from '@backend/types/apiSuccessResponse';
import type { MyThing } from '@backend/types/myThing';

export const myThingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyThing: build.query<MyThing, string>({
      query: (id) => `my-thing/${id}`,
      transformResponse: (response: ApiSuccessResponse<MyThing>) =>
        response.data,
    }),
  }),
});

export const { useGetMyThingQuery } = myThingApi;
```
