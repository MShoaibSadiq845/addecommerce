'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useGetProductsQuery } from '@/store/services/productsApi';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { ProductGridSkeleton } from '@/components/ui/skeletons/ProductCardSkeleton';
import { SlidersHorizontal, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LoadingProvider, useLoading } from '@/context/LoadingContext';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const dispatch = useDispatch();
  const img = product.images?.[0] || '/images/7.png';
  const price = product.isOnSale ? product.salePrice : product.price;
  const discount = product.isOnSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: price,
      image: img,
      quantity: 1,
      size: product.sizes?.[0] || '',
      color: product.colors?.[0] || '',
    }));
    toast.success(`${product.name} added to cart!`, { duration: 1500 });
  };

  return (
    <div className="group flex flex-col gap-3 relative">
      <Link href={`/shop/${product._id}`}>
        <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden">
          <Image src={img} alt={product.name} fill
            className="object-cover group-hover:scale-105 transition-transform duration-500" />
          {product.isOnSale && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <button onClick={handleQuickAdd}
              className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors">
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>
          </div>
        </div>
      </Link>
      <Link href={`/shop/${product._id}`} className="flex flex-col gap-1 px-1">
        <h3 className="font-bold text-sm text-black line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <Stars rating={product.rating || 4.5} />
          <span className="text-xs text-gray-400">{product.rating || 4.5}/5</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-bold text-base text-black">₨{price?.toLocaleString()}</span>
          {product.isOnSale && (
            <span className="text-sm text-gray-400 line-through">₨{product.price?.toLocaleString()}</span>
          )}
        </div>
        {product.category && (
          <span className="text-[10px] text-gray-400 capitalize">{product.category}</span>
        )}
      </Link>
    </div>
  );
}

function FilterSection({ title, children, open, onToggle }: { title: string; children: React.ReactNode; open: boolean; onToggle: () => void }) {
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
  const { setIsLoading } = useLoading();

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
    [searchParams],
  );
  const activeSizes = useMemo(
    () => (searchParams.get('size') ? searchParams.get('size')!.split(',').filter(Boolean) : []),
    [searchParams],
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
  }, [activeCategory, activeIsOnSale, activeColors, activeSizes]);

  React.useEffect(() => {
    if (dynamicPriceRange.max > 0 && pendingMaxPrice === null) {
      setPendingMaxPrice(
        searchParams.get('maxPrice') ? activeMaxPrice : dynamicPriceRange.max,
      );
    }
  }, [dynamicPriceRange.max]);

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

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-8 font-['Satoshi']">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">
          {activeSearch
            ? `Search: "${activeSearch}"`
            : activeNewArrivals ? 'New Arrivals' : activeCategory || 'All Products'}
        </span>
      </nav>

      <div className="flex gap-6 items-start">
        <aside className={`shrink-0 w-64 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-1 fixed lg:static inset-y-0 left-0 z-40 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base text-black flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h3>
            {(pendingCategory || pendingIsOnSale || pendingColors.length || pendingSizes.length || effectiveMaxPrice < dynamicPriceRange.max) && (
              <button onClick={clearAll} className="text-xs text-red-500 font-bold hover:underline">
                Clear
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
                    className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-sm transition-colors ${
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

          <FilterSection title="Max Price (PKR)" open={priceOpen} onToggle={() => setPriceOpen(!priceOpen)}>
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
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Min</span>
                <span>Max: ₨{dynamicPriceRange.max.toLocaleString()}</span>
              </div>
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
                      className={`relative w-8 h-8 rounded-full transition-all focus:outline-none ${
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
                    'XXS': 'XX-Small',
                    'XS': 'X-Small',
                    'S': 'Small',
                    'M': 'Medium',
                    'L': 'Large',
                    'XL': 'X-Large',
                    'XXL': 'XX-Large',
                    '2XL': 'XX-Large',
                    '3XL': '3X-Large',
                    '4XL': '4X-Large',
                  };
                  const label = sizeLabels[s.toUpperCase()] ?? s;
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
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
            <label className="flex items-center gap-2 text-sm cursor-pointer">
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
            className="w-full bg-black text-white rounded-full py-3 text-sm font-bold hover:bg-gray-800 transition-colors mt-4 shadow-md"
          >
            Apply Filters
          </button>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-black capitalize">
                {activeSearch
                ? `Search: "${activeSearch}"`
                : activeNewArrivals ? 'New Arrivals' : activeCategory || 'All Products'}
              </h1>
              <p className="text-xs text-gray-400">{totalProducts} products found</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Sort:</span>
                <select value={sortRaw}
                  onChange={(e) => update({ sort: e.target.value, page: '1' })}
                  className="bg-transparent text-sm font-medium outline-none border-b border-gray-300 pb-0.5 cursor-pointer">
                  <option value="newest">Newest</option>
                  <option value="most-popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 bg-gray-50 rounded-2xl text-center">
              <p className="font-bold text-gray-700">No products found</p>
              <p className="text-xs text-gray-400">Try adjusting your filters.</p>
              <button onClick={() => router.replace('/shop')}
                className="mt-2 px-6 py-2 bg-black text-white rounded-full text-xs font-bold">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p: any) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <button disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-black hover:text-white hover:border-black transition-all">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <div className="flex items-center gap-1">
                {pageNumbers().map((num, i) =>
                  num === '...' ? <span key={i} className="px-2 text-gray-400">…</span> : (
                    <button key={num} onClick={() => update({ page: String(num) })}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === num ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                      {num}
                    </button>
                  )
                )}
              </div>
              <button disabled={page >= totalPages} onClick={() => update({ page: String(page + 1) })}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-black hover:text-white hover:border-black transition-all">
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