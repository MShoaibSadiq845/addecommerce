import { apiSlice } from './api';

export const newsletterApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    subscribeNewsletter: builder.mutation({
      query: (email: string) => ({
        url: '/newsletter/subscribe',
        method: 'POST',
        body: { email },
      }),
    }),
    getNewsletterSubscribers: builder.query({
      query: () => '/newsletter/subscribers',
    }),
  }),
});

export const {
  useSubscribeNewsletterMutation,
  useGetNewsletterSubscribersQuery,
} = newsletterApi;
