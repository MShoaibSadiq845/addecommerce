'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import {
  Package,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { useGetOrdersByEmailQuery } from '@/store/services/ordersApi';

// ─── Status badge ───────────────────────────────────────────────────────────

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; style: string }> = {
    Pending: {
      icon: <Clock className="w-3.5 h-3.5" />,
      style: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
    Processing: {
      icon: <Clock className="w-3.5 h-3.5" />,
      style: 'bg-green-50 text-blue-700 border-blue-200',
    },
    Shipped: {
      icon: <Truck className="w-3.5 h-3.5" />,
      style: 'bg-green-50 text-indigo-700 border-indigo-200',
    },
    Delivered: {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      style: 'bg-green-50 text-green-700 border-green-200',
    },
    Canceled: {
      icon: <XCircle className="w-3.5 h-3.5" />,
      style: 'bg-red-50 text-red-700 border-red-200',
    },
  };
  const cfg = map[status] ?? map.Pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${cfg.style}`}
    >
      {cfg.icon}
      {status}
    </span>
  );
}

// ─── Order progress stepper ─────────────────────────────────────────────────

const STATUS_STEPS = ['Processing', 'Shipped', 'Delivered'] as const;
type OrderStatus = string;

function OrderProgressBar({ status }: { status: OrderStatus }) {
  if (status === 'Canceled') {
    return (
      <div className="flex items-center gap-2 px-2 py-3">
        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
        <span className="text-xs font-bold text-red-500">Order Canceled</span>
      </div>
    );
  }

  const steps = STATUS_STEPS;
  const currentIndex =
    status === 'Pending' ? -1 : steps.indexOf(status as typeof steps[number]);

  const stepIcons = [
    <Clock key="processing" className="w-4 h-4" />,
    <Truck key="shipped" className="w-4 h-4" />,
    <CheckCircle2 key="delivered" className="w-4 h-4" />,
  ];

  return (
    <div className="px-2 py-3">
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const isDone = currentIndex > i;
          const isActive = currentIndex === i;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone
                      ? 'bg-green-600 border-green-600 text-white'
                      : isActive
                      ? 'bg-white border-green-600 text-green-600'
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                  }`}
                >
                  {stepIcons[i]}
                </div>
                <span
                  className={`text-[10px] font-bold whitespace-nowrap ${
                    isDone || isActive ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-5 rounded-full transition-all ${
                    isDone ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {status === 'Pending' && (
        <p className="text-[10px] text-gray-400 font-semibold mt-2 text-center">
          Your order is awaiting confirmation
        </p>
      )}
    </div>
  );
}



function PaymentStatusBadge({ status }: { status?: string }) {
  const s = (status || 'Unpaid').toLowerCase();
  if (s === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
        ● Paid
      </span>
    );
  }
  if (s === 'unpaid') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
        ● Unpaid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
      ● {status || 'Pending'}
    </span>
  );
}

// ─── Single order card ───────────────────────────────────────────────────────

function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Order ID
          </span>
          <span className="font-bold text-sm font-mono text-black">
            #{order._id.slice(-8).toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Date
          </span>
          <span className="text-xs text-gray-700">
            {new Date(order.createdAt).toLocaleDateString('en-PK', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Total
          </span>
          <span className="font-extrabold text-sm text-black">
            ₨{order.totalAmount?.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Payment Method
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-bold text-gray-800">
              {order.paymentMethod === 'Stripe' ? '💳 Credit Card' : '💵 COD'}
            </span>
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <OrderStatusBadge status={order.status} />

        <button
          onClick={() => setExpanded((p) => !p)}
          className="ml-auto p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="bg-gray-50 rounded-2xl px-4 pt-3 pb-1 border border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
              Order Progress
            </p>
            <OrderProgressBar status={order.status} />
          </div>

          <div className="flex flex-col divide-y divide-gray-50">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                {item.image && (
                  <div className="relative w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {item.name}
                  </p>
                  {(item.color || item.size) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.color && `Color: ${item.color}`}
                      {item.color && item.size && ' · '}
                      {item.size && `Size: ${item.size}`}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-sm text-black shrink-0">
                  ₨{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
            <Truck className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
            <span>
              {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
              {order.shippingAddress?.province && `${order.shippingAddress.province}, `}
              {order.shippingAddress?.country}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface MyOrdersProps {
  initialEmail?: string;
}

type FormValues = {
  email: string;
};

export function MyOrders({ initialEmail = '' }: MyOrdersProps) {
  const [submittedEmail, setSubmittedEmail] = useState(initialEmail);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: initialEmail },
  });

  useEffect(() => {
    if (initialEmail) {
      setValue('email', initialEmail);
      setSubmittedEmail(initialEmail);
    }
  }, [initialEmail, setValue]);

  const {
    data: orders = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetOrdersByEmailQuery(submittedEmail, {
    skip: !submittedEmail,
  });

  const onSubmit = (data: FormValues) => {
    const trimmed = data.email.trim().toLowerCase();
    if (trimmed) {
      setSubmittedEmail(trimmed);
    }
  };

  const isButtonLoading = isLoading || isFetching;

  return (
    <div className="flex flex-col gap-6">
      {/* Email lookup form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1.5 max-w-md">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="email"
              placeholder="Enter the email used at checkout…"
              {...register('email', {
                required: 'Please enter your email',
              })}
              className={`w-full bg-gray-100 rounded-full py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-black/20 placeholder:text-gray-400 ${
                errors.email ? 'border border-red-500 bg-red-50' : ''
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={isButtonLoading}
            className="px-6 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors shrink-0 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[100px]"
          >
            {isButtonLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              'Look Up'
            )}
          </button>
          {submittedEmail && (
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isButtonLoading}
              className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isButtonLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
        {errors.email && (
          <span className="text-xs text-red-500 font-medium pl-4">
            {errors.email.message}
          </span>
        )}
      </form>

      {/* Results */}
      {submittedEmail && (
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-sm text-gray-600 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Orders for{' '}
            <span className="text-black font-mono">{submittedEmail}</span>
            {!isLoading && (
              <span className="ml-1 text-gray-400 font-normal">
                ({orders.length})
              </span>
            )}
          </h2>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-20 bg-gray-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-10 text-center border border-gray-200">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-600">No orders found.</p>
              <p className="text-xs text-gray-400 mt-1">
                Make sure you entered the same email used at checkout.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order: any) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}