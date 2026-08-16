'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useGetProductsQuery } from '@/store/services/productsApi';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { ProductGridSkeleton } from '@/components/ui/skeletons/ProductCardSkeleton';
import { SlidersHorizontal, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ShoppingCart, Star, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LoadingProvider, useLoading } from '@/context/LoadingContext';

/* ─── Rating Stars helper ─── */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const dispatch = useDispatch();
  const img = product.images?.[0] || '/images/7.png';
  const price = product.isOnSale ? product.salePrice : product.price;
  const discount = product.isOnSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: price,
        image: img,
        quantity: 1,
        size: product.sizes?.[0] || '',
        color: product.colors?.[0] || '',
      })
    );
    toast.success(`${product.name} added to cart!`, { duration: 1500 });
  };

  const reviewCount = product.reviewsCount ?? product.numReviews ?? 0;

  return (
    <div className="group flex flex-col gap-3 relative">
      <Link href={`/shop/${product._id}`}>
        <div className="relative w-full aspect-[3/4] bg-[#f2f0f1] rounded-[20px] overflow-hidden">
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.isOnSale && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 pb-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleQuickAdd}
              className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>
          </div>
        </div>
      </Link>
      <Link href={`/shop/${product._id}`} className="flex flex-col gap-1 px-1">
        <h3 className="font-bold text-sm sm:text-base text-black line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <Stars rating={product.rating || 4.5} />
          <span className="text-xs text-gray-500 font-medium">
            {product.rating || 4.5}/5 {reviewCount > 0 && <span className="text-gray-400">({reviewCount})</span>}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-bold text-lg text-black">₨{price?.toLocaleString()}</span>
          {product.isOnSale && (
            <span className="font-medium text-sm text-gray-400 line-through">₨{product.price?.toLocaleString()}</span>
          )}
        </div>
        {product.category && (
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{product.category}</span>
        )}
      </Link>
    </div>
  );
}

function FilterSection({
  title,
  children,
  open,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t border-gray-100 pt-4">
      <button onClick={onToggle} className="w-full flex items-center justify-between mb-3 group">
        <span className="font-bold text-sm text-black">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
        )}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setIsLoading } = useLoading() || {};

  const page = Number(searchParams.get('page') || '1');
  const sortRaw = searchParams.get('sort') || 'newest';

  const [pendingCategory, setPendingCategory] = useState('');
  const [pendingIsOnSale, setPendingIsOnSale] = useState(false);
  const [pendingMaxPrice, setPendingMaxPrice] = useState<number | null>(null);
  const [pendingColors, setPendingColors] = useState<string[]>([]);
  const [pendingSizes, setPendingSizes] = useState<string[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [colorsOpen, setColorsOpen] = useState(true);
  const [sizesOpen, setSizesOpen] = useState(true);
  const [offersOpen, setOffersOpen] = useState(true);

  const activeCategory = searchParams.get('category') || '';
  const activeIsOnSale = searchParams.get('isOnSale') === 'true';
  const activeNewArrivals = searchParams.get('newArrivals') === 'true';
  const activeSearch = searchParams.get('search') || '';
  const activeMaxPrice = Number(searchParams.get('maxPrice') || '50000');
  const activeColors = useMemo(
    () => (searchParams.get('color') ? searchParams.get('color')!.split(',').filter(Boolean) : []),
    [searchParams]
  );
  const activeSizes = useMemo(
    () => (searchParams.get('size') ? searchParams.get('size')!.split(',').filter(Boolean) : []),
    [searchParams]
  );

  const { data: allProductsData } = useGetProductsQuery({ limit: 1000 });
  const allProducts = allProductsData?.products || [];

  const dynamicCategories = useMemo(() => {
    return Array.from(new Set(allProducts.map((p: any) => p.category).filter(Boolean)));
  }, [allProducts]);

  const dynamicColors = useMemo(() => {
    const colors = new Set<string>();
    allProducts.forEach((p: any) => {
      if (p.colors && Array.isArray(p.colors)) {
        p.colors.forEach((c: string) => colors.add(c));
      }
    });
    return Array.from(colors);
  }, [allProducts]);

  const dynamicSizes = useMemo(() => {
    const sizes = new Set<string>();
    allProducts.forEach((p: any) => {
      if (p.sizes && Array.isArray(p.sizes)) {
        p.sizes.forEach((s: string) => sizes.add(s));
      }
    });
    return Array.from(sizes);
  }, [allProducts]);

  const dynamicPriceRange = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 50000 };
    const prices = allProducts
      .map((p: any) => (p.isOnSale ? p.salePrice : p.price))
      .filter((p: any) => p > 0);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [allProducts]);

  React.useEffect(() => {
    setPendingCategory(activeCategory);
    setPendingIsOnSale(activeIsOnSale);
    setPendingColors(activeColors);
    setPendingSizes(activeSizes);
    if (searchParams.get('maxPrice')) {
      setPendingMaxPrice(activeMaxPrice);
    }
  }, [activeCategory, activeIsOnSale, activeColors, activeSizes, activeMaxPrice, searchParams]);

  React.useEffect(() => {
    if (dynamicPriceRange.max > 0 && pendingMaxPrice === null) {
      setPendingMaxPrice(
        searchParams.get('maxPrice') ? activeMaxPrice : dynamicPriceRange.max
      );
    }
  }, [dynamicPriceRange.max, pendingMaxPrice, searchParams, activeMaxPrice]);

  const effectiveMaxPrice = pendingMaxPrice ?? dynamicPriceRange.max;
  const { data, isLoading } = useGetProductsQuery({
    page,
    limit: activeNewArrivals ? 100 : 9,
    sort: sortRaw,
    ...(activeSearch && { search: activeSearch }),
    ...(activeCategory && { category: activeCategory }),
    ...(activeIsOnSale && { isOnSale: true }),
    ...(activeNewArrivals && { newArrivals: true }),
    ...(activeMaxPrice < dynamicPriceRange.max && { maxPrice: activeMaxPrice }),
    ...(activeColors.length && { color: activeColors.join(',') }),
    ...(activeSizes.length && { size: activeSizes.join(',') }),
  });

  React.useEffect(() => {
    if (setIsLoading) {
      setIsLoading(isLoading);
    }
  }, [isLoading, setIsLoading]);

  const products = data?.products || [];
  const totalPages = data?.pages || 1;
  const totalProducts = data?.total || 0;

  const update = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '') params.delete(k);
      else params.set(k, v);
    });
    router.replace(`/shop?${params.toString()}`);
  };

  const applyFilters = () => {
    update({
      category: pendingCategory || undefined,
      isOnSale: pendingIsOnSale ? 'true' : undefined,
      maxPrice: effectiveMaxPrice < dynamicPriceRange.max ? String(effectiveMaxPrice) : undefined,
      color: pendingColors.length ? pendingColors.join(',') : undefined,
      size: pendingSizes.length ? pendingSizes.join(',') : undefined,
      page: '1',
    });
    setSidebarOpen(false);
  };

  const clearAll = () => {
    setPendingCategory('');
    setPendingIsOnSale(false);
    setPendingMaxPrice(dynamicPriceRange.max);
    setPendingColors([]);
    setPendingSizes([]);
    router.replace('/shop');
  };

  const toggleColor = (c: string) => {
    setPendingColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const toggleSize = (s: string) => {
    setPendingSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const pageNumbers = () => {
    const nums: (number | '...')[] = [];
    for (let i = 1; i <= Math.min(totalPages, 10); i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) nums.push(i);
      else if (nums[nums.length - 1] !== '...') nums.push('...');
    }
    return nums;
  };

  const hasActiveFilters = Boolean(
    activeCategory || activeIsOnSale || activeColors.length > 0 || activeSizes.length > 0 || activeMaxPrice < dynamicPriceRange.max
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-8">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">
          {activeSearch
            ? `Search: "${activeSearch}"`
            : activeNewArrivals ? 'New Arrivals' : activeCategory || 'All Products'}
        </span>
      </nav>

      <div className="flex gap-8 items-start">
        {/* ═══════════════════ SIDEBAR FILTERS ═══════════════════ */}
        <aside
          className={`shrink-0 w-72 bg-white border border-gray-200 rounded-[24px] p-6 flex flex-col gap-2 fixed lg:static inset-y-0 left-0 z-40 overflow-y-auto transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-black flex items-center gap-2" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h3>
            {hasActiveFilters && (
              <button onClick={clearAll} className="text-xs text-red-500 font-bold hover:underline">
                Clear All
              </button>
            )}
          </div>

          {dynamicCategories.length > 0 && (
            <FilterSection title="Category" open={categoryOpen} onToggle={() => setCategoryOpen(!categoryOpen)}>
              <div className="flex flex-col gap-1">
                {dynamicCategories.map((cat: any) => (
                  <button
                    key={cat}
                    onClick={() => setPendingCategory(pendingCategory === cat ? '' : cat)}
                    className={`flex items-center justify-between py-2 px-2.5 rounded-xl text-sm transition-colors ${
                      pendingCategory === cat
                        ? 'text-black font-bold bg-gray-100'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <span className="capitalize">{cat}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          <FilterSection title="Price" open={priceOpen} onToggle={() => setPriceOpen(!priceOpen)}>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs text-gray-600 font-semibold">
                <span>₨{dynamicPriceRange.min.toLocaleString()}</span>
                <span className="text-black font-bold">₨{effectiveMaxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={dynamicPriceRange.min}
                max={dynamicPriceRange.max}
                step={Math.max(1, Math.floor((dynamicPriceRange.max - dynamicPriceRange.min) / 100))}
                value={effectiveMaxPrice}
                onChange={(e) => setPendingMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 rounded-full accent-black cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #000 ${
                    ((effectiveMaxPrice - dynamicPriceRange.min) /
                      Math.max(1, dynamicPriceRange.max - dynamicPriceRange.min)) *
                    100
                  }%, #e5e7eb ${
                    ((effectiveMaxPrice - dynamicPriceRange.min) /
                      Math.max(1, dynamicPriceRange.max - dynamicPriceRange.min)) *
                    100
                  }%)`,
                }}
              />
            </div>
          </FilterSection>

          {dynamicColors.length > 0 && (
            <FilterSection title="Colors" open={colorsOpen} onToggle={() => setColorsOpen(!colorsOpen)}>
              <div className="flex flex-wrap gap-2.5">
                {dynamicColors.map((c: any) => {
                  const isSelected = pendingColors.includes(c);
                  const colorMap: Record<string, string> = {
                    white: '#ffffff',
                    black: '#000000',
                    gray: '#9ca3af',
                    grey: '#9ca3af',
                    red: '#ef4444',
                    blue: '#3b82f6',
                    green: '#22c55e',
                    yellow: '#eab308',
                    orange: '#f97316',
                    purple: '#a855f7',
                    pink: '#ec4899',
                    brown: '#92400e',
                    navy: '#1e3a5f',
                    beige: '#d4b896',
                    cream: '#fef9c3',
                    maroon: '#7f1d1d',
                    teal: '#14b8a6',
                    cyan: '#06b6d4',
                    indigo: '#6366f1',
                    lime: '#84cc16',
                    magenta: '#d946ef',
                    gold: '#ca8a04',
                    silver: '#cbd5e1',
                    olive: '#65a30d',
                    coral: '#fb7185',
                    violet: '#8b5cf6',
                  };
                  const bg = colorMap[c.toLowerCase()] ?? c.toLowerCase();
                  const isLight = ['white', 'cream', 'beige', 'yellow', 'lime', 'silver'].includes(c.toLowerCase());

                  return (
                    <button
                      key={c}
                      onClick={() => toggleColor(c)}
                      title={c}
                      aria-label={`${isSelected ? 'Deselect' : 'Select'} color ${c}`}
                      className={`relative w-9 h-9 rounded-full transition-all focus:outline-none ${
                        isLight ? 'border border-gray-300' : ''
                      } ${isSelected ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: bg }}
                    >
                      {isSelected && (
                        <span className={`absolute inset-0 flex items-center justify-center text-xs font-black ${isLight ? 'text-black' : 'text-white'}`}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </FilterSection>
          )}

          {dynamicSizes.length > 0 && (
            <FilterSection title="Size" open={sizesOpen} onToggle={() => setSizesOpen(!sizesOpen)}>
              <div className="flex flex-wrap gap-2">
                {dynamicSizes.map((s: any) => {
                  const sizeLabels: Record<string, string> = {
                    XXS: 'XX-Small',
                    XS: 'X-Small',
                    S: 'Small',
                    M: 'Medium',
                    L: 'Large',
                    XL: 'X-Large',
                    XXL: 'XX-Large',
                    '2XL': 'XX-Large',
                    '3XL': '3X-Large',
                    '4XL': '4X-Large',
                  };
                  const label = sizeLabels[s.toUpperCase()] ?? s;
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                        pendingSizes.includes(s)
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-[#F0F0F0] text-gray-700 border-transparent hover:border-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>
          )}

          <FilterSection title="Offers" open={offersOpen} onToggle={() => setOffersOpen(!offersOpen)}>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={pendingIsOnSale}
                onChange={(e) => setPendingIsOnSale(e.target.checked)}
                className="w-4 h-4 accent-black rounded"
              />
              <span className="font-medium text-gray-700">On Sale</span>
            </label>
          </FilterSection>

          <button
            onClick={applyFilters}
            className="w-full bg-black text-white rounded-full py-3.5 text-sm font-bold hover:bg-gray-900 transition-colors mt-4 shadow-md"
          >
            Apply Filters
          </button>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black capitalize" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
                {activeSearch
                  ? `Search: "${activeSearch}"`
                  : activeNewArrivals ? 'New Arrivals' : activeCategory || 'All Products'}
              </h1>
              <p className="text-xs text-gray-500 mt-1">Showing {products.length} of {totalProducts} products available</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full text-sm font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Sort by:</span>
                <select
                  value={sortRaw}
                  onChange={(e) => update({ sort: e.target.value, page: '1' })}
                  className="bg-transparent text-sm font-bold text-black outline-none cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="rating">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-gray-400 font-semibold">Active:</span>
              {activeCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-black text-xs font-medium rounded-full capitalize">
                  {activeCategory}
                  <button onClick={() => update({ category: undefined, page: '1' })} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {activeIsOnSale && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                  On Sale
                  <button onClick={() => update({ isOnSale: undefined, page: '1' })} className="hover:text-red-800">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {activeMaxPrice < dynamicPriceRange.max && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-black text-xs font-medium rounded-full">
                  Max: ₨{activeMaxPrice.toLocaleString()}
                  <button onClick={() => update({ maxPrice: undefined, page: '1' })} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {activeColors.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-black text-xs font-medium rounded-full capitalize">
                  Color: {c}
                  <button
                    onClick={() => {
                      const newColors = activeColors.filter((x) => x !== c);
                      update({ color: newColors.length ? newColors.join(',') : undefined, page: '1' });
                    }}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {activeSizes.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-black text-xs font-medium rounded-full uppercase">
                  Size: {s}
                  <button
                    onClick={() => {
                      const newSizes = activeSizes.filter((x) => x !== s);
                      update({ size: newSizes.length ? newSizes.join(',') : undefined, page: '1' });
                    }}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button onClick={clearAll} className="text-xs text-red-500 font-bold hover:underline ml-2">
                Clear All
              </button>
            </div>
          )}

          {isLoading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 bg-[#f2f0f1] rounded-[24px] text-center px-4">
              <p className="font-bold text-lg text-black">No products found</p>
              <p className="text-xs text-gray-500">Try adjusting your filters or search query.</p>
              <button
                onClick={clearAll}
                className="mt-3 px-8 py-3 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-900 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
              <button
                disabled={page <= 1}
                onClick={() => update({ page: String(page - 1) })}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-black hover:text-white hover:border-black transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <div className="flex items-center gap-1">
                {pageNumbers().map((num, i) =>
                  num === '...' ? (
                    <span key={i} className="px-2 text-gray-400">…</span>
                  ) : (
                    <button
                      key={num}
                      onClick={() => update({ page: String(num) })}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === num ? 'bg-black text-white font-bold' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => update({ page: String(page + 1) })}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-black hover:text-white hover:border-black transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <LoadingProvider>
      <Suspense fallback={<div className="p-12"><ProductGridSkeleton count={9} /></div>}>
        <ShopContent />
      </Suspense>
    </LoadingProvider>
  );
}