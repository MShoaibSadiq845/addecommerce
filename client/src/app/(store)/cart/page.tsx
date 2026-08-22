'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { updateQuantity, removeFromCart, clearCart } from '@/store/slices/cartSlice';
import { useCreateOrderMutation, useValidateCheckoutMutation } from '@/store/services/ordersApi';
import { useClearGuestCartMutation, useRemoveFromGuestCartMutation } from '@/store/services/guestCartApi';
import { useRemoveCartItemMutation } from '@/store/services/cartApi';
import { getSessionId } from '@/lib/sessionId';
import { useForm } from 'react-hook-form';
import {
  Trash2, ArrowRight, CheckCircle, Minus, Plus,
  ChevronRight, Loader2, MapPin, User, Mail, Lock, LogIn, Phone,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { StoreAuthModal } from '@/components/storefront/StoreAuthModal';

type DeliveryForm = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  paymentMethod: 'COD' | 'Card';
};

import { useSearchParams } from 'next/navigation';

export default function CartPage({ defaultShowCheckout = false }: { defaultShowCheckout?: boolean }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [createOrder, { isLoading: isCheckingOut }] = useCreateOrderMutation();
  const [validateCheckout, { isLoading: isValidatingCheckout }] = useValidateCheckoutMutation();
  const [clearGuestCart, { isLoading: isClearingCart }] = useClearGuestCartMutation();
  const [removeFromGuestCart] = useRemoveFromGuestCartMutation();
  const [removeCartItem] = useRemoveCartItemMutation();

  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(defaultShowCheckout || searchParams.get('checkout') === 'true');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (defaultShowCheckout || searchParams.get('checkout') === 'true') {
      setShowCheckout(true);
    }
  }, [defaultShowCheckout, searchParams]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DeliveryForm>({
    defaultValues: {
      guestName: user?.name || '',
      guestEmail: user?.email || '',
      guestPhone: user?.phone || '',
      street: '',
      city: '',
      province: '',
      postalCode: '',
      country: '',
      paymentMethod: 'COD',
    },
  });

  // Automatically fill email, name, and phone if user is logged in (from auth state / localStorage)
  useEffect(() => {
    if (isAuthenticated && user) {
      setValue('guestName', user.name || '');
      setValue('guestEmail', user.email || '');
      if (user.phone) {
        setValue('guestPhone', user.phone);
      }
    }
  }, [isAuthenticated, user, setValue]);

  /* ─── Totals ─── */
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  /* ─── Delete Item (Server-Side) ─── */
  const handleDeleteItem = async (item: any, idx: number) => {
    try {
      setDeletingIndex(idx);
      const sessionId = getSessionId();

      let res: any;
      if (isAuthenticated) {
        // Authenticated user server cart deletion
        res = await removeCartItem({
          itemId: item.id,
          size: item.size,
          color: item.color,
        }).unwrap();
      } else if (sessionId) {
        // Guest user server cart deletion
        res = await removeFromGuestCart({
          sessionId,
          itemId: item.id,
          size: item.size,
          color: item.color,
        }).unwrap();
      }

      // Sync local Redux store
      dispatch(removeFromCart(idx));
      toast.success(res?.message || `${item.name || 'Item'} removed from cart`);
    } catch (err: any) {
      console.warn('Backend cart item removal error:', err);
      // Fallback: Remove item from local Redux store
      dispatch(removeFromCart(idx));
      toast.success(`${item.name || 'Item'} removed from cart`);
    } finally {
      setDeletingIndex(null);
    }
  };

  /* ─── Go to Checkout (Server-Side Validation) ─── */
  const handleProceedToCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const res = await validateCheckout({
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          name: item.name,
        })),
      }).unwrap();

      toast.success(res?.message || 'Cart verified! Proceeding to checkout.');
      setShowCheckout(true);
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to validate cart. Please try again.';
      toast.error(msg);
    }
  };

  /* ─── Checkout submit ─── */
  const onCheckoutSubmit = async (formData: DeliveryForm) => {
    try {
      const res = await createOrder({
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color || '',
          size: item.size || '',
          image: item.image,
        })),
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod || 'COD',
      }).unwrap();

      if (res.stripeUrl) {
        dispatch(clearCart());
        const sessionId = getSessionId();
        if (sessionId) {
          await clearGuestCart(sessionId).unwrap().catch(() => { });
        }
        toast.loading('Redirecting to Stripe Checkout...', { duration: 3000 });
        window.location.href = res.stripeUrl;
        return;
      }

      setOrderSuccess(res);
      dispatch(clearCart());
      // Also wipe the guest cart from the DB
      const sessionId = getSessionId();
      if (sessionId) {
        await clearGuestCart(sessionId).unwrap().catch(() => { });
      }
      toast.success('Order placed successfully!');
    } catch (err: any) {
      const msg = err?.data?.message || 'Checkout failed. Please try again.';
      toast.error(msg);
    }
  };

  /* ─── Order success screen ─── */
  if (orderSuccess) {
    return (
      <div className="w-full max-w-[600px] mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center font-['Satoshi']">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
          ORDER CONFIRMED!
        </h1>
        <p className="text-sm text-gray-600 max-w-sm">
          Thank you, <strong>{orderSuccess.guestName}</strong>! Your order{' '}
          <strong>#{orderSuccess._id?.slice(-6)}</strong> has been placed.
          A confirmation will be sent to <strong>{orderSuccess.guestEmail}</strong>.
        </p>
        <div className="w-full bg-gray-50 rounded-2xl p-5 text-sm text-left flex flex-col gap-2 border border-gray-200">
          <p className="font-bold text-gray-700">Shipping to:</p>
          <p className="text-gray-600">
            {orderSuccess.shippingAddress?.street}, {orderSuccess.shippingAddress?.city},{' '}
            {orderSuccess.shippingAddress?.province} {orderSuccess.shippingAddress?.postalCode},{' '}
            {orderSuccess.shippingAddress?.country}
          </p>
          <p className="font-bold text-gray-700 mt-2">Order Total: <span className="text-black">₨{orderSuccess.totalAmount?.toLocaleString()}</span></p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/shop" className="px-8 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800">
            Continue Shopping
          </Link>
          <Link
            href={`/orders?email=${encodeURIComponent(orderSuccess.guestEmail)}`}
            className="px-8 py-3 bg-white text-black border-2 border-black rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Check Order Status
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-['Satoshi']">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-8 flex flex-col gap-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {showCheckout ? (
            <>
              <button onClick={() => setShowCheckout(false)} className="hover:text-black">Cart</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-black font-medium">Checkout</span>
            </>
          ) : (
            <span className="text-black font-medium">Cart</span>
          )}
        </nav>

        <h1 className="text-3xl lg:text-4xl font-extrabold text-black" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
          {showCheckout ? 'CHECKOUT' : 'YOUR CART'}
        </h1>

        {items.length === 0 ? (
          <div className="w-full py-24 flex flex-col items-center gap-5 bg-gray-50 rounded-[30px] text-center border border-gray-200">
            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.4 6M7 13l2.4 6m0 0h8m-8 0a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            <p className="text-xl font-bold text-gray-700">Your cart is empty</p>
            <p className="text-sm text-gray-400">Browse our store and add items you love.</p>
            <Link href="/shop" className="mt-2 px-10 py-3.5 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800">
              Explore Shop
            </Link>
          </div>
        ) : !showCheckout ? (
          /* ─── Cart view ─── */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            {/* Items */}
            <div className="border border-gray-200 rounded-2xl p-6 flex flex-col divide-y divide-gray-100">
              {items.map((item, idx) => (
                <div key={item.id + idx} className="flex items-start gap-4 py-6 first:pt-0 last:pb-0">
                  <div className="relative w-[90px] h-[90px] bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    <Image src={item.image || '/images/7.png'} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-black line-clamp-1">{item.name}</h3>
                      <button
                        onClick={() => handleDeleteItem(item, idx)}
                        disabled={deletingIndex !== null || isValidatingCheckout}
                        className="text-red-400 hover:text-red-600 transition-colors shrink-0 p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Remove"
                      >
                        {deletingIndex === idx ? (
                          <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {item.size && <p className="text-xs text-gray-500">Size: <span className="font-semibold text-black">{item.size}</span></p>}
                    {item.color && <p className="text-xs text-gray-500">Color: <span className="font-semibold text-black">{item.color}</span></p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-base text-black">₨{(item.price * item.quantity).toLocaleString()}</span>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                        <button onClick={() => dispatch(updateQuantity({ index: idx, quantity: item.quantity - 1 }))}
                          disabled={item.quantity <= 1 || deletingIndex !== null} className="text-gray-600 hover:text-black disabled:opacity-40">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => dispatch(updateQuantity({ index: idx, quantity: item.quantity + 1 }))}
                          disabled={deletingIndex !== null}
                          className="text-gray-600 hover:text-black disabled:opacity-40">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 sticky top-24">
              <h3 className="font-bold text-lg text-black">Order Summary</h3>
              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-bold text-black">₨{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="font-bold text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-base text-black">Total</span>
                  <span className="font-bold text-xl text-black">₨{subtotal.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={handleProceedToCheckout}
                disabled={isValidatingCheckout || deletingIndex !== null}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-full text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isValidatingCheckout ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validating Cart…</span>
                  </>
                ) : (
                  <>
                    <span>Go to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ─── Delivery form ─── */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <form onSubmit={handleSubmit(onCheckoutSubmit)} className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <button type="button" onClick={() => setShowCheckout(false)} className="text-xs text-gray-500 hover:text-black underline">
                  ← Back to cart
                </button>
                <h2 className="font-bold text-lg text-black flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-black" /> Delivery Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Muhammad Ali"
                    {...register('guestName', { required: 'Full name is required' })}
                    className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${errors.guestName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.guestName && <span className="text-[10px] text-red-500">{errors.guestName.message}</span>}
                </div>

                {/* Guest Login/Register link banner right above the email input field */}
                {!isAuthenticated && (
                  <div className="sm:col-span-2 bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600 transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                        <LogIn className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-black text-xs">Already have an account?</p>
                        <p className="text-[11px] text-gray-500">Sign in to auto-fill details and earn points</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalTab('login');
                          setAuthModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors shadow-sm"
                      >
                        Log in
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalTab('register');
                          setAuthModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-white text-black border border-gray-300 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                )}

                {/* Logged in status badge */}
                {isAuthenticated && user && (
                  <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Logged in as <strong className="font-semibold text-black">{user.name}</strong> ({user.email})
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-lg font-bold">
                      Auto-filled
                    </span>
                  </div>
                )}

                {/* Email Address */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </label>
                    {isAuthenticated && (
                      <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Read-only (Logged In)
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    readOnly={isAuthenticated}
                    {...register('guestEmail', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                    })}
                    className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${isAuthenticated
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200 select-none'
                      : errors.guestEmail
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200'
                      }`}
                  />
                  {errors.guestEmail && <span className="text-[10px] text-red-500">{errors.guestEmail.message}</span>}
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+92 300 1234567"
                    {...register('guestPhone', {
                      required: 'Phone number is required for delivery updates',
                    })}
                    className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${errors.guestPhone ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                  />
                  {errors.guestPhone && <span className="text-[10px] text-red-500">{errors.guestPhone.message}</span>}
                </div>

                {/* Street */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Street Address</label>
                  <input type="text" placeholder="House 12, Street 5, Gulshan-e-Iqbal"
                    {...register('street', { required: 'Street address is required' })}
                    className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${errors.street ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
                  {errors.street && <span className="text-[10px] text-red-500">{errors.street.message}</span>}
                </div>

                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">City</label>
                  <input type="text" placeholder="Karachi"
                    {...register('city', { required: 'City is required' })}
                    className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
                  {errors.city && <span className="text-[10px] text-red-500">{errors.city.message}</span>}
                </div>

                {/* Province / State with Validation */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Province / State</label>
                  <input type="text" placeholder="Sindh"
                    {...register('province', { required: 'Province / State is required' })}
                    className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${errors.province ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
                  {errors.province && <span className="text-[10px] text-red-500">{errors.province.message}</span>}
                </div>

                {/* Postal Code */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Postal Code</label>
                  <input type="text" placeholder="75300"
                    {...register('postalCode', { required: 'Postal code is required' })}
                    className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${errors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
                  {errors.postalCode && <span className="text-[10px] text-red-500">{errors.postalCode.message}</span>}
                </div>

                {/* Country */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Country</label>
                  <input type="text" placeholder="Pakistan"
                    {...register('country', { required: 'Country is required' })}
                    className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${errors.country ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
                  {errors.country && <span className="text-[10px] text-red-500">{errors.country.message}</span>}
                </div>

                {/* Payment Method — Cash on Delivery */}
                <div className="sm:col-span-2 flex flex-col gap-3">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* COD option */}
                    <label
                      htmlFor="payment-cod"
                      className="flex items-center gap-3 border-2 border-black rounded-xl p-4 cursor-pointer bg-black/[0.02] hover:bg-black/5 transition-colors"
                    >
                      <input
                        id="payment-cod"
                        type="radio"
                        value="COD"
                        {...register('paymentMethod')}
                        defaultChecked
                        className="accent-black w-4 h-4"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-extrabold text-black">💵 Cash on Delivery</span>
                        <span className="text-[11px] text-gray-500">Pay when your order arrives</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isCheckingOut || isClearingCart}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-full text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {isCheckingOut || isClearingCart
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order…</>
                  : <><CheckCircle className="w-4 h-4" /> Place Order</>}
              </button>
            </form>

            {/* Mini order summary */}
            <div className="border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 sticky top-24">
              <h3 className="font-bold text-base text-black">Order Summary</h3>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <Image src={item.image || '/images/7.png'} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                      {item.size && <p className="text-gray-400">Size: {item.size}</p>}
                    </div>
                    <span className="font-bold text-black shrink-0">×{item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-sm">
                <span>Total</span>
                <span className="text-base">₨{subtotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal for Guest Users */}
      <StoreAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
}