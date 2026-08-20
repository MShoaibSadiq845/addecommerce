'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '@/store/services/ordersApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { Eye, Loader2, CreditCard, Banknote, Search, X, Database, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLoading } from '@/context/LoadingContext';
import Pagination from '@/components/ui/Pagination';

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  Shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Delivered: 'bg-green-50 text-green-700 border-green-200',
  Canceled: 'bg-red-50 text-red-700 border-red-200',
};

function PaymentStatusBadge({ status }: { status?: string }) {
  const s = (status || 'Unpaid').toLowerCase();
  if (s === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
        ● Paid
      </span>
    );
  }
  if (s === 'unpaid') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
        ● Unpaid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
      ● {status || 'Pending'}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { setLoading } = useLoading();

  // Debounce search input for server DB query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Exclude 'Delivered' and 'Canceled' orders from Active Orders view by default
  const { data: rawOrders = [], isLoading, isFetching } = useGetAllOrdersQuery(
    {
      status: selectedStatus || undefined,
      excludeStatus: selectedStatus ? undefined : 'Delivered,Canceled',
      search: debouncedSearch,
    },
    { refetchOnMountOrArgChange: true }
  );

  // Filter out any Delivered or Canceled orders as safeguard when viewing all active orders
  const orders = selectedStatus 
    ? rawOrders 
    : rawOrders.filter((o: any) => o.status !== 'Delivered' && o.status !== 'Canceled');

  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || isFetching || updatingId !== null) {
      setLoading(true);
    } else {
      setLoading(false);
    }

    return () => {
      setLoading(false);
    };
  }, [isLoading, isFetching, updatingId, setLoading]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus({ id, status: newStatus }).unwrap();
      if (newStatus === 'Delivered') {
        toast.success(`Status updated to Delivered! Moved to Delivered Orders page.`);
      } else if (newStatus === 'Canceled') {
        toast.success(`Status updated to Canceled! Moved to Canceled Orders page.`);
      } else {
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Pagination (10 per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 font-['Rubik']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Orders</h1>
          <p className="text-xs text-gray-400">Manage active customer orders — delivered and canceled orders are automatically moved to their dedicated views</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/orders/delivered"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-green-100 text-green-800 hover:bg-green-200 border border-green-300 shadow-sm transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            Delivered Orders →
          </Link>
          <Link
            href="/admin/orders/canceled"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-100 text-red-800 hover:bg-red-200 border border-red-300 shadow-sm transition-all flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-red-700" />
            Canceled Orders →
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">Filter:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
            >
              <option value="">All Active Orders</option>
              {['Pending', 'Processing', 'Shipped'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TOP SERVER-SIDE DATABASE SEARCH BAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5 font-bold text-gray-700">
            <Database className="w-4 h-4 text-black" /> Server Database Search (MongoDB)
          </span>
          {isFetching && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin text-black" /> Searching DB...
            </span>
          )}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Server search by Customer Name, Email, Phone, Order ID, City, or Product Item..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-black placeholder-gray-400 outline-none focus:ring-2 focus:ring-black transition-all"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 text-sm font-semibold">
          {debouncedSearch ? `No active orders found matching "${debouncedSearch}".` : 'No active orders found.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="border-b text-gray-400 font-bold uppercase tracking-wider">
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Payment Method</th>
                <th className="px-5 py-4">Payment Status</th>
                <th className="px-5 py-4">Order Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.map((order: any) => {
                const isThisUpdating = updatingId === order._id;
                const isStripe = order.paymentMethod === 'Stripe' || order.paymentMethod === 'Card';

                return (
                  <tr key={order._id} className="hover:bg-gray-50 transition-all">
                    <td className="px-5 py-4 font-bold text-black font-mono">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                          {order.guestName || order.user?.name || 'Guest'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {order.guestEmail || order.user?.email}
                        </span>
                        {(order.guestPhone || order.user?.phone) && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            {order.guestPhone || order.user?.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-black">
                      ₨{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-800">
                        {isStripe ? (
                          <>
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Credit Card (Stripe)
                          </>
                        ) : (
                          <>
                            <Banknote className="w-3.5 h-3.5 text-green-600" /> Cash on Delivery
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={isThisUpdating}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full border outline-none cursor-pointer disabled:opacity-50 ${
                            STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'].map(
                            (s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            )
                          )}
                        </select>
                        {isThisUpdating && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={orders.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}