'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, Package, ChevronRight } from 'lucide-react';
import { useGetLowStockProductsQuery } from '@/store/services/productsApi';

function urgencyLabel(stock: number) {
  if (stock === 0)
    return {
      label: 'Out of Stock',
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: 'bg-red-500',
    };
  if (stock <= 2)
    return {
      label: 'Critical',
      bg: 'bg-red-50',
      text: 'text-red-600',
      dot: 'bg-red-400',
    };
  if (stock <= 4)
    return {
      label: 'Very Low',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      dot: 'bg-orange-400',
    };
  return {
    label: 'Low',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: 'bg-yellow-400',
  };
}

export default function StockAlert() {
  const { data: products = [], isLoading, isError } = useGetLowStockProductsQuery(undefined);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="h-4 w-32 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-4 w-16 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-gray-50 rounded animate-pulse w-1/2" />
            </div>
            <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-red-100 shadow-sm flex flex-col items-center justify-center gap-3 min-h-[160px]">
        <AlertTriangle className="w-8 h-8 text-red-400" />
        <p className="text-xs font-semibold text-red-500">Failed to load stock data.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 min-h-[160px]">
        <Package className="w-8 h-8 text-green-400" />
        <p className="text-xs font-semibold text-green-600">All products are well stocked!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col gap-4 min-w-0">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <h3 className="font-bold text-base text-gray-900">Stock Alert</h3>
          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            {products.length} item{products.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
        >
          Manage <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto pr-1">
        {products.map((product: any) => {
          const badge = urgencyLabel(product.stock);
          return (
            <div
              key={product._id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all group"
            >
              <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-xs text-gray-900 truncate leading-tight">
                  {product.name}
                </span>
                <span className="text-[10px] text-gray-400 truncate">
                  SKU: {product.sku || 'N/A'} &nbsp;·&nbsp; {product.category || 'General'}
                </span>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.bg} ${badge.text}`}
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {badge.label}
                </span>
                <span className="text-[10px] font-semibold text-gray-500">
                  {product.stock} left
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-1 flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2.5 border border-red-100">
        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
        <p className="text-[11px] font-semibold text-red-600">
          {products.filter((p: any) => p.stock === 0).length} out-of-stock &nbsp;·&nbsp;
          {products.filter((p: any) => p.stock > 0).length} running low (&lt; 6 items)
        </p>
      </div>
    </div>
  );
}
