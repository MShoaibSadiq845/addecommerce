'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useGetProductsQuery } from '@/store/services/productsApi';
import { useGetAllReviewsQuery } from '@/store/services/reviewsApi';
import { addToCart } from '@/store/slices/cartSlice';
import { LoadingProvider, useLoading } from '@/context/LoadingContext';
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

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
    dispatch(addToCart({
      id: product._id, name: product.name, price,
      image: img, quantity: 1,
      size: product.sizes?.[0] || '', color: product.colors?.[0] || '',
    }));
    toast.success(`${product.name} added!`, { duration: 1500 });
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
          <div className="absolute inset-x-0 bottom-0 pb-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleQuickAdd}
              className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors">
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
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

/* ─── Horizontal scroll product row ─── */
function ProductRow({ products, loading }: { products: any[]; loading: boolean }) {
  if (loading) return (
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
  );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
      {products.slice(0, 4).map((p: any) => <ProductCard key={p._id} product={p} />)}
    </div>
  );
}

/* ─── Section heading ─── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center tracking-tight"
      style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
      {children}
    </h2>
  );
}

/* ─── Main Home Content ─── */
function HomeContent() {
  const { data: newArrivalsData, isLoading: loadingNew } = useGetProductsQuery({ limit: 4, sort: 'newest' });
  const { data: topSellingData, isLoading: loadingTop } = useGetProductsQuery({ limit: 4, sort: 'rating' });
  const { data: fetchedReviews = [], isLoading: loadingReviews } = useGetAllReviewsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { setLoading } = useLoading();
  const reviewsRef = useRef<HTMLDivElement>(null);

  const [liveReviews, setLiveReviews] = useState<any[]>([]);

  useEffect(() => {
    if (loadingNew || loadingTop || loadingReviews) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [loadingNew, loadingTop, loadingReviews, setLoading]);

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

    return () => {
      socket.disconnect();
    };
  }, []);

  const newArrivals = newArrivalsData?.products || [];
  const topSelling = topSellingData?.products || [];

  const scrollReviews = (dir: 'left' | 'right') => {
    if (!reviewsRef.current) return;
    reviewsRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  const brands = [
    { label: 'VERSACE', src: '/images/54.png' },
    { label: 'ZARA', src: '/images/55.png' },
    { label: 'GUCCI', src: '/images/56.png' },
    { label: 'PRADA', src: '/images/57.png' },
    { label: 'Calvin Klein', src: '/images/58.png' },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="w-full bg-[#f2f0f1] overflow-hidden relative">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 pt-10 pb-0 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6">
          <div className="flex flex-col gap-6 max-w-xl z-10 pb-10 lg:pb-16 self-center">
            <h1
              className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-black leading-[1.05] tracking-tight"
              style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
            >
              FIND CLOTHES THAT MATCHES YOUR STYLE
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-md">
              Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
            </p>
            <Link
              href="/shop"
              className="w-fit px-14 py-4 bg-black text-white rounded-full font-medium text-base hover:bg-gray-900 transition-colors"
            >
              Shop Now
            </Link>

            <div className="flex flex-wrap gap-0 pt-6 border-t border-black/10 divide-x divide-black/10">
              {[
                { value: '200+', label: 'International Brands' },
                { value: '2,000+', label: 'High-Quality Products' },
                { value: '30,000+', label: 'Happy Customers' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col gap-1 pr-8 last:pr-0 pl-8 first:pl-0">
                  <span className="text-2xl lg:text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
                    {value}
                  </span>
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <Image
            src="/images/59.png"
            alt="Fashion Models"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>
      </section>

      {/* ═══════════════════ BRANDS BAR ═══════════════════ */}
      <section className="w-full bg-black py-7 px-4">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-around gap-6 lg:gap-0">
          {brands.map(({ label, src }) => (
            <div key={label} className="h-8 flex items-center">
              <Image
                src={src}
                alt={label}
                width={120}
                height={32}
                className="object-contain brightness-0 invert opacity-90"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ NEW ARRIVALS ═══════════════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 flex flex-col items-center gap-10">
        <SectionHeading>NEW ARRIVALS</SectionHeading>
        <ProductRow products={newArrivals} loading={loadingNew} />
        <Link
          href="/shop?sort=newest"
          className="px-16 py-3.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all"
        >
          View All
        </Link>
      </section>

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <hr className="border-gray-200" />
      </div>

      {/* ═══════════════════ TOP SELLING ═══════════════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 flex flex-col items-center gap-10">
        <SectionHeading>TOP SELLING</SectionHeading>
        <ProductRow products={topSelling} loading={loadingTop} />
        <Link
          href="/shop?sort=rating"
          className="px-16 py-3.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all"
        >
          View All
        </Link>
      </section>

      {/* ═══════════════════ BROWSE BY DRESS STYLE ═══════════════════ */}
      <section className="w-full px-4 sm:px-6 lg:px-20 py-10">
        <div className="w-full max-w-[1440px] mx-auto bg-[#f2f0f1] rounded-[40px] p-6 sm:p-8 lg:p-14 flex flex-col items-center gap-10">
          <SectionHeading>BROWSE BY DRESS STYLE</SectionHeading>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
            <Link
              href="/shop?category=Casual"
              className="relative h-[170px] sm:h-[220px] rounded-[20px] overflow-hidden group bg-white col-span-1"
            >
              <Image src="/images/15.png" alt="Casual" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </Link>
            <Link
              href="/shop?category=Formal"
              className="relative h-[170px] sm:h-[220px] rounded-[20px] overflow-hidden group bg-white col-span-1 md:col-span-2"
            >
              <Image src="/images/16.png" alt="Formal" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </Link>
            <Link
              href="/shop?category=Party"
              className="relative h-[170px] sm:h-[220px] rounded-[20px] overflow-hidden group bg-white col-span-1 md:col-span-2"
            >
              <Image src="/images/17.png" alt="Party" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </Link>
            <Link
              href="/shop?category=Gym"
              className="relative h-[170px] sm:h-[220px] rounded-[20px] overflow-hidden group bg-white col-span-1"
            >
              <Image src="/images/18.png" alt="Gym" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HAPPY CUSTOMERS ═══════════════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <SectionHeading>OUR HAPPY CUSTOMERS</SectionHeading>
          <div className="flex gap-2">
            <button
              onClick={() => scrollReviews('left')}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollReviews('right')}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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
          <div className="rounded-[20px] border border-dashed border-gray-200 p-12 text-center text-gray-400 text-sm">
            No reviews yet — be the first to share your experience!
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
                className="min-w-[300px] sm:min-w-[360px] bg-white border border-gray-200 rounded-[20px] p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <Stars rating={r.rating} />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-black">{r.name}</span>
                  <span className="text-green-500 text-base">✓</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{r.comment}</p>
                {r.productName && (
                  <p className="text-xs text-gray-400 italic">on {r.productName}</p>
                )}
                <p className="text-xs text-gray-400">
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : r.date ?? ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function StorefrontHomePage() {
  return (
    <LoadingProvider>
      <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading...</div>}>
        <HomeContent />
      </Suspense>
    </LoadingProvider>
  );
}