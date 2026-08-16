import { apiSlice } from './api';

export interface GuestCartItemPayload {
  sessionId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

export const guestCartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** Fetch the stored guest cart from the DB */
    getGuestCart: builder.query({
      query: (sessionId: string) => `/guest-cart?sessionId=${encodeURIComponent(sessionId)}`,
      providesTags: ['Cart'],
    }),

    /** Add (or increment) an item in the guest cart */
    addToGuestCart: builder.mutation<void, GuestCartItemPayload>({
      query: (data) => ({
        url: '/guest-cart',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    /** Remove a single item from the guest cart */
    removeFromGuestCart: builder.mutation<
      { success: boolean; message: string; cart?: any },
      { sessionId: string; itemId: string; size?: string; color?: string }
    >({
      query: ({ sessionId, itemId, size, color }) => {
        let url = `/guest-cart/${itemId}?sessionId=${encodeURIComponent(sessionId)}`;
        if (size) url += `&size=${encodeURIComponent(size)}`;
        if (color) url += `&color=${encodeURIComponent(color)}`;
        return {
          url,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Cart'],
    }),

    /** Wipe all items for this session (called after checkout) */
    clearGuestCart: builder.mutation<void, string>({
      query: (sessionId) => ({
        url: `/guest-cart?sessionId=${encodeURIComponent(sessionId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetGuestCartQuery,
  useAddToGuestCartMutation,
  useRemoveFromGuestCartMutation,
  useClearGuestCartMutation,
} = guestCartApi;
