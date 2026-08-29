'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/store/services/productsApi';
import { useCreateOrderMutation } from '@/store/services/ordersApi';
import { useGetAllReviewsQuery } from '@/store/services/reviewsApi';
import { addToCart } from '@/store/slices/cartSlice';
import { useLoading } from '@/context/LoadingContext';
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Zap, Loader2, Truck, PenLine, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import ReviewModal from '@/components/storefront/ReviewModal';
import { trackAddToCart, trackInitiateCheckout } from '@/lib/fb-pixel';

import { useAddToGuestCartMutation } from '@/store/services/guestCartApi';
import { useAddToCartBackendMutation } from '@/store/services/cartApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getSessionId } from '@/lib/sessionId';

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

/* ─── Single Product Card with Add to Cart + Buy Now ─── */
function ProductCard({ product }: { product: any }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [addToGuestCart] = useAddToGuestCartMutation();
  const [addToCartBackend] = useAddToCartBackendMutation();
  const [buyingNow, setBuyingNow] = useState(false);

  const img = product.images?.[0] || '/images/7.png';
  const price = product.isOnSale ? product.salePrice : product.price;
  const discount = product.isOnSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  /* Add to Cart — local Redux only */
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({
      id: product._id, name: product.name, price,
      image: img, quantity: 1,
      size: product.sizes?.[0] || '', color: product.colors?.[0] || '',
    }));
    toast.success(`${product.name} added!`, { duration: 1500 });

    // 🔥 Meta Pixel — AddToCart
    trackAddToCart({
      name: product.name,
      contentId: product._id,
      value: price,
      currency: 'PKR',
    });
  };

  /* Buy Now — Server DB Save & Redirect to /checkout */
  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (buyingNow) return;

    setBuyingNow(true);
    try {
      const itemPayload = {
        productId: product._id,
        name: product.name,
        price,
        quantity: 1,
        size: product.sizes?.[0] || '',
        color: product.colors?.[0] || '',
        image: img,
      };

      // 1. Update Redux cart state locally
      dispatch(addToCart({
        id: product._id,
        name: product.name,
        price,
        image: img,
        quantity: 1,
        size: product.sizes?.[0] || '',
        color: product.colors?.[0] || '',
      }));

      // 🔥 Meta Pixel — InitiateCheckout
      trackInitiateCheckout({
        name: product.name,
        contentId: product._id,
        value: price,
        currency: 'PKR',
      });

      // 2. Trigger Server-side DB Save
      const sessionId = getSessionId();
      if (isAuthenticated) {
        await addToCartBackend(itemPayload).unwrap();
      } else if (sessionId) {
        await addToGuestCart({ sessionId, ...itemPayload }).unwrap();
      }

      // 3. On successful server DB response, redirect to /checkout
      router.push('/checkout');
    } catch (err: any) {
      console.warn('Buy Now DB save warning:', err);
      router.push('/checkout');
    } finally {
      setBuyingNow(false);
    }
  };

  return (
    <div className="group flex flex-col gap-3 relative">
      <Link href={`/shop/${product._id}`}>
        <div className="relative w-full aspect-[3/4] bg-[#f2f0f1] rounded-[20px] overflow-hidden">
          <Image src={img} alt={product.name} fill
            className="object-cover group-hover:scale-105 transition-transform duration-500" />
          {product.isOnSale && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {/* Hover action buttons */}
          <div className="absolute inset-x-0 bottom-0 pb-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleQuickAdd}
              className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-3.5 py-2 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={buyingNow}
              className="flex items-center gap-1.5 bg-black text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-70"
            >
              {buyingNow ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Buying…</>
              ) : (
                <><Zap className="w-3.5 h-3.5" /> Buy Now</>
              )}
            </button>
          </div>
        </div>
      </Link>
      <Link href={`/shop/${product._id}`} className="flex flex-col gap-1 px-1">
        <h3 className="font-bold text-sm sm:text-base text-black line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <Stars rating={product.rating || 4.5} />
          <span className="text-xs text-gray-500 font-medium">{product.rating || 4.5}/5</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-bold text-lg text-black">₨{price?.toLocaleString()}</span>
          {product.isOnSale && (
            <span className="font-medium text-sm text-gray-400 line-through">₨{product.price?.toLocaleString()}</span>
          )}
        </div>
      </Link>
    </div>
  );
}

/* ─── Section Heading (standalone, without arrows) ─── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
      style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
      {children}
    </h2>
  );
}

/* ─── Product Slider — 10 items, shifts 1 item at a time smoothly ─── */
function ProductSlider({
  products,
  loading,
  title,
  viewAllHref,
}: {
  products: any[];
  loading: boolean;
  title: string;
  viewAllHref: string;
}) {
  const [startIndex, setStartIndex] = useState(0);

  /* Reset startIndex when products change */
  useEffect(() => { setStartIndex(0); }, [products]);

  const maxIndex = Math.max(0, products.length - 4);
  const canPrev = startIndex > 0;
  const canNext = startIndex < maxIndex;

  const visibleProducts = products.slice(startIndex, startIndex + 4);

  /* Skeleton while loading */
  if (loading) {
    return (
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 flex flex-col gap-10">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="w-full aspect-[3/4] bg-gray-200 rounded-[20px]" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-5 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 flex flex-col gap-10">
      {/* Section header row with circular arrows */}
      <div className="flex items-center justify-between gap-4">
        <SectionHeading>{title}</SectionHeading>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setStartIndex((i) => Math.max(0, i - 1))}
            disabled={!canPrev}
            aria-label="Previous product"
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${canPrev
              ? 'border-black bg-black text-white hover:bg-gray-800'
              : 'border-gray-200 bg-white text-gray-300 cursor-not-allowed'
              }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setStartIndex((i) => Math.min(maxIndex, i + 1))}
            disabled={!canNext}
            aria-label="Next product"
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${canNext
              ? 'border-black bg-black text-white hover:bg-gray-800'
              : 'border-gray-200 bg-white text-gray-300 cursor-not-allowed'
              }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4-column grid — slides smooth 1 item at a time */}
      <div
        key={startIndex}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full"
        style={{ animation: 'fadeSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {visibleProducts.map((p: any) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {/* Step indicators */}
      {maxIndex > 0 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setStartIndex(i)}
              aria-label={`Go to position ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === startIndex ? 'bg-black w-6' : 'bg-gray-300 w-1.5 hover:bg-gray-400'
                }`}
            />
          ))}
        </div>
      )}

      <Link
        href={viewAllHref}
        className="self-center px-16 py-3.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all"
      >
        View All
      </Link>
    </section>
  );
}

/* ─── Dynamic Category Section ─── */
function CategorySection({ category }: { category: string }) {
  const { data, isLoading } = useGetProductsQuery({ category, limit: 10 });
  const products = data?.products || [];

  if (!isLoading && products.length === 0) return null;

  return (
    <>
      <ProductSlider
        products={products}
        loading={isLoading}
        title={category.toUpperCase()}
        viewAllHref={`/shop?category=${encodeURIComponent(category)}`}
      />
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <hr className="border-gray-200" />
      </div>
    </>
  );
}

/* ─── Main Home Content ─── */
function HomeContent() {
  const { data: newArrivalsData, isLoading: loadingNew, isFetching: fetchingNew } = useGetProductsQuery({ limit: 10, sort: 'newest' });
  const { data: topSellingData, isLoading: loadingTop, isFetching: fetchingTop } = useGetProductsQuery({ limit: 10, sort: 'rating' });
  const { data: categories = [], isLoading: loadingCategories, isFetching: fetchingCategories } = useGetCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: fetchedReviews = [], isLoading: loadingReviews, isFetching: fetchingReviews } = useGetAllReviewsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { setLoading } = useLoading();

  useEffect(() => {
    const isPageLoading = loadingNew || loadingTop || loadingCategories || fetchingNew || fetchingTop || fetchingCategories;
    setLoading(isPageLoading);
    return () => setLoading(false);
  }, [loadingNew, loadingTop, loadingCategories, fetchingNew, fetchingTop, fetchingCategories, setLoading]);

  const reviewsRef = useRef<HTMLDivElement>(null);
  const [liveReviews, setLiveReviews] = useState<any[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    if (fetchedReviews.length > 0) {
      setLiveReviews(fetchedReviews);
    }
  }, [fetchedReviews]);

  useEffect(() => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('new_review', (review: any) => {
      setLiveReviews((prev) => {
        if (prev.some((r) => r._id === review._id)) return prev;
        return [review, ...prev];
      });
      toast.success(`⭐ New review from ${review.name}!`, { duration: 3000 });
    });

    return () => { socket.disconnect(); };
  }, []);

  const newArrivals = newArrivalsData?.products || [];
  const topSelling = topSellingData?.products || [];

  const scrollReviews = (dir: 'left' | 'right') => {
    if (!reviewsRef.current) return;
    reviewsRef.current.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
  };


  return (
    <div className="w-full flex flex-col items-center">
      {/* Keyframe animation for page slide */}
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="w-full bg-[#ffffff] overflow-hidden py-6 md:py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Text & Stats Content */}
          <div className="flex flex-col gap-6 w-full md:w-1/2 lg:w-[48%] xl:w-[45%] shrink-0">
            {/* Free Delivery Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-bold w-fit shadow-sm border border-gray-800">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Free Delivery All Over Pakistan 🇵🇰</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-[56px] font-extrabold text-black leading-[1.1] tracking-tight"
              style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
            >
              FIND FABRICS THAT MATCHES YOUR STYLE
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-md">
              Explore our diverse range of beautifully crafted home textiles, designed to add comfort, elegance, and timeless style to every space.            </p>
            <Link
              href="/shop"
              className="w-fit px-10 py-3.5 sm:px-14 sm:py-4 bg-black text-white rounded-full font-medium text-sm sm:text-base hover:bg-gray-900 transition-colors shadow-md"
            >
              Shop Now
            </Link>

            <div className="flex flex-wrap gap-y-4 gap-x-2 pt-6 border-t border-black/10 divide-x divide-black/10">
              {[
                { value: '200+', label: 'International Brands' },
                { value: '2,000+', label: 'High-Quality Products' },
                { value: '30,000+', label: 'Happy Customers' },
              ].map(({ value, label }, index) => (
                <div key={label} className={`flex flex-col gap-1 ${index === 0 ? 'pr-4 sm:pr-6 pl-0' : 'px-4 sm:px-6'}`}>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
                    {value}
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image (Visible on Tablet md, Laptop lg, PC xl) */}
          <div className="hidden md:block relative w-full md:w-1/2 lg:w-[50%] xl:w-[52%] h-[360px] md:h-[420px] lg:h-[500px] xl:h-[560px] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <Image
              src="/images/89.jpeg"
              alt="Fabric Collection"
              fill
              className="object-cover object-right"
              priority
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════ BRANDS BAR ═══════════════════ */}
      <section className="w-full bg-black py-6 px-4 overflow-hidden">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-around gap-y-4 gap-x-6 sm:gap-x-8 lg:gap-x-0">
          {[
            'SIGNATURE COLLECTION',
            'TIMELESS FABRICS',
            'LUXE HOME',
            'ELVORA',
          ].map((name) => (
            <span
              key={name}
              className="text-white font-extrabold tracking-[0.18em] text-sm sm:text-base lg:text-xl uppercase select-none whitespace-nowrap opacity-90 hover:opacity-100 transition-opacity"
              style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════ NEW ARRIVALS ═══════════════════ */}
      <ProductSlider
        products={newArrivals}
        loading={loadingNew}
        title="NEW ARRIVALS"
        viewAllHref="/shop?sort=newest"
      />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <hr className="border-gray-200" />
      </div>

      {/* ═══════════════════ TOP SELLING ═══════════════════ */}
      <ProductSlider
        products={topSelling}
        loading={loadingTop}
        title="TOP SELLING"
        viewAllHref="/shop?sort=rating"
      />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <hr className="border-gray-200" />
      </div>

      {/* ═══════════════════ DYNAMIC CATEGORIES ═══════════════════ */}
      {!loadingCategories && Array.isArray(categories) && categories
        .filter((cat): cat is string => typeof cat === 'string' && cat.trim().length > 0)
        .map((cat) => <CategorySection key={cat} category={cat} />)}

      {/* ═══════════════════ BROWSE BY DRESS STYLE ═══════════════════ */}
      {/* <section className="w-full px-4 sm:px-6 lg:px-20 py-10">
        <div className="w-full max-w-[1440px] mx-auto bg-[#f2f0f1] rounded-[40px] p-6 sm:p-8 lg:p-14 flex flex-col items-center gap-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center tracking-tight"
            style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
            BROWSE BY DRESS STYLE
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full">
            <Link
              href="/shop?category=Casual"
              className="relative h-[200px] sm:h-[260px] rounded-[20px] overflow-hidden group bg-white col-span-1 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="absolute top-6 left-6 sm:top-8 sm:left-8 text-2xl sm:text-3xl font-bold text-black z-10" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
                Casual
              </span>
              <Image src="/images/62.png" alt="Casual" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
            </Link>
            <Link
              href="/shop?category=Formal"
              className="relative h-[200px] sm:h-[260px] rounded-[20px] overflow-hidden group bg-white col-span-1 sm:col-span-2 md:col-span-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="absolute top-6 left-6 sm:top-8 sm:left-8 text-2xl sm:text-3xl font-bold text-black z-10" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
                Formal
              </span>
              <Image src="/images/64.png" alt="Formal" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
            </Link>
            <Link
              href="/shop?category=Party"
              className="relative h-[200px] sm:h-[260px] rounded-[20px] overflow-hidden group bg-white col-span-1 sm:col-span-2 md:col-span-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="absolute top-6 left-6 sm:top-8 sm:left-8 text-2xl sm:text-3xl font-bold text-black z-10" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
                Party
              </span>
              <Image src="/images/65.png" alt="Party" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
            </Link>
            <Link
              href="/shop?category=Gym"
              className="relative h-[200px] sm:h-[260px] rounded-[20px] overflow-hidden group bg-white col-span-1 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="absolute top-6 left-6 sm:top-8 sm:left-8 text-2xl sm:text-3xl font-bold text-black z-10" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
                Gym
              </span>
              <Image src="/images/63.png" alt="Gym" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
            </Link>
          </div>
        </div>
      </section> */}

      {/* ═══════════════════ HAPPY CUSTOMERS ═══════════════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
            style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
            OUR HAPPY CUSTOMERS
          </h2>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm"
            >
              <PenLine className="w-3.5 h-3.5" />
              Write a Review
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => scrollReviews('left')}
                aria-label="Previous Reviews"
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollReviews('right')}
                aria-label="Next Reviews"
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {loadingReviews ? (
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[300px] sm:min-w-[360px] bg-gray-100 rounded-[20px] p-6 animate-pulse flex flex-col gap-4">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : liveReviews.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-gray-200 p-12 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
            <p>No reviews yet — be the first to share your experience!</p>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-2.5 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-colors"
            >
              Write a Review
            </button>
          </div>
        ) : (
          <div
            ref={reviewsRef}
            className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {liveReviews.map((r: any, idx: number) => (
              <div
                key={r._id ?? idx}
                className="min-w-[300px] sm:min-w-[360px] max-w-[380px] bg-white border border-gray-200 rounded-[20px] p-6 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow shrink-0"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Stars rating={r.rating} />
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {r.rating}.0
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-black">{r.name}</span>
                    <span className="text-green-500 text-base" title="Verified Customer">✓</span>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{r.comment}</p>

                  {/* Review Image Thumbnail */}
                  {r.image && (
                    <div
                      onClick={() => setEnlargedImage(r.image)}
                      className="relative w-full h-36 rounded-xl overflow-hidden cursor-pointer group border border-gray-100 bg-gray-50 mt-1"
                    >
                      <img
                        src={r.image}
                        alt={`Review image by ${r.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-black text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                          Click to enlarge
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  {r.productName ? (
                    <span className="truncate max-w-[180px] italic">on {r.productName}</span>
                  ) : (
                    <span>Verified Purchase</span>
                  )}
                  <span>
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : r.date ?? ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
        />

        {/* Image Lightbox Preview Modal */}
        {enlargedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEnlargedImage(null)}
          >
            <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl">
              <button
                onClick={() => setEnlargedImage(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={enlargedImage}
                alt="Enlarged review photo"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function StorefrontHomePage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen" />}>
      <HomeContent />
    </Suspense>
  );
}