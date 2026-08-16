import React from 'react';
import { ProductGridSkeleton } from '@/components/ui/skeletons/ProductCardSkeleton';

export default function StoreLoading() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 flex flex-col items-center gap-16 animate-pulse">
      {/* Hero skeleton */}
      <div className="w-full h-[420px] bg-gray-100 rounded-3xl" />

      {/* Section skeleton */}
      <div className="w-full flex flex-col items-center gap-8">
        <div className="h-10 bg-gray-200 rounded-full w-64" />
        <ProductGridSkeleton count={4} />
      </div>

      <div className="w-full flex flex-col items-center gap-8">
        <div className="h-10 bg-gray-200 rounded-full w-64" />
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}
