import { apiSlice } from './api';

export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitReview: builder.mutation({
      query: (body: {
        name: string;
        comment: string;
        rating: number;
        productId?: string;
        productName?: string;
      }) => ({
        url: '/reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Review'],
    }),
    getReviewsByProduct: builder.query({
      query: (productId: string) => `/reviews?productId=${productId}`,
      providesTags: ['Review'],
    }),
    getAllReviews: builder.query({
      query: () => '/reviews/all',
      providesTags: ['Review'],
    }),
  }),
});

export const {
  useSubmitReviewMutation,
  useGetReviewsByProductQuery,
  useGetAllReviewsQuery,
} = reviewsApi;
