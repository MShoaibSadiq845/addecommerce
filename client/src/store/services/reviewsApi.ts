import { apiSlice } from './api';

export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadReviewImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/reviews/upload',
        method: 'POST',
        body: formData,
      }),
    }),
    submitReview: builder.mutation({
      query: (body: {
        name: string;
        comment: string;
        rating: number;
        productId?: string;
        productName?: string;
        image?: string;
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
  useUploadReviewImageMutation,
  useSubmitReviewMutation,
  useGetReviewsByProductQuery,
  useGetAllReviewsQuery,
} = reviewsApi;
