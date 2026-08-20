'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '@/store/services/ordersApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import {
  Search,
  Eye,
  Loader2,
  CreditCard,
  Banknote,
  CheckCircle2,
  PackageCheck,
  X,
  Database,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
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

export default function DeliveredOrders() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { setLoading } = useLoading();

  // Debounce search input for server-side database query (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Query server database specifically for status: 'Delivered' and search term
  const {
    data: orders = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetAllOrdersQuery(
    { status: 'Delivered', search: debouncedSearch },
    { refetchOnMountOrArgChange: true }
  );

  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || isFetching || updatingId !== null) {
      setLoading(true);
    } else {
      setLoading(false);
    }
    return () => setLoading(false);
  }, [isLoading, isFetching, updatingId, setLoading]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus({ id, status: newStatus }).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats calculations from returned delivered orders
  const totalDeliveredCount = orders.length;
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const stripeCount = orders.filter((o: any) => o.paymentMethod === 'Stripe' || o.paymentMethod === 'Card').length;
  const codCount = orders.filter((o: any) => o.paymentMethod === 'COD' || o.paymentMethod === 'Cash on Delivery').length;

  // Pagination (10 per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 font-['Rubik']">
      {/* Top Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Delivered Orders</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Live DB Sync
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              All completed &amp; delivered customer orders with real-time server database search
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh DB
        </button>
      </div>

      {/* TOP SERVER-SIDE DATABASE SEARCH BAR */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 p-6 rounded-2xl shadow-md text-white flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-green-400">
            <Database className="w-4 h-4 animate-pulse" />
            <span>MongoDB Server-Side Database Search</span>
          </div>
          {isFetching && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-300 font-medium">
              <Loader2 className="w-3 h-3 animate-spin text-green-400" /> Querying MongoDB Database...
            </span>
          )}
        </div>

        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search delivered orders by Customer Name, Email, Phone, Order ID, City, or Item..."
            className="w-full pl-12 pr-12 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-all"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span>
            {debouncedSearch ? (
              <>Filtering delivered orders matching <strong className="text-white">"{debouncedSearch}"</strong></>
            ) : (
              'Type to query MongoDB directly across names, emails, phones, IDs & addresses.'
            )}
          </span>
          <span className="font-semibold text-gray-300">
            Results found: <span className="text-green-400 font-bold">{totalDeliveredCount}</span>
          </span>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivered Orders</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalDeliveredCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">₨{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stripe Payments</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{stripeCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cash on Delivery</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{codCount}</h3>
          </div>
        </div>
      </div>

      {/* DELIVERED ORDERS TABLE */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-800">No Delivered Orders Found</h3>
          <p className="text-xs text-gray-500 max-w-sm">
            {debouncedSearch
              ? `No delivered orders in MongoDB match your search "${debouncedSearch}". Try searching for another term.`
              : 'There are currently no orders with Delivered status.'}
          </p>
          {debouncedSearch && (
            <button
              onClick={() => setSearchInput('')}
              className="mt-2 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead>
              <tr className="border-b text-gray-400 font-bold uppercase tracking-wider">
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Customer Details</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Delivery Date</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Payment Method</th>
                <th className="px-5 py-4">Payment Status</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.map((order: any) => {
                const isThisUpdating = updatingId === order._id;
                const isStripe = order.paymentMethod === 'Stripe' || order.paymentMethod === 'Card';

                return (
                  <tr key={order._id} className="hover:bg-green-50/40 transition-all">
                    <td className="px-5 py-4 font-bold text-black font-mono">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                          {order.guestName || order.user?.name || 'Guest Customer'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {order.guestEmail || order.user?.email}
                        </span>
                        {(order.guestPhone || order.user?.phone) && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            {order.guestPhone || order.user?.phone}
                          </span>
                        )}
                        {order.shippingAddress?.city && (
                          <span className="text-[10px] text-gray-400">
                            📍 {order.shippingAddress.city}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-700">
                        {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-PK', {
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
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Stripe Card
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
