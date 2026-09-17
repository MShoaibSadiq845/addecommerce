import React, { Suspense } from 'react';
import { StorefrontHeader } from '@/components/storefront/Header';
import { StorefrontFooter } from '@/components/storefront/Footer';
import { BottomNav } from '@/components/storefront/BottomNav';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-black font-['Satoshi']">
      <Suspense fallback={<div className="h-[60px] bg-white border-b border-gray-100" />}>
        <StorefrontHeader />
      </Suspense>
      {/* pb-[62px] offsets the fixed BottomNav on mobile so content isn't hidden behind it */}
      <main className="flex-1 w-full pb-[62px] md:pb-0">{children}</main>
      <StorefrontFooter />
      {/* Suspense required because BottomNav uses useSearchParams() */}
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}