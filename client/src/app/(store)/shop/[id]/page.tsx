'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useGetProductByIdQuery, useGetProductsQuery } from '@/store/services/productsApi';
import { useGetReviewsByProductQuery } from '@/store/services/reviewsApi';
import { addToCart } from '@/store/slices/cartSlice';
import { useAddToGuestCartMutation } from '@/store/services/guestCartApi';
import { getSessionId } from '@/lib/sessionId';
import { ProductDetailSkeleton } from '@/components/ui/skeletons/ProductDetailSkeleton';
import ReviewModal from '@/components/storefront/ReviewModal';
import { ChevronRight, Minus, Plus, ShoppingCart, PenLine, Star, RefreshCw } from 'lucide-react';
import { useLoading } from '@/context/LoadingContext';

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
  const { id } = useParams();
  const dispatch = useDispatch();
  const { setLoading } = useLoading();

  const { data: product, isLoading, error } = useGetProductByIdQuery(id as string);
  const { data: relatedData, isLoading: isRelatedLoading } = useGetProductsQuery({ limit: 4, sort: 'rating' });
  const relatedProducts = relatedData?.products?.filter((p: any) => p._id !== id).slice(0, 4) || [];

  const { data: reviews = [], isLoading: reviewsLoading } = useGetReviewsByProductQuery(id as string);

  const [addToGuestCart, { isLoading: isAddingToCart }] = useAddToGuestCartMutation();

  React.useEffect(() => {
    setLoading(isLoading || isAddingToCart);
    return () => setLoading(false);
  }, [isLoading, isAddingToCart, setLoading]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [modalOpen, setModalOpen] = useState(false);

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
    const chosenSize = selectedSize || (sizes[0] ?? '');
    const chosenColor = selectedColor || (colors[0] ?? '');

    // 1. Update local Redux state immediately (instant UI feedback)
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: effectivePrice,
      image: images[0],
      quantity,
      size: chosenSize,
      color: chosenColor,
    }));

    // 2. Persist to DB in the background
    const sessionId = getSessionId();
    if (sessionId) {
      try {
        await addToGuestCart({
          sessionId,
          productId: product._id,
          name: product.name,
          price: effectivePrice,
          quantity,
          size: chosenSize,
          color: chosenColor,
          image: images[0],
        }).unwrap();
      } catch {
        // Non-fatal — local cart still works even if DB sync fails
      }
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

            {/* Quantity + Add to Cart */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3 w-36">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-600 hover:text-black">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm w-5 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-gray-600 hover:text-black">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                disabled={isOutOfStock || isAddingToCart}
                onClick={handleAddToCart}
                className="flex-1 py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white transition-all disabled:opacity-50"
              >
                {isAddingToCart ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {reviewsLoading
                      ? 'Loading reviews…'
                      : reviews.length === 0
                      ? 'No reviews yet. Be the first!'
                      : `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Write a Review
                </button>
              </div>

              {/* Reviews list */}
              {reviewsLoading ? (
                <div className="flex flex-col gap-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm">
                  No reviews yet — share your thoughts!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((r: any) => (
                    <div key={r._id} className="rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-black">{r.name}</span>
                        <span className="text-green-500 text-sm">✓</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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