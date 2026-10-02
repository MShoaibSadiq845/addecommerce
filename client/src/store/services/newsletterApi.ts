import { apiSlice } from './api';

export const newsletterApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    subscribeNewsletter: builder.mutation<any, { email: string; phone?: string } | string>({
      query: (data) => ({
        url: '/newsletter/subscribe',
        method: 'POST',
        body: typeof data === 'string' ? { email: data } : data,
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
