'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useVerifyStripeSessionMutation } from '@/store/services/ordersApi';

function OrderConfirmedInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') ?? '';
  const email = searchParams.get('email') ?? '';

  const [verifyStripeSession] = useVerifyStripeSessionMutation();
  const verifiedRef = useRef(false);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!sessionId || verifiedRef.current) return;
    verifiedRef.current = true;

    verifyStripeSession(sessionId)
      .unwrap()
      .then((res) => {
        if (res?.success && res?.order) {
          setOrder(res.order);
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  }, [sessionId, verifyStripeSession]);

  /* ── Loading ── */
  if (status === 'loading') {
    return (
      <div className="w-full max-w-[600px] mx-auto px-4 py-28 flex flex-col items-center gap-4 text-center font-['Satoshi']">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
        <p className="text-sm font-semibold text-gray-500">Confirming your payment…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (status === 'error') {
    return (
      <div className="w-full max-w-[600px] mx-auto px-4 py-28 flex flex-col items-center gap-4 text-center font-['Satoshi']">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-black">Payment Verification Failed</h1>
        <p className="text-sm text-gray-500">We couldn't confirm your payment. Please check your order status below.</p>
        <Link
          href={`/orders${email ? `?email=${encodeURIComponent(email)}` : ''}`}
          className="px-8 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          Check Order Status
        </Link>
      </div>
    );
  }

  /* ── Success ── */
  return (
    <div className="w-full max-w-[600px] mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center font-['Satoshi']">
      <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center animate-bounce-once">
        <CheckCircle className="w-12 h-12" />
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
          ORDER CONFIRMED!
        </h1>
        <p className="text-sm text-gray-500">Your payment was successful via Stripe 💳</p>
      </div>

      <p className="text-sm text-gray-600 max-w-sm">
        Thank you, <strong>{order?.guestName || 'Customer'}</strong>! Your order{' '}
        <strong>#{order?._id?.slice(-6)?.toUpperCase()}</strong> has been placed.
        A confirmation will be sent to <strong>{order?.guestEmail || email}</strong>.
      </p>

      {order && (
        <div className="w-full bg-gray-50 rounded-2xl p-5 text-sm text-left flex flex-col gap-2 border border-gray-200">
          <p className="font-bold text-gray-700">Shipping to:</p>
          <p className="text-gray-600">
            {order.shippingAddress?.street}, {order.shippingAddress?.city}
            {order.shippingAddress?.province ? `, ${order.shippingAddress.province}` : ''}{' '}
            {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
          </p>
          <p className="font-bold text-gray-700 mt-2">
            Order Total: <span className="text-black">₨{order.totalAmount?.toLocaleString()}</span>
          </p>
          <p className="text-xs text-green-700 font-bold mt-1 flex items-center gap-1">
            ✅ Payment Status: Paid
          </p>
        </div>
      )}

      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/shop"
          className="px-8 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href={`/orders?email=${encodeURIComponent(order?.guestEmail || email)}`}
          className="px-8 py-3 bg-white text-black border-2 border-black rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          Check Order Status
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-[600px] mx-auto px-4 py-28 flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
      </div>
    }>
      <OrderConfirmedInner />
    </Suspense>
  );
}
