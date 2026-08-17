'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '@/store/services/ordersApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { Eye, Loader2 } from 'lucide-react';
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

export default function AdminOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { setLoading } = useLoading();

  const { data: orders = [], isLoading, isFetching } = useGetAllOrdersQuery(selectedStatus || undefined, {
    refetchOnMountOrArgChange: true,
  });
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
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Pagination (10 per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 font-['Rubik']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-xs text-gray-400">All customer orders — fetched live from database</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold">Filter:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
          >
            <option value="">All Statuses</option>
            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 text-sm font-semibold">
          No orders found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b text-gray-400 font-bold uppercase tracking-wider">
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Total (PKR)</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.map((order: any) => {
                const isThisUpdating = updatingId === order._id;
                return (
                  <tr key={order._id} className="hover:bg-gray-50 transition-all">
                    <td className="px-5 py-4 font-bold text-black font-mono">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                          {order.guestName || order.user?.name || 'Guest'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {order.guestEmail || order.user?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-black">
                      ₨{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {order.items?.length || 0} item(s)
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={isThisUpdating}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full border outline-none disabled:opacity-50 ${
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