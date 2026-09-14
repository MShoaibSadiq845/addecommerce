'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  Package,
  Edit,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertOctagon,
  ArrowUpDown,
} from 'lucide-react';
import {
  useGetLowStockProductsQuery,
  useUpdateProductMutation,
} from '@/store/services/productsApi';
import { toast } from 'react-hot-toast';

function urgencyBadge(stock: number) {
  if (stock === 0) {
    return {
      label: 'Out of Stock',
      bg: 'bg-red-100 text-red-700 border-red-200',
      dot: 'bg-red-500',
      level: 'out',
    };
  }
  if (stock <= 2) {
    return {
      label: 'Critical Low',
      bg: 'bg-rose-100 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      level: 'critical',
    };
  }
  if (stock <= 4) {
    return {
      label: 'Very Low',
      bg: 'bg-orange-100 text-orange-700 border-orange-200',
      dot: 'bg-orange-500',
      level: 'very-low',
    };
  }
  return {
    label: 'Low Stock (< 6)',
    bg: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dot: 'bg-yellow-500',
    level: 'low',
  };
}

export default function StockAlertPage() {
  const {
    data: products = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetLowStockProductsQuery(undefined);

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const outOfStockCount = products.filter((p: any) => p.stock === 0).length;
  const criticalCount = products.filter((p: any) => p.stock > 0 && p.stock <= 2).length;
  const lowCount = products.filter((p: any) => p.stock > 2 && p.stock < 6).length;

  const handleQuickStockUpdate = async (product: any) => {
    try {
      await updateProduct({
        id: product._id,
        stock: Number(newStockValue),
      }).unwrap();
      toast.success(`Updated stock for ${product.name} to ${newStockValue}`);
      setEditingStockId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update stock');
    }
  };

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterLevel === 'out') return product.stock === 0;
    if (filterLevel === 'critical') return product.stock > 0 && product.stock <= 2;
    if (filterLevel === 'low') return product.stock > 2 && product.stock < 6;

    return true;
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8 font-['Rubik'] w-full min-w-0 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Stock Alert</h1>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          </div>
          <p className="text-xs text-gray-400 font-['Open_Sans']">
            Live inventory monitoring for products with inventory under 6 units (server-fetched)
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh Stock'}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Out of Stock */}
        <div
          onClick={() => setFilterLevel(filterLevel === 'out' ? 'all' : 'out')}
          className={`cursor-pointer bg-white rounded-2xl p-5 border transition-all shadow-sm flex items-center justify-between ${
            filterLevel === 'out' ? 'ring-2 ring-red-500 border-red-200' : 'border-gray-100 hover:border-red-200'
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500">Out of Stock (0 units)</span>
            <span className="text-2xl sm:text-3xl font-bold text-red-600">{outOfStockCount}</span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Critical Low */}
        <div
          onClick={() => setFilterLevel(filterLevel === 'critical' ? 'all' : 'critical')}
          className={`cursor-pointer bg-white rounded-2xl p-5 border transition-all shadow-sm flex items-center justify-between ${
            filterLevel === 'critical' ? 'ring-2 ring-rose-500 border-rose-200' : 'border-gray-100 hover:border-rose-200'
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500">Critical (1 - 2 units)</span>
            <span className="text-2xl sm:text-3xl font-bold text-rose-600">{criticalCount}</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock */}
        <div
          onClick={() => setFilterLevel(filterLevel === 'low' ? 'all' : 'low')}
          className={`cursor-pointer bg-white rounded-2xl p-5 border transition-all shadow-sm flex items-center justify-between ${
            filterLevel === 'low' ? 'ring-2 ring-yellow-500 border-yellow-200' : 'border-gray-100 hover:border-yellow-200'
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500">Running Low (3 - 5 units)</span>
            <span className="text-2xl sm:text-3xl font-bold text-yellow-700">{lowCount}</span>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-700 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-gray-400 font-semibold">Filter:</span>
          {(['all', 'out', 'critical', 'low'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterLevel === lvl
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lvl === 'all' ? 'All Alerts' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-xs font-semibold">
            Loading low stock products from database...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
            <h3 className="font-bold text-gray-900 text-base">No Stock Alerts Found</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              {searchQuery || filterLevel !== 'all'
                ? 'No low-stock products match your filter criteria.'
                : 'All products currently have 6 or more items in stock.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs font-['Open_Sans'] min-w-[700px]">
              <thead>
                <tr className="border-b bg-gray-50/50 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-4">SKU / Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Remaining Stock</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {filteredProducts.map((product: any) => {
                  const badge = urgencyBadge(product.stock);
                  const isEditing = editingStockId === product._id;

                  return (
                    <tr key={product._id} className="hover:bg-gray-50/80 transition-all">
                      {/* Product details */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 max-w-xs">
                            <span className="font-bold text-gray-900 text-sm truncate">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-gray-400 truncate">
                              ID: {product._id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU & Category */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-gray-800 text-xs font-bold">
                            {product.sku || 'N/A'}
                          </span>
                          <span className="text-gray-400 text-[11px]">
                            {product.category || 'General'}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-bold text-gray-900">
                        Rs {product.price?.toLocaleString()}
                      </td>

                      {/* Urgency Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Stock edit / display */}
                      <td className="py-4 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={newStockValue}
                              onChange={(e) => setNewStockValue(Number(e.target.value))}
                              className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-black outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleQuickStockUpdate(product)}
                              disabled={isUpdating}
                              className="px-2 py-1 bg-black text-white rounded-lg text-[10px] font-bold hover:bg-gray-800"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="px-1.5 py-1 text-gray-400 hover:text-black text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <span
                              className={`text-sm font-extrabold ${
                                product.stock === 0
                                  ? 'text-red-600'
                                  : product.stock <= 2
                                  ? 'text-rose-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {product.stock} units
                            </span>
                            <button
                              onClick={() => {
                                setEditingStockId(product._id);
                                setNewStockValue(product.stock);
                              }}
                              className="p-1 text-gray-400 hover:text-black rounded hover:bg-gray-100 transition-all"
                              title="Quick update stock"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/edit/${product._id}`}
                            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/shop/${product._id}`}
                            target="_blank"
                            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
                            title="View in Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
