import { baseApi } from './baseApi';

import type { ApiSuccessResponse } from '@backend/types/apiSuccessResponse';
import type { User } from '@backend/types/user';

type CreateUserRequest = {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'user';
};

const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createUser: build.mutation<User, CreateUserRequest>({
      query: (body) => ({ url: '/user', method: 'POST', body }),
      transformResponse: (res: ApiSuccessResponse<User>) => res.data,
    }),
  }),
});

export const { useCreateUserMutation } = userApi;
