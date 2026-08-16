'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useToggleSaleMutation,
} from '@/store/services/productsApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { PlusCircle, Trash2, Tag, Edit3, Award, Zap, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LoadingProvider, useLoading } from '@/context/LoadingContext';

function AdminProductsContent() {
  const { data, isLoading } = useGetProductsQuery({ limit: 50 });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleSale, { isLoading: isToggling }] = useToggleSaleMutation();

  const { setLoading } = useLoading();

  const products = data?.products || [];

  const [saleModalProduct, setSaleModalProduct] = useState<any>(null);
  const [salePriceInput, setSalePriceInput] = useState('');
  const [salePriceError, setSalePriceError] = useState('');

  // Track which product id is mid-delete / mid-toggle so we show a per-row spinner
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<any>(null);

  // Synchronize global loading state during fetching and mutations
  useEffect(() => {
    setLoading(isLoading || isDeleting || isToggling);
  }, [isLoading, isDeleting, isToggling, setLoading]);

  const handleDeleteClick = (product: any) => {
    setDeleteConfirmProduct(product);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmProduct) return;
    const id = deleteConfirmProduct._id;
    setDeletingId(id);
    setDeleteConfirmProduct(null);
    try {
      await deleteProduct(id).unwrap();
      toast.success('Product deleted successfully.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenSaleModal = (product: any) => {
    setSaleModalProduct(product);
    setSalePriceInput(product.salePrice || Math.round(product.price * 0.8));
    setSalePriceError('');
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleModalProduct) return;

    // Only validate price when turning sale ON
    if (!saleModalProduct.isOnSale) {
      const val = Number(salePriceInput);
      if (isNaN(val) || val <= 0 || val >= saleModalProduct.price) {
        setSalePriceError(
          `Discounted price must be between $0.01 and $${saleModalProduct.price - 1}`,
        );
        return;
      }
    }

    setTogglingId(saleModalProduct._id);
    try {
      await toggleSale({
        id: saleModalProduct._id,
        isOnSale: !saleModalProduct.isOnSale,
        salePrice: Number(salePriceInput),
      }).unwrap();
      toast.success(
        saleModalProduct.isOnSale ? 'Sale removed.' : 'Flash sale activated!',
      );
      setSaleModalProduct(null);
      setSalePriceError('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update sale status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-['Rubik']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
          <p className="text-xs text-gray-400 font-['Open_Sans']">
            Manage inventory, trigger sales &amp; set loyalty items
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all w-fit shadow-md"
        >
          <PlusCircle className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-['Open_Sans']">
            <thead>
              <tr className="border-b text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Product</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Purchase Type</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Rating</th>
                <th className="pb-3">Sale Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {products.map((product: any) => {
                const isThisDeleting = deletingId === product._id;
                const isThisToggling = togglingId === product._id;

                return (
                  <tr
                    key={product._id}
                    className={`hover:bg-gray-50 transition-all ${
                      isThisDeleting ? 'opacity-40 pointer-events-none' : ''
                    }`}
                  >
                    <td className="py-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        <Image
                          src={product.images?.[0] || '/images/7.png'}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{product.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          SKU: {product.sku}
                        </span>
                      </div>
                    </td>

                    <td className="py-4">{product.category}</td>

                    <td className="py-4 font-bold text-black">
                      ${product.isOnSale ? product.salePrice : product.price}
                      {product.isOnSale && (
                        <span className="text-[10px] text-gray-400 line-through block font-normal">
                          ${product.price}
                        </span>
                      )}
                    </td>

                    <td className="py-4">
                      {product.purchaseType === 'loyalty_only' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                          <Award className="w-3 h-3" /> Loyalty ({product.pointsPrice} pts)
                        </span>
                      ) : product.purchaseType === 'hybrid' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Hybrid (${product.price} /{' '}
                          {product.pointsPrice} pts)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                          Regular Cash
                        </span>
                      )}
                    </td>

                    <td className="py-4">
                      <span
                        className={`font-bold ${
                          product.stock < 10 ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(product.rating ?? 4.5) ? 'text-amber-400' : 'text-gray-200'}`}
                              fill="currentColor" viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold">{(product.rating ?? 4.5).toFixed(1)}/5</span>
                      </div>
                    </td>

                    <td className="py-4">
                      <button
                        onClick={() => handleOpenSaleModal(product)}
                        disabled={isThisToggling || isThisDeleting}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                          product.isOnSale
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {isThisToggling ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Updating…
                          </>
                        ) : product.isOnSale ? (
                          '🔥 On Sale (Toggle)'
                        ) : (
                          '+ Trigger Sale'
                        )}
                      </button>
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          disabled={isThisDeleting || !!deletingId}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Product"
                        >
                          {isThisDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Sale Trigger Modal ─── */}
      {saleModalProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-red-600" />
                {saleModalProduct.isOnSale
                  ? 'Turn Off Flash Sale'
                  : 'Trigger Real-Time Flash Sale'}
              </h3>
              <button
                onClick={() => setSaleModalProduct(null)}
                className="text-gray-400 hover:text-black"
                disabled={togglingId === saleModalProduct._id}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Triggering a sale on <strong>{saleModalProduct.name}</strong> will automatically
              send a real-time Socket.IO alert to all connected store shoppers!
            </p>

            <form onSubmit={handleSaveSale} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Original Price</label>
                <input
                  type="text"
                  disabled
                  value={`$${saleModalProduct.price}`}
                  className="bg-gray-100 rounded-xl p-2.5 text-xs text-gray-500 font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">
                  Discounted Sale Price ($)
                </label>
                <input
                  type="number"
                  value={salePriceInput}
                  onChange={(e) => {
                    setSalePriceInput(e.target.value);
                    const val = Number(e.target.value);
                    if (isNaN(val) || val <= 0 || val >= saleModalProduct.price) {
                      setSalePriceError(
                        `Discounted price must be between $0.01 and $${saleModalProduct.price - 1}`,
                      );
                    } else {
                      setSalePriceError('');
                    }
                  }}
                  className={`border rounded-xl p-2.5 text-xs font-bold text-black outline-none focus:ring-2 focus:ring-black ${
                    salePriceError ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {salePriceError && (
                  <span className="text-[10px] text-red-500 font-semibold px-1 mt-1">
                    {salePriceError}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={togglingId === saleModalProduct._id}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {togglingId === saleModalProduct._id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating…
                  </>
                ) : saleModalProduct.isOnSale ? (
                  'Remove Flash Sale'
                ) : (
                  'Broadcast Flash Sale Alert!'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Delete Product
              </h3>
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete <strong className="text-black">{deleteConfirmProduct.name}</strong>?
              </p>
              <p className="text-xs text-gray-500">
                This action cannot be undone. The product will be permanently removed from your store.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition-all"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <LoadingProvider>
      <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading...</div>}>
        <AdminProductsContent />
      </Suspense>
    </LoadingProvider>
  );
}