import { apiSlice } from './api';

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    getUnreadCount: builder.query({
      query: () => '/notifications/unread-count',
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    // Contact message endpoints
    submitContactMessage: builder.mutation({
      query: (body: { name: string; phone?: string; email?: string; subject: string; message: string }) => ({
        url: '/notifications/contact',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ContactMessage'],
    }),
    getContactMessages: builder.query({
      query: () => '/notifications/contacts',
      providesTags: ['ContactMessage'],
    }),
    markContactAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/contacts/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['ContactMessage'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useSubmitContactMessageMutation,
  useGetContactMessagesQuery,
  useMarkContactAsReadMutation,
} = notificationsApi;
