'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { MyOrders } from '@/components/storefront/MyOrders';

function OrdersPageInner() {
  const searchParams = useSearchParams();
  // The cart confirmation "Check Order Status" button passes ?email=...
  const emailFromUrl = searchParams.get('email') ?? '';

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 py-10 flex flex-col gap-8 font-['Satoshi']">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">My Orders</span>
      </nav>

      <div>
        <h1
          className="text-3xl font-extrabold text-black"
          style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
        >
          MY ORDERS
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter the email used at checkout to view all your orders and track
          their status.
        </p>
      </div>

      <MyOrders initialEmail={emailFromUrl} />
    </div>
  );
}

// useSearchParams must be wrapped in Suspense for Next.js App Router
export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersPageInner />
    </Suspense>
  );
}
