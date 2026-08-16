import { apiSlice } from './api';

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCartBackend: builder.mutation({
      query: (data) => ({
        url: '/cart',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItemBackend: builder.mutation({
      query: ({ itemId, ...data }: { itemId: string; quantity?: number; size?: string; color?: string }) => ({
        url: `/cart/${itemId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation<
      { success: boolean; message: string; cart?: any },
      string | { itemId: string; size?: string; color?: string }
    >({
      query: (arg) => {
        if (typeof arg === 'string') {
          return {
            url: `/cart/${arg}`,
            method: 'DELETE',
          };
        }
        let url = `/cart/${arg.itemId}`;
        const params = new URLSearchParams();
        if (arg.size) params.append('size', arg.size);
        if (arg.color) params.append('color', arg.color);
        const q = params.toString();
        return {
          url: q ? `${url}?${q}` : url,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Cart'],
    }),
    clearCartBackend: builder.mutation({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartBackendMutation,
  useUpdateCartItemBackendMutation,
  useRemoveCartItemMutation,
  useClearCartBackendMutation,
} = cartApi;
