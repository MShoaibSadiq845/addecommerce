'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Search,
  Loader2,
  TrendingUp,
  TrendingDown,
  Tag,
  AlertCircle,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  Save,
} from 'lucide-react';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useBulkUpdatePricesMutation,
} from '@/store/services/productsApi';
import { toast } from 'react-hot-toast';

interface BulkPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}

interface ProductPriceState {
  originalPrice: number;
  originalSalePrice: number;
  originalIsOnSale: boolean;
  priceInput: string;
  salePriceInput: string;
  currentPrice: number;
  currentSalePrice: number;
  currentIsOnSale: boolean;
  isModified: boolean;
}

type AdjustmentType =
  | 'percent_inc'
  | 'percent_dec'
  | 'fixed_inc'
  | 'fixed_dec'
  | 'set_fixed';

type TargetField = 'price' | 'salePrice' | 'both';
type RoundingOption = 'none' | 'integer' | 'round99' | 'round10';

export default function BulkPriceModal({
  isOpen,
  onClose,
  initialCategory = '',
}: BulkPriceModalProps) {
  // Category & search filtering inside the modal
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [modalSearch, setModalSearch] = useState<string>('');

  // Global Adjustment Tool Controls
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('percent_inc');
  const [adjustmentValue, setAdjustmentValue] = useState<string>('10');
  const [targetField, setTargetField] = useState<TargetField>('price');
  const [rounding, setRounding] = useState<RoundingOption>('integer');

  // Product Selection for selective bulk updates
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Local state tracking modified prices: productId -> ProductPriceState
  const [priceStates, setPriceStates] = useState<Record<string, ProductPriceState>>({});

  // API hooks
  const { data: categoriesData = [] } = useGetCategoriesQuery(undefined, { skip: !isOpen });
  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery(
    {
      category: selectedCategory || undefined,
      limit: 100, // Fetch up to 100 products for bulk editing
    },
    { skip: !isOpen },
  );

  const [bulkUpdatePrices, { isLoading: isSaving }] = useBulkUpdatePricesMutation();

  const products = useMemo(() => productsData?.products || [], [productsData]);

  // Sync selectedCategory when modal opens or initialCategory changes
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(initialCategory || '');
      setModalSearch('');
    }
  }, [isOpen, initialCategory]);

  // Synchronize price states with server data whenever modal opens or products data changes
  useEffect(() => {
    if (!isOpen || !products.length) return;

    setPriceStates((prev) => {
      const next: Record<string, ProductPriceState> = {};
      products.forEach((p: any) => {
        const id = p._id;
        const existing = prev[id];
        const serverPrice = Number(p.price) || 0;
        const serverSalePrice = Number(p.salePrice) || 0;
        const serverIsOnSale = !!p.isOnSale;

        if (existing && existing.isModified) {
          // If already modified in current session, recalculate isModified against fresh server price
          const isPriceDiff = existing.currentPrice !== serverPrice;
          const isSaleDiff = existing.currentSalePrice !== serverSalePrice;
          const isSaleToggleDiff = existing.currentIsOnSale !== serverIsOnSale;

          next[id] = {
            ...existing,
            originalPrice: serverPrice,
            originalSalePrice: serverSalePrice,
            originalIsOnSale: serverIsOnSale,
            isModified: isPriceDiff || isSaleDiff || isSaleToggleDiff,
          };
        } else {
          // Fresh state from server
          next[id] = {
            originalPrice: serverPrice,
            originalSalePrice: serverSalePrice,
            originalIsOnSale: serverIsOnSale,
            priceInput: String(serverPrice),
            salePriceInput: serverSalePrice > 0 ? String(serverSalePrice) : '',
            currentPrice: serverPrice,
            currentSalePrice: serverSalePrice,
            currentIsOnSale: serverIsOnSale,
            isModified: false,
          };
        }
      });
      return next;
    });
  }, [isOpen, products]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  // Filter products by in-modal search
  const filteredProducts = useMemo(() => {
    if (!modalSearch.trim()) return products;
    const q = modalSearch.toLowerCase().trim();
    return products.filter(
      (p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    );
  }, [products, modalSearch]);

  // Handle individual price edit (onChange)
  const handlePriceChange = (id: string, value: string) => {
    setPriceStates((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const num = parseFloat(value);
      const validNum = isNaN(num) ? 0 : Math.max(0, num);

      const isPriceModified = isNaN(num) ? true : validNum !== existing.originalPrice;
      const isSalePriceModified = existing.currentSalePrice !== existing.originalSalePrice;
      const isSaleToggleModified = existing.currentIsOnSale !== existing.originalIsOnSale;

      return {
        ...prev,
        [id]: {
          ...existing,
          priceInput: value,
          currentPrice: validNum,
          isModified: isPriceModified || isSalePriceModified || isSaleToggleModified,
        },
      };
    });
  };

  // Handle price blur (onBlur)
  const handlePriceBlur = (id: string) => {
    setPriceStates((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const num = parseFloat(existing.priceInput);
      const cleanNum = isNaN(num) ? existing.originalPrice : Math.max(0, num);

      const isPriceModified = cleanNum !== existing.originalPrice;
      const isSalePriceModified = existing.currentSalePrice !== existing.originalSalePrice;
      const isSaleToggleModified = existing.currentIsOnSale !== existing.originalIsOnSale;

      return {
        ...prev,
        [id]: {
          ...existing,
          priceInput: String(cleanNum),
          currentPrice: cleanNum,
          isModified: isPriceModified || isSalePriceModified || isSaleToggleModified,
        },
      };
    });
  };

  // Handle individual sale price edit (onChange)
  const handleSalePriceChange = (id: string, value: string) => {
    setPriceStates((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const num = parseFloat(value);
      const validNum = isNaN(num) ? 0 : Math.max(0, num);

      const isPriceModified = existing.currentPrice !== existing.originalPrice;
      const isSalePriceModified = isNaN(num) ? (existing.originalSalePrice > 0) : validNum !== existing.originalSalePrice;
      const isSaleToggleModified = existing.currentIsOnSale !== existing.originalIsOnSale;

      return {
        ...prev,
        [id]: {
          ...existing,
          salePriceInput: value,
          currentSalePrice: validNum,
          isModified: isPriceModified || isSalePriceModified || isSaleToggleModified,
        },
      };
    });
  };

  // Handle sale price blur (onBlur)
  const handleSalePriceBlur = (id: string) => {
    setPriceStates((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const num = parseFloat(existing.salePriceInput);
      const cleanNum = isNaN(num) ? 0 : Math.max(0, num);

      const isPriceModified = existing.currentPrice !== existing.originalPrice;
      const isSalePriceModified = cleanNum !== existing.originalSalePrice;
      const isSaleToggleModified = existing.currentIsOnSale !== existing.originalIsOnSale;

      return {
        ...prev,
        [id]: {
          ...existing,
          salePriceInput: cleanNum > 0 ? String(cleanNum) : '',
          currentSalePrice: cleanNum,
          isModified: isPriceModified || isSalePriceModified || isSaleToggleModified,
        },
      };
    });
  };

  // Toggle sale status for an individual product
  const handleToggleSale = (id: string) => {
    setPriceStates((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const newIsOnSale = !existing.currentIsOnSale;

      const isPriceModified = existing.currentPrice !== existing.originalPrice;
      const isSalePriceModified = existing.currentSalePrice !== existing.originalSalePrice;
      const isSaleToggleModified = newIsOnSale !== existing.originalIsOnSale;

      return {
        ...prev,
        [id]: {
          ...existing,
          currentIsOnSale: newIsOnSale,
          isModified: isPriceModified || isSalePriceModified || isSaleToggleModified,
        },
      };
    });
  };

  // Revert single product back to original values
  const handleRevertSingle = (id: string) => {
    setPriceStates((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      return {
        ...prev,
        [id]: {
          ...existing,
          priceInput: String(existing.originalPrice),
          salePriceInput: existing.originalSalePrice > 0 ? String(existing.originalSalePrice) : '',
          currentPrice: existing.originalPrice,
          currentSalePrice: existing.originalSalePrice,
          currentIsOnSale: existing.originalIsOnSale,
          isModified: false,
        },
      };
    });
  };

  // Revert all products
  const handleRevertAll = () => {
    setPriceStates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = {
          ...next[id],
          priceInput: String(next[id].originalPrice),
          salePriceInput: next[id].originalSalePrice > 0 ? String(next[id].originalSalePrice) : '',
          currentPrice: next[id].originalPrice,
          currentSalePrice: next[id].originalSalePrice,
          currentIsOnSale: next[id].originalIsOnSale,
          isModified: false,
        };
      });
      return next;
    });
    setSelectedProductIds(new Set());
    toast.success('All prices reverted to initial state');
  };

  // Apply rounding helper
  const applyRounding = useCallback((val: number, mode: RoundingOption): number => {
    if (mode === 'integer') return Math.round(val);
    if (mode === 'round10') return Math.round(val / 10) * 10;
    if (mode === 'round99') return Math.floor(val) + 0.99;
    return Number(val.toFixed(2));
  }, []);

  // Global Adjustment Tool calculation
  const handleApplyGlobalAdjustment = () => {
    const val = parseFloat(adjustmentValue);
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter a valid positive adjustment value');
      return;
    }

    const targetProducts =
      selectedProductIds.size > 0
        ? filteredProducts.filter((p: any) => selectedProductIds.has(p._id))
        : filteredProducts;

    if (targetProducts.length === 0) {
      toast.error('No products to adjust');
      return;
    }

    setPriceStates((prev) => {
      const next = { ...prev };

      targetProducts.forEach((p: any) => {
        const id = p._id;
        const current = next[id] || {
          originalPrice: Number(p.price) || 0,
          originalSalePrice: Number(p.salePrice) || 0,
          originalIsOnSale: !!p.isOnSale,
          priceInput: String(p.price || 0),
          salePriceInput: p.salePrice ? String(p.salePrice) : '',
          currentPrice: Number(p.price) || 0,
          currentSalePrice: Number(p.salePrice) || 0,
          currentIsOnSale: !!p.isOnSale,
          isModified: false,
        };

        let newPrice = current.currentPrice;
        let newSalePrice = current.currentSalePrice;

        const calculateAdjusted = (base: number) => {
          let res = base;
          if (adjustmentType === 'percent_inc') {
            res = base * (1 + val / 100);
          } else if (adjustmentType === 'percent_dec') {
            res = Math.max(0, base * (1 - val / 100));
          } else if (adjustmentType === 'fixed_inc') {
            res = base + val;
          } else if (adjustmentType === 'fixed_dec') {
            res = Math.max(0, base - val);
          } else if (adjustmentType === 'set_fixed') {
            res = val;
          }
          return applyRounding(res, rounding);
        };

        if (targetField === 'price' || targetField === 'both') {
          newPrice = calculateAdjusted(current.currentPrice);
        }

        if (targetField === 'salePrice' || targetField === 'both') {
          if (current.currentSalePrice > 0 || adjustmentType === 'set_fixed') {
            newSalePrice = calculateAdjusted(current.currentSalePrice || current.currentPrice);
          }
        }

        const isPriceModified = newPrice !== current.originalPrice;
        const isSalePriceModified = newSalePrice !== current.originalSalePrice;
        const isSaleToggleModified = current.currentIsOnSale !== current.originalIsOnSale;

        next[id] = {
          ...current,
          priceInput: String(newPrice),
          salePriceInput: newSalePrice > 0 ? String(newSalePrice) : '',
          currentPrice: newPrice,
          currentSalePrice: newSalePrice,
          isModified: isPriceModified || isSalePriceModified || isSaleToggleModified,
        };
      });

      return next;
    });

    toast.success(
      `Applied ${
        adjustmentType.includes('percent') ? `${val}%` : `₨${val}`
      } adjustment to ${targetProducts.length} product(s)!`,
    );
  };

  // Selection handlers
  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map((p: any) => p._id)));
    }
  };

  // Count modified items
  const modifiedItems = useMemo(() => {
    return Object.entries(priceStates)
      .filter(([_, state]) => state.isModified)
      .map(([id, state]) => ({
        id,
        price: state.currentPrice,
        salePrice: state.currentSalePrice,
        isOnSale: state.currentIsOnSale,
      }));
  }, [priceStates]);

  const modifiedCount = modifiedItems.length;

  // Save all modified prices via MongoDB bulkWrite
  const handleSaveBulkChanges = async () => {
    if (modifiedCount === 0) {
      toast.error('No changes detected to save.');
      return;
    }

    try {
      const response = await bulkUpdatePrices(modifiedItems).unwrap();
      toast.success(
        response.message || `Successfully updated ${modifiedCount} product prices in bulk!`,
      );

      // Re-baseline the local state with the newly saved values
      setPriceStates((prev) => {
        const next = { ...prev };
        modifiedItems.forEach((item) => {
          if (next[item.id]) {
            next[item.id] = {
              ...next[item.id],
              originalPrice: item.price,
              originalSalePrice: item.salePrice ?? 0,
              originalIsOnSale: !!item.isOnSale,
              isModified: false,
            };
          }
        });
        return next;
      });

      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save bulk price changes.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 font-['Rubik'] animate-in zoom-in-95 duration-200">
        {/* ─── Modal Header ─── */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shadow-black/10">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Bulk Price Adjustment
                </h2>
                <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-gray-200">
                  MongoDB bulkWrite
                </span>
                {modifiedCount > 0 && (
                  <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                    {modifiedCount} Modified
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-['Open_Sans']">
                Filter by category, apply bulk percentage/fixed adjustments, and save all changes in a single atomic request.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-9 h-9 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── Category Filter & Global Adjustment Bar ─── */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/70 space-y-4">
          {/* Top Controls: Category & Search Filter */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mr-1">
                <Filter className="w-3.5 h-3.5 text-gray-500" /> Category:
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === ''
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                }`}
              >
                All Categories
              </button>
              {Array.isArray(categoriesData) &&
                categoriesData.map((cat: string) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
            </div>

            {/* In-Modal Search */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products in modal..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-black/20"
              />
              {modalSearch && (
                <button
                  onClick={() => setModalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Global Adjustment Tool Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Global Tool:</span>
              </div>

              {/* Adjustment Mode Selector */}
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="percent_inc">Increase by % (+ %)</option>
                <option value="percent_dec">Decrease by % (- %)</option>
                <option value="fixed_inc">Increase by Fixed (₨ +)</option>
                <option value="fixed_dec">Decrease by Fixed (₨ -)</option>
                <option value="set_fixed">Set Exact Price (₨ =)</option>
              </select>

              {/* Adjustment Input Value */}
              <div className="relative w-28">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(e.target.value)}
                  placeholder="Value"
                  className="w-full pl-3 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/10"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">
                  {adjustmentType.includes('percent') ? '%' : '₨'}
                </span>
              </div>

              {/* Target Field */}
              <select
                value={targetField}
                onChange={(e) => setTargetField(e.target.value as TargetField)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="price">Regular Price Only</option>
                <option value="salePrice">Sale Price Only</option>
                <option value="both">Both Regular & Sale</option>
              </select>

              {/* Rounding Mode */}
              <select
                value={rounding}
                onChange={(e) => setRounding(e.target.value as RoundingOption)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="integer">Round to ₨1 (Integer)</option>
                <option value="round10">Round to ₨10</option>
                <option value="round99">Round to .99</option>
                <option value="none">Exact Decimals</option>
              </select>
            </div>

            {/* Apply & Reset Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleApplyGlobalAdjustment}
                className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Apply to {selectedProductIds.size > 0 ? `${selectedProductIds.size} Selected` : 'All'}
              </button>

              {modifiedCount > 0 && (
                <button
                  type="button"
                  onClick={handleRevertAll}
                  className="flex items-center gap-1 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Revert all changes"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Revert
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Products Table / List ─── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoadingProducts ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
              <p className="text-xs font-semibold">Loading products for bulk adjustment...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs font-semibold flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-6 h-6 text-gray-300" />
              <p>No products found matching the current filters.</p>
            </div>
          ) : (
            <div className="border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs font-['Open_Sans'] border-collapse">
                <thead>
                  <tr className="bg-gray-100/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 w-10 text-center">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="text-gray-500 hover:text-black transition-colors"
                        title="Select All"
                      >
                        {selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-black" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">Category / SKU</th>
                    <th className="py-3 px-3">Original Price</th>
                    <th className="py-3 px-3 w-48">New Regular Price</th>
                    <th className="py-3 px-3 w-48">Sale Price & Status</th>
                    <th className="py-3 px-3 text-center w-28">Price Delta</th>
                    <th className="py-3 px-3 text-right w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredProducts.map((p: any) => {
                    const id = p._id;
                    const state = priceStates[id] || {
                      originalPrice: Number(p.price) || 0,
                      originalSalePrice: Number(p.salePrice) || 0,
                      originalIsOnSale: !!p.isOnSale,
                      priceInput: String(p.price || 0),
                      salePriceInput: p.salePrice ? String(p.salePrice) : '',
                      currentPrice: Number(p.price) || 0,
                      currentSalePrice: Number(p.salePrice) || 0,
                      currentIsOnSale: !!p.isOnSale,
                      isModified: false,
                    };

                    const isSelected = selectedProductIds.has(id);
                    const priceDiff = state.currentPrice - state.originalPrice;
                    const percentDiff =
                      state.originalPrice > 0
                        ? ((priceDiff / state.originalPrice) * 100).toFixed(1)
                        : '0';

                    return (
                      <tr
                        key={id}
                        className={`transition-colors ${
                          state.isModified
                            ? 'bg-amber-50/30 hover:bg-amber-50/50'
                            : isSelected
                            ? 'bg-blue-50/30 hover:bg-blue-50/50'
                            : 'hover:bg-gray-50/60'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectProduct(id)}
                            className="text-gray-400 hover:text-black transition-colors cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-black" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Product info */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                              {p.images?.[0] ? (
                                <Image
                                  src={p.images[0]}
                                  alt={p.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                                  No Img
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-[220px]">
                              <p className="font-bold text-gray-900 truncate font-['Rubik']">
                                {p.name}
                              </p>
                              <span className="text-[11px] text-gray-400">
                                Stock: {p.stock}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category & SKU */}
                        <td className="py-3 px-3">
                          <span className="inline-block bg-gray-100 text-gray-700 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-gray-200/80 mb-0.5">
                            {p.category}
                          </span>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {p.sku || 'N/A'}
                          </p>
                        </td>

                        {/* Original Price */}
                        <td className="py-3 px-3 font-semibold text-gray-600">
                          <div>₨{state.originalPrice.toLocaleString()}</div>
                          {state.originalSalePrice > 0 && (
                            <div className="text-[10px] text-red-500 font-bold">
                              Sale: ₨{state.originalSalePrice.toLocaleString()}
                            </div>
                          )}
                        </td>

                        {/* Editable New Regular Price */}
                        <td className="py-3 px-3">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                              ₨
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={state.priceInput}
                              onChange={(e) => handlePriceChange(id, e.target.value)}
                              onBlur={() => handlePriceBlur(id)}
                              className={`w-full pl-6 pr-2 py-1.5 rounded-xl text-xs font-bold outline-none border transition-all ${
                                state.currentPrice !== state.originalPrice
                                  ? 'border-amber-400 bg-amber-50/50 text-amber-950 ring-2 ring-amber-300/30'
                                  : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 text-gray-900'
                              }`}
                            />
                          </div>
                        </td>

                        {/* Editable Sale Price & Toggle */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                ₨
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={state.salePriceInput}
                                onChange={(e) => handleSalePriceChange(id, e.target.value)}
                                onBlur={() => handleSalePriceBlur(id)}
                                placeholder="Sale Price"
                                className={`w-full pl-6 pr-2 py-1.5 rounded-xl text-xs font-bold outline-none border transition-all ${
                                  state.currentSalePrice !== state.originalSalePrice
                                    ? 'border-red-400 bg-red-50/50 text-red-950 ring-2 ring-red-300/30'
                                    : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 text-gray-900'
                                }`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleSale(id)}
                              className={`p-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                                state.currentIsOnSale
                                  ? 'bg-red-500 text-white border-red-600 shadow-xs'
                                  : 'bg-gray-100 text-gray-400 border-gray-200 hover:text-gray-700'
                              }`}
                              title={state.currentIsOnSale ? 'On Sale (Click to disable)' : 'Not on sale (Click to enable)'}
                            >
                              <Tag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Price Delta Badge */}
                        <td className="py-3 px-3 text-center">
                          {priceDiff === 0 ? (
                            <span className="text-[11px] font-semibold text-gray-400">
                              —
                            </span>
                          ) : priceDiff > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                              <TrendingUp className="w-3 h-3" />
                              +₨{priceDiff.toLocaleString()} (+{percentDiff}%)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                              <TrendingDown className="w-3 h-3" />
                              -₨{Math.abs(priceDiff).toLocaleString()} ({percentDiff}%)
                            </span>
                          )}
                        </td>

                        {/* Single Row Revert */}
                        <td className="py-3 px-3 text-right">
                          {state.isModified ? (
                            <button
                              type="button"
                              onClick={() => handleRevertSingle(id)}
                              className="text-gray-400 hover:text-amber-700 hover:bg-amber-100 p-1.5 rounded-lg transition-all cursor-pointer"
                              title="Revert this product back to original"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── Modal Footer ─── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500 font-['Open_Sans']">
            {modifiedCount > 0 ? (
              <span className="font-bold text-emerald-700">
                ⚡ {modifiedCount} product{modifiedCount > 1 ? 's' : ''} modified and ready to be saved with MongoDB bulkWrite.
              </span>
            ) : (
              <span>No modifications made yet. Edit prices above or use the Global Tool.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveBulkChanges}
              disabled={isSaving || modifiedCount === 0}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                modifiedCount > 0 && !isSaving
                  ? 'bg-black hover:bg-gray-800 text-white shadow-black/20'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving with bulkWrite...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save {modifiedCount > 0 ? `(${modifiedCount}) Changes` : 'Changes'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
