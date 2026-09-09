import { apiSlice } from './api';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    getLoyaltyPoints: builder.query({
      query: () => '/users/loyalty-points',
      providesTags: ['User'],
    }),
    getAllUsers: builder.query<any[], { search?: string; role?: string } | void>({
      query: (params) => ({
        url: '/users',
        params: params || {},
      }),
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateUserRole: builder.mutation<any, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useGetLoyaltyPointsQuery,
  useGetAllUsersQuery,
  useUpdateProfileMutation,
  useUpdateUserRoleMutation,
} = authApi;
