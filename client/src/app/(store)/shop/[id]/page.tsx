'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetProductByIdQuery, useGetProductsQuery } from '@/store/services/productsApi';
import { useGetReviewsByProductQuery } from '@/store/services/reviewsApi';
import { addToCart } from '@/store/slices/cartSlice';
import { useAddToGuestCartMutation } from '@/store/services/guestCartApi';
import { useAddToCartBackendMutation } from '@/store/services/cartApi';
import { getSessionId } from '@/lib/sessionId';
import { ProductDetailSkeleton } from '@/components/ui/skeletons/ProductDetailSkeleton';
import ReviewModal from '@/components/storefront/ReviewModal';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, PenLine, Star, RefreshCw, Zap, Loader2, X } from 'lucide-react';
import { useLoading } from '@/context/LoadingContext';
import { toast } from 'react-hot-toast';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function RelatedCard({ product }: { product: any }) {
  const img = product.images?.[0] || '/images/7.png';
  const price = product.isOnSale ? product.salePrice : product.price;
  return (
    <Link href={`/shop/${product._id}`} className="flex flex-col gap-3 group">
      <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden">
        <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.isOnSale && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Sale
          </span>
        )}
      </div>
      <div className="px-1">
        <h3 className="font-bold text-sm text-black line-clamp-1">{product.name}</h3>
        <p className="text-sm font-bold text-black mt-0.5">₨{price?.toLocaleString()}</p>
      </div>
    </Link>
  );
}

export default function ProductDetailPage() {
  // 1. ALL Hooks declared unconditionally at top level
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { setLoading } = useLoading();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: product, isLoading, error } = useGetProductByIdQuery(id as string);
  const { data: relatedData, isLoading: isRelatedLoading } = useGetProductsQuery({ limit: 4, sort: 'rating' });
  const relatedProducts = relatedData?.products?.filter((p: any) => p._id !== id).slice(0, 4) || [];

  const { data: reviews = [], isLoading: reviewsLoading } = useGetReviewsByProductQuery(id as string);

  const [addToGuestCart, { isLoading: isAddingToCart }] = useAddToGuestCartMutation();
  const [addToCartBackend] = useAddToCartBackendMutation();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [modalOpen, setModalOpen] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [activeActionButton, setActiveActionButton] = useState<'cart' | 'buy'>('buy');
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const productReviewsRef = useRef<HTMLDivElement>(null);

  const scrollProductReviews = (dir: 'left' | 'right') => {
    if (!productReviewsRef.current) return;
    productReviewsRef.current.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
  };

  useEffect(() => {
    setLoading(isLoading || isAddingToCart || buyingNow);
    return () => setLoading(false);
  }, [isLoading, isAddingToCart, buyingNow, setLoading]);

  // 2. Early return AFTER all hooks
  if (isLoading) return <ProductDetailSkeleton />;
  if (error || !product) {
    return (
      <div className="w-full max-w-[1240px] mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <Link href="/shop" className="mt-4 inline-block px-6 py-2.5 bg-black text-white rounded-full text-sm font-bold">
          Back to Shop
        </Link>
      </div>
    );
  }

  const effectivePrice = product.isOnSale ? product.salePrice : product.price;
  const discount = product.isOnSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const images = product.images?.length > 0 ? product.images : ['/images/30.png'];
  const colors: string[] = product.colors || [];
  const sizes: string[] = product.sizes || [];
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    setActiveActionButton('cart');
    const chosenSize = selectedSize || (sizes[0] ?? '');
    const chosenColor = selectedColor || (colors[0] ?? '');

    // 1. Update local Redux state immediately
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: effectivePrice,
      image: images[0],
      quantity,
      size: chosenSize,
      color: chosenColor,
    }));
    toast.success(`${product.name} added to cart!`, { duration: 1500 });

    // 2. Persist to DB in the background
    const sessionId = getSessionId();
    const itemPayload = {
      productId: product._id,
      name: product.name,
      price: effectivePrice,
      quantity,
      size: chosenSize,
      color: chosenColor,
      image: images[0],
    };

    try {
      if (isAuthenticated) {
        await addToCartBackend(itemPayload).unwrap();
      } else if (sessionId) {
        await addToGuestCart({ sessionId, ...itemPayload }).unwrap();
      }
    } catch {
      // Non-fatal — local cart still works even if DB sync fails
    }
  };

  const handleBuyNow = async () => {
    if (buyingNow || isOutOfStock) return;
    setActiveActionButton('buy');
    setBuyingNow(true);
    try {
      const chosenSize = selectedSize || (sizes[0] ?? '');
      const chosenColor = selectedColor || (colors[0] ?? '');
      const itemPayload = {
        productId: product._id,
        name: product.name,
        price: effectivePrice,
        quantity,
        size: chosenSize,
        color: chosenColor,
        image: images[0],
      };

      // 1. Update local Redux state
      dispatch(addToCart({
        id: product._id,
        name: product.name,
        price: effectivePrice,
        image: images[0],
        quantity,
        size: chosenSize,
        color: chosenColor,
      }));

      // 2. Execute Server-side DB Save & await confirmation
      const sessionId = getSessionId();
      if (isAuthenticated) {
        await addToCartBackend(itemPayload).unwrap();
      } else if (sessionId) {
        await addToGuestCart({ sessionId, ...itemPayload }).unwrap();
      }

      // 3. Only after server DB response confirmation, redirect directly to /checkout
      router.push('/checkout');
    } catch (err: any) {
      console.warn('Buy Now DB save warning:', err);
      router.push('/checkout');
    } finally {
      setBuyingNow(false);
    }
  };

  return (
    <div className="w-full font-['Satoshi']">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-black">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black font-medium">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`shrink-0 relative w-[90px] h-[100px] bg-gray-100 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-black' : 'border-transparent opacity-60 hover:opacity-90'}`}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 relative aspect-square sm:aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden">
              <Image src={images[selectedImage] || images[0]} alt={product.name} fill className="object-cover" priority />
              {product.isOnSale && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {/* Info panel */}
          <div className="flex flex-col gap-5">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-black leading-tight"
              style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <Stars rating={product.rating || 4.5} />
              <span className="text-sm text-gray-500">{product.rating || 4.5}/5</span>
            </div>

            {/* Price in PKR */}
            <div className="flex items-center gap-3 pb-5 border-b border-gray-200">
              <span className="text-3xl font-bold text-black">₨{effectivePrice?.toLocaleString()}</span>
              {product.isOnSale && (
                <>
                  <span className="text-xl font-bold text-gray-300 line-through">₨{product.price?.toLocaleString()}</span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">-{discount}%</span>
                </>
              )}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

            {/* Color selection */}
            {colors.length > 0 && (
              <div className="pb-4 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Color {selectedColor && <span className="text-black normal-case font-bold">— {selectedColor}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      className={`px-4 py-1.5 rounded-full text-sm border transition-all ${selectedColor === c ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {sizes.length > 0 && (
              <div className="pb-4 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Size {selectedSize && <span className="text-black normal-case font-bold">— {selectedSize}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${selectedSize === s ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart + Buy Now */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center justify-between gap-3 bg-gray-100 rounded-full px-4 py-3 sm:w-36">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-600 hover:text-black">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-gray-600 hover:text-black">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-1 gap-3">
                <button
                  disabled={isOutOfStock || isAddingToCart || buyingNow}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-4 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                    activeActionButton === 'cart'
                      ? 'bg-black text-white hover:bg-gray-800 shadow-md'
                      : 'bg-white text-black border-2 border-black hover:bg-gray-100'
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Adding…
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  disabled={isOutOfStock || isAddingToCart || buyingNow}
                  onClick={handleBuyNow}
                  className={`flex-1 py-3.5 px-4 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                    activeActionButton === 'buy'
                      ? 'bg-black text-white hover:bg-gray-800 shadow-md'
                      : 'bg-white text-black border-2 border-black hover:bg-gray-100'
                  }`}
                >
                  {buyingNow ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Buying…
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" /> Buy Now
                    </>
                  )}
                </button>
              </div>
            </div>

            {isOutOfStock && (
              <p className="text-sm text-red-500 font-semibold text-center">This product is currently out of stock.</p>
            )}

            {/* Product meta */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <span>Category: <strong className="text-black">{product.category}</strong></span>
              <span>Stock: <strong className="text-black">{product.stock} units</strong></span>
              <span>SKU: <strong className="text-black font-mono">{product.sku}</strong></span>
            </div>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="mt-16 border-t border-gray-200">
          <div className="flex border-b border-gray-200">
            {(['details', 'reviews'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-medium transition-all border-b-2 -mb-px capitalize ${activeTab === tab ? 'border-black text-black font-bold' : 'border-transparent text-gray-400 hover:text-black'}`}>
                {tab === 'details' ? 'Product Details' : 'Reviews'}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div className="py-8">
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              {colors.length > 0 && (
                <p className="mt-4 text-sm"><span className="font-bold">Available Colors:</span> {colors.join(', ')}</p>
              )}
              {sizes.length > 0 && (
                <p className="mt-2 text-sm"><span className="font-bold">Available Sizes:</span> {sizes.join(', ')}</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="py-8 flex flex-col gap-6">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-black" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
                    All Reviews ({reviews.length})
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {reviewsLoading
                      ? 'Loading reviews…'
                      : reviews.length === 0
                      ? 'No reviews yet. Be the first!'
                      : `Showing customer feedback for ${product.name}`}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    Write a Review
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => scrollProductReviews('left')}
                      aria-label="Previous Reviews"
                      className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollProductReviews('right')}
                      aria-label="Next Reviews"
                      className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Reviews list slider */}
              {reviewsLoading ? (
                <div className="flex gap-5 overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[300px] sm:min-w-[360px] bg-gray-100 rounded-[20px] p-6 animate-pulse flex flex-col gap-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-4/5" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-gray-200 p-12 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
                  <p>No reviews yet — share your thoughts!</p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-5 py-2.5 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-colors"
                  >
                    Write a Review
                  </button>
                </div>
              ) : (
                <div
                  ref={productReviewsRef}
                  className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {reviews.map((r: any) => (
                    <div
                      key={r._id}
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
                              alt={`Review photo by ${r.name}`}
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
                        <span>Verified Purchase</span>
                        <span>
                          {new Date(r.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lightbox for enlarged review photo */}
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

          {/* Review Modal */}
          <ReviewModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            productId={product._id}
            productName={product.name}
          />
        </div>

        {/* Related products */}
        {(isRelatedLoading || relatedProducts.length > 0) && (
          <section className="mt-16">
            <h2 className="text-2xl font-extrabold text-black text-center mb-8"
              style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
              YOU MIGHT ALSO LIKE
            </h2>
            {isRelatedLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="w-full aspect-square bg-gray-200 rounded-2xl" />
                    <div className="px-1 flex flex-col gap-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {relatedProducts.map((p: any) => <RelatedCard key={p._id} product={p} />)}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}