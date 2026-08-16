import React, { Suspense } from 'react';
import { StorefrontHeader } from '@/components/storefront/Header';
import { StorefrontFooter } from '@/components/storefront/Footer';
import { Toaster } from 'react-hot-toast';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-black font-['Satoshi']">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Rubik, sans-serif', fontSize: '13px' },
          success: { duration: 3500 },
          error: { duration: 4000 },
        }}
      />
      <Suspense fallback={<div className="h-[60px] bg-white border-b border-gray-100" />}>
        <StorefrontHeader />
      </Suspense>
      <main className="flex-1 w-full">{children}</main>
      <StorefrontFooter />
    </div>
  );
}