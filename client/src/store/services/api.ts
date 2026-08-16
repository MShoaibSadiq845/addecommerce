import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const cleanToken = (token?: string | null) => {
  if (!token) return null;
  // Strip surrounding double-quotes that JSON.stringify sometimes adds
  return token.replace(/^"(.*)"$/, '$1').trim() || null;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      // First try Redux state (already cleaned on login)
      let token = (getState() as RootState).auth.token;

      // Fallback: read directly from localStorage (handles page-refresh / SSR hydration lag)
      if (!token && typeof window !== 'undefined') {
        token = cleanToken(localStorage.getItem('token'));
      }

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Order', 'User', 'Notification', 'Cart', 'ContactMessage', 'Review', 'Newsletter'],
  endpoints: () => ({}),
});
