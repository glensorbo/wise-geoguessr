import { baseApi } from './baseApi';

import type { ApiSuccessResponse } from '@backend/types/apiSuccessResponse';
import type { User } from '@backend/types/user';

type CreateUserRequest = {
  email: string;
  name: string;
  role: 'admin' | 'user';
};

type CreateUserResponse = User & { signupLink: string; mailSent: boolean };

type UpdateRoleRequest = {
  id: string;
  role: 'admin' | 'user';
};

type ResetPasswordResponse = { signupLink: string; mailSent: boolean };

const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<User[], void>({
      query: () => '/user',
      transformResponse: (res: ApiSuccessResponse<User[]>) => res.data,
      providesTags: ['Users'],
    }),

    createUser: build.mutation<CreateUserResponse, CreateUserRequest>({
      query: (body) => ({ url: '/user', method: 'POST', body }),
      transformResponse: (res: ApiSuccessResponse<CreateUserResponse>) =>
        res.data,
      invalidatesTags: ['Users'],
    }),

    deleteUser: build.mutation<null, string>({
      query: (id) => ({ url: `/user/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),

    updateUserRole: build.mutation<User, UpdateRoleRequest>({
      query: ({ id, role }) => ({
        url: `/user/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      transformResponse: (res: ApiSuccessResponse<User>) => res.data,
      invalidatesTags: ['Users'],
    }),

    resetUserPassword: build.mutation<ResetPasswordResponse, string>({
      query: (id) => ({ url: `/user/${id}/reset-password`, method: 'POST' }),
      transformResponse: (res: ApiSuccessResponse<ResetPasswordResponse>) =>
        res.data,
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
  useResetUserPasswordMutation,
} = userApi;
