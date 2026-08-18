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
    getNewsletterSubscribers: builder.query<any[], string | void>({
      query: (search) => ({
        url: '/newsletter/subscribers',
        params: search ? { search } : undefined,
      }),
    }),
  }),
});

export const {
  useSubscribeNewsletterMutation,
  useGetNewsletterSubscribersQuery,
} = newsletterApi;
