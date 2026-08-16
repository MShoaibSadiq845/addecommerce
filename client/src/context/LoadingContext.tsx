'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import GlobalLoader from '@/components/ui/GlobalLoader';

interface LoadingContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading, setIsLoading: setLoading }}>
      {children}
      {loading && <GlobalLoader />}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    // Return a dummy implementation to prevent crashes if used outside provider,
    // but warn in console. This matches the behavior of some fallback pages.
    console.warn('useLoading was used outside of a LoadingProvider');
    return {
      loading: false,
      setLoading: () => {},
      setIsLoading: () => {},
    };
  }
  return context;
};
