'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { SocketListener } from '@/components/SocketListener';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SocketListener />
      {children}
    </Provider>
  );
}
