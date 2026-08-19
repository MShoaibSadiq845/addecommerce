'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from '@/store/services/ordersApi';
import { ArrowLeft, User, MapPin, Package, Loader2, CreditCard, Banknote } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'text-yellow-700 bg-yellow-50',
  Processing: 'text-blue-700 bg-blue-50',
  Shipped: 'text-indigo-700 bg-indigo-50',
  Delivered: 'text-green-700 bg-green-50',
  Canceled: 'text-red-700 bg-red-50',
};

function PaymentStatusBadge({ status }: { status?: string }) {
  const s = (status || 'Unpaid').toLowerCase();
  if (s === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
        ● Paid
      </span>
    );
  }
  if (s === 'unpaid') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
        ● Unpaid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
      ● {status || 'Pending'}
    </span>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { data: order, isLoading } = useGetOrderByIdQuery(id as string);
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await updateOrderStatus({ id: order._id, status: newStatus }).unwrap();
      if (newStatus === 'Delivered') {
        toast.success('Status updated to Delivered! Payment automatically set to Paid.');
      } else {
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );

  if (!order) return (
    <div className="p-8 text-center font-['Rubik']">
      <h2 className="text-xl font-bold">Order Not Found</h2>
      <Link href="/admin/orders" className="text-xs text-blue-600 underline mt-2 block">Back to Orders</Link>
    </div>
  );

  const isStripe = order.paymentMethod === 'Stripe' || order.paymentMethod === 'Card';

  return (
    <div className="flex flex-col gap-6 font-['Rubik'] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="p-2 bg-white rounded-xl border hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-xs text-gray-400">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={order.status} onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            className={`px-4 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer disabled:opacity-60 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
            {['Pending','Processing','Shipped','Delivered','Canceled'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {updating && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b pb-3 mb-4">
            <User className="w-4 h-4 text-blue-600" /> Customer
          </h3>
          <div className="text-xs space-y-2 text-gray-600">
            <p>Name: <strong className="text-black">{order.guestName}</strong></p>
            <p>Email: <strong className="text-black">{order.guestEmail}</strong></p>
            <p>Phone: <strong className="text-black">{order.guestPhone || 'N/A'}</strong></p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b pb-3 mb-4">
            <CreditCard className="w-4 h-4 text-purple-600" /> Payment Info
          </h3>
          <div className="text-xs space-y-2 text-gray-600">
            <p className="flex items-center gap-1.5">
              Method: <strong className="text-black font-semibold">{isStripe ? '💳 Credit Card (Stripe)' : '💵 Cash on Delivery'}</strong>
            </p>
            <p className="flex items-center gap-1.5">
              Status: <PaymentStatusBadge status={order.paymentStatus} />
            </p>
            {order.stripeSessionId && (
              <p className="truncate text-[10px] text-gray-400 font-mono">Session: {order.stripeSessionId}</p>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b pb-3 mb-4">
            <MapPin className="w-4 h-4 text-red-500" /> Shipping Address
          </h3>
          <div className="text-xs space-y-1 text-gray-600">
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}{order.shippingAddress?.province ? `, ${order.shippingAddress.province}` : ''}</p>
            <p>{order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</p>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b pb-3 mb-4">
          <Package className="w-5 h-5 text-gray-700" /> Items ({order.items?.length || 0})
        </h3>
        <div className="flex flex-col divide-y divide-gray-100">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="py-4 flex items-center gap-4">
              <div className="relative w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                <Image src={item.image || '/images/7.png'} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.color && `Color: ${item.color}`}{item.color && item.size && ' · '}{item.size && `Size: ${item.size}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                <p className="font-bold text-sm text-black">₨{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t mt-2 pt-4 flex justify-end">
          <div className="text-right">
            <p className="text-xs text-gray-500">Order Total</p>
            <p className="text-2xl font-extrabold text-black">₨{order.totalAmount?.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
