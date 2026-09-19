'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useDeleteProductMutation,
  useToggleSaleMutation,
  useUpdateProductMutation,
} from '@/store/services/productsApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { PlusCircle, Trash2, Tag, Edit3, Award, Zap, X, Loader2, Search, Armchair, Eye, SlidersHorizontal, Check, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LoadingProvider, useLoading } from '@/context/LoadingContext';
import Pagination from '@/components/ui/Pagination';
import { SOFA_SEAT_OPTIONS, isSofaProduct } from '@/lib/sofaConfig';
import BulkPriceModal from '@/components/admin/BulkPriceModal';

const ITEMS_PER_PAGE = 10;

function AdminProductsContent() {
  const { setLoading } = useLoading();
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlPage = Number(searchParams.get('page')) || 1;

  /* ─── Server-side filter state initialized from URL params ─── */
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [categoryFilter, setCategoryFilter] = useState(urlCategory);
  const [currentPage, setCurrentPage] = useState(urlPage);

  // Sync state if URL searchParams change externally
  useEffect(() => {
    if (urlCategory !== categoryFilter) setCategoryFilter(urlCategory);
    if (urlSearch !== searchInput) {
      setSearchInput(urlSearch);
      setDebouncedSearch(urlSearch);
    }
    if (urlPage !== currentPage) setCurrentPage(urlPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory, urlSearch, urlPage]);

  // Debounce search input by 350 ms
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Sync current filter state to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryFilter) params.set('category', categoryFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (currentPage > 1) params.set('page', String(currentPage));
    const newQuery = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/admin/products${newQuery}`, { scroll: false });
  }, [categoryFilter, debouncedSearch, currentPage, router]);

  // Reset page to 1 when search or category filter changes
  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setCurrentPage(1);
  };

  const getEditHref = useCallback(
    (prodId: string) => {
      const params = new URLSearchParams();
      if (categoryFilter) params.set('category', categoryFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (currentPage > 1) params.set('page', String(currentPage));
      const qs = params.toString();
      return `/admin/products/edit/${prodId}${qs ? `?${qs}` : ''}`;
    },
    [categoryFilter, debouncedSearch, currentPage],
  );

  const getAddHref = useCallback(() => {
    const params = new URLSearchParams();
    if (categoryFilter) params.set('category', categoryFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (currentPage > 1) params.set('page', String(currentPage));
    const qs = params.toString();
    return `/admin/products/add${qs ? `?${qs}` : ''}`;
  }, [categoryFilter, debouncedSearch, currentPage]);

  /* ─── API calls ─── */
  const { data, isLoading, isFetching } = useGetProductsQuery({
    search: debouncedSearch || undefined,
    category: categoryFilter || undefined,
    limit: ITEMS_PER_PAGE,
    page: currentPage,
  });

  const { data: categories = [] } = useGetCategoriesQuery(undefined);

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleSale, { isLoading: isToggling }] = useToggleSaleMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || 1;

  const [saleModalProduct, setSaleModalProduct] = useState<any>(null);
  const [seatModalProduct, setSeatModalProduct] = useState<any>(null);
  const [salePriceInput, setSalePriceInput] = useState('');
  const [salePriceError, setSalePriceError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<any>(null);
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);

  // Inline table price editing state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [inlinePriceInput, setInlinePriceInput] = useState<string>('');
  const [inlinePriceError, setInlinePriceError] = useState<string>('');

  const handleStartInlineEdit = (product: any) => {
    setEditingPriceId(product._id);
    setInlinePriceInput(String(product.price ?? 0));
    setInlinePriceError('');
  };

  const handleCancelInlineEdit = () => {
    setEditingPriceId(null);
    setInlinePriceInput('');
    setInlinePriceError('');
  };

  const handleSaveInlinePrice = async (product: any) => {
    const num = parseFloat(inlinePriceInput);
    if (isNaN(num) || num < 0) {
      setInlinePriceError('Invalid price');
      toast.error('Please enter a valid price.');
      return;
    }

    // If user changed price back to original value (or didn't change it), cleanly exit edit mode
    if (num === product.price) {
      setEditingPriceId(null);
      setInlinePriceInput('');
      setInlinePriceError('');
      return;
    }

    try {
      await updateProduct({
        id: product._id,
        price: num,
      }).unwrap();
      toast.success(`Price updated to ₨${num.toLocaleString()}`);
      setEditingPriceId(null);
      setInlinePriceInput('');
      setInlinePriceError('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update price.');
    }
  };

  useEffect(() => {
    setLoading(isLoading || isFetching || isDeleting || isToggling);
  }, [isLoading, isFetching, isDeleting, isToggling, setLoading]);

  const handleDeleteClick = (product: any) => setDeleteConfirmProduct(product);

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

    if (!saleModalProduct.isOnSale) {
      const val = Number(salePriceInput);
      if (isNaN(val) || val <= 0 || val >= saleModalProduct.price) {
        setSalePriceError(
          `Discounted price must be between ₨1 and ₨${saleModalProduct.price - 1}`,
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
      toast.success(saleModalProduct.isOnSale ? 'Sale removed.' : 'Flash sale activated!');
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
            Manage inventory, dynamic sofa seat pricing &amp; flash sales
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsBulkPriceModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:from-black hover:to-gray-900 transition-all shadow-md cursor-pointer border border-gray-700/50"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>Bulk Price Adjust</span>
          </button>
          <Link
            href={getAddHref()}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all w-fit shadow-md"
          >
            <PlusCircle className="w-4 h-4" /> Add New Product
          </Link>
        </div>
      </div>

      {/* ─── Server-Side Filters ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            id="product-search"
            type="text"
            placeholder="Search by name, description… (server-side)"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 bg-white border border-gray-200 rounded-xl py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-black/20"
          />
          {isFetching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          )}
        </div>
        <select
          id="product-category-filter"
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none min-w-[180px]"
        >
          <option value="">All Categories</option>
          {Array.isArray(categories) &&
            categories.map((cat: string) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4 overflow-x-auto">
          {products.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs font-semibold">
              {debouncedSearch || categoryFilter
                ? 'No products match the current filters.'
                : 'No products found.'}
            </div>
          ) : (
            <>
              <table className="w-full text-left text-xs font-['Open_Sans']">
                <thead>
                  <tr className="border-b text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price / Seating</th>
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
                    const isSofa = isSofaProduct(product.name, product.category, product.tags, product.seatPricing);
                    const seatPricingCount = product.seatPricing ? Object.keys(product.seatPricing).length : 0;

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
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-gray-900 text-sm">{product.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 font-mono">
                                SKU: {product.sku}
                              </span>
                              {isSofa && (
                                <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <Armchair className="w-2.5 h-2.5" /> Sofa
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4">{product.category}</td>

                        <td className="py-4 font-bold text-black min-w-[200px]">
                          <div className="flex flex-col gap-1.5">
                            {editingPriceId === product._id ? (
                              <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                                <div className="relative flex-1">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                    ₨
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    autoFocus
                                    value={inlinePriceInput}
                                    onChange={(e) => {
                                      setInlinePriceInput(e.target.value);
                                      setInlinePriceError('');
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlinePrice(product);
                                      if (e.key === 'Escape') handleCancelInlineEdit();
                                    }}
                                    className={`w-full pl-5 pr-2 py-1 bg-white border-2 rounded-lg text-xs font-bold text-gray-900 outline-none shadow-xs ${
                                      inlinePriceError ? 'border-red-500' : 'border-black'
                                    }`}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSaveInlinePrice(product)}
                                  disabled={isUpdatingProduct}
                                  className="p-1 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                                  title="Save Price (Enter)"
                                >
                                  {isUpdatingProduct ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelInlineEdit}
                                  className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors cursor-pointer"
                                  title="Revert / Cancel (Escape)"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group">
                                <div
                                  className="flex items-center gap-1.5 cursor-pointer"
                                  onClick={() => handleStartInlineEdit(product)}
                                  title="Click to edit price inline"
                                >
                                  <span>
                                    ₨{product.isOnSale ? product.salePrice?.toLocaleString() : product.price?.toLocaleString()}
                                  </span>
                                  {product.isOnSale && (
                                    <span className="text-[10px] text-gray-400 line-through font-normal">
                                      ₨{product.price?.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleStartInlineEdit(product)}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-black p-1 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                                  title="Quick edit price"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {/* Sofa seat pricing summary badge */}
                            {isSofa && (
                              <button
                                type="button"
                                onClick={() => setSeatModalProduct(product)}
                                className="w-fit text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                                title="Click to view all sofa seat prices"
                              >
                                <Armchair className="w-3 h-3 text-amber-600" />
                                {seatPricingCount > 0 ? `${seatPricingCount} Seat Tiers` : 'Seat Pricing'}
                                <Eye className="w-2.5 h-2.5 text-amber-500" />
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-4">
                          {product.purchaseType === 'loyalty_only' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                              <Award className="w-3 h-3" /> Loyalty ({product.pointsPrice} pts)
                            </span>
                          ) : product.purchaseType === 'hybrid' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Hybrid (₨{product.price} /{' '}
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

                        <td className="py-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(product.rating ?? 4.5)
                                      ? 'text-amber-400'
                                      : 'text-gray-200'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold">
                              {(product.rating ?? 4.5).toFixed(1)}/5
                            </span>
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
                              href={getEditHref(product._id)}
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                              title="Edit Product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              disabled={isThisDeleting || !!deletingId}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={total}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </>
          )}
        </div>
      )}

      {/* ─── Sofa Seat Pricing Overview Modal ─── */}
      {seatModalProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-xl">
                  <Armchair className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    Sofa Seat Pricing Overview
                  </h3>
                  <p className="text-xs text-gray-400 font-medium truncate max-w-[280px]">
                    {seatModalProduct.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSeatModalProduct(null)}
                className="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                {SOFA_SEAT_OPTIONS.map((opt) => {
                  const customPrice = seatModalProduct.seatPricing?.[opt.key];
                  const baseNum = Number(seatModalProduct.seatPricing?.['1 seats']) || Number(seatModalProduct.price) || 0;
                  const displayPrice =
                    (customPrice !== undefined && Number(customPrice) > 0)
                      ? customPrice
                      : (baseNum > 0 ? baseNum * opt.seats : null);

                  return (
                    <div
                      key={opt.key}
                      className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col gap-1 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">{opt.label}</span>
                        <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          {opt.badge}
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-black">
                        {displayPrice !== null ? `₨${Number(displayPrice).toLocaleString()}` : <span className="text-gray-300 font-normal text-xs">Not Set</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-400 font-mono">
                SKU: {seatModalProduct.sku}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSeatModalProduct(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Close
                </button>
                <Link
                  href={getEditHref(seatModalProduct._id)}
                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Sale Trigger Modal ─── */}
      {saleModalProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-red-600" />
                {saleModalProduct.isOnSale ? 'Turn Off Flash Sale' : 'Trigger Real-Time Flash Sale'}
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
              send a real-time alert to all connected store shoppers!
            </p>

            <form onSubmit={handleSaveSale} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Original Price</label>
                <input
                  type="text"
                  disabled
                  value={`₨${saleModalProduct.price}`}
                  className="bg-gray-100 rounded-xl p-2.5 text-xs text-gray-500 font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Discounted Sale Price (PKR)</label>
                <input
                  type="number"
                  value={salePriceInput}
                  onChange={(e) => {
                    setSalePriceInput(e.target.value);
                    const val = Number(e.target.value);
                    if (isNaN(val) || val <= 0 || val >= saleModalProduct.price) {
                      setSalePriceError(
                        `Discounted price must be between ₨1 and ₨${saleModalProduct.price - 1}`,
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
                Are you sure you want to delete{' '}
                <strong className="text-black">{deleteConfirmProduct.name}</strong>?
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

      {/* ─── Bulk Price Adjustment Modal ─── */}
      <BulkPriceModal
        isOpen={isBulkPriceModalOpen}
        onClose={() => setIsBulkPriceModalOpen(false)}
        initialCategory={categoryFilter}
      />
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