import { apiSlice } from './api';

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    validateCheckout: builder.mutation<
      { success: boolean; message: string },
      { items: Array<{ productId: string; quantity: number; name?: string }> }
    >({
      query: (data) => ({
        url: '/orders/validate-checkout',
        method: 'POST',
        body: data,
      }),
    }),
    createOrder: builder.mutation({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order', 'Product'],
    }),
    verifyStripeSession: builder.mutation({
      query: (sessionId: string) => ({
        url: '/orders/verify-stripe-session',
        params: { session_id: sessionId },
      }),
      invalidatesTags: ['Order'],
    }),
    getOrdersByEmail: builder.query({
      query: (email: string) => ({
        url: '/orders/by-email',
        params: { email },
      }),
      providesTags: ['Order'],
    }),
    getAllOrders: builder.query<any[], { status?: string; search?: string; excludeStatus?: string } | string | undefined>({
      query: (arg) => {
        const params: Record<string, string> = {};
        if (typeof arg === 'string') {
          if (arg) params.status = arg;
        } else if (arg && typeof arg === 'object') {
          if (arg.status) params.status = arg.status;
          if (arg.search) params.search = arg.search;
          if (arg.excludeStatus) params.excludeStatus = arg.excludeStatus;
        }
        return {
          url: '/orders',
          params: Object.keys(params).length > 0 ? params : undefined,
        };
      },
      providesTags: ['Order'],
    }),
    getOrderById: builder.query({
      query: (id: string) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => ['Order', { type: 'Order', id }],
    }),
    getAdminMetrics: builder.query({
      query: () => '/orders/metrics',
      providesTags: ['Order', 'Product'],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useValidateCheckoutMutation,
  useCreateOrderMutation,
  useVerifyStripeSessionMutation,
  useGetOrdersByEmailQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useGetAdminMetricsQuery,
} = ordersApi;
