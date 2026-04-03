import { baseApi } from './baseApi';

import type { ApiSuccessResponse } from '@backend/types/apiSuccessResponse';
import type { User } from '@backend/types/user';

type CreateUserRequest = {
  email: string;
  name: string;
  role: 'admin' | 'user';
};

type CreateUserResponse = User & { signupLink: string; mailSent: boolean };

const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createUser: build.mutation<CreateUserResponse, CreateUserRequest>({
      query: (body) => ({ url: '/user', method: 'POST', body }),
      transformResponse: (res: ApiSuccessResponse<CreateUserResponse>) =>
        res.data,
    }),
  }),
});

export const { useCreateUserMutation } = userApi;
