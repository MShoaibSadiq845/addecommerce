'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { useGetFilterOptionsQuery } from '@/store/services/productsApi';
import { ShoppingCart, Search, ChevronDown, Menu, X, User, LogOut, Edit3, ShoppingBag, ShieldCheck, Award } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { StoreAuthModal } from '@/components/storefront/StoreAuthModal';
import { ProfileEditModal } from '@/components/storefront/ProfileEditModal';

export function StorefrontHeader() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Pre-fill from URL on mount
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const isUrlSync = useRef(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { data: filterOptions, isLoading: loadingCategories } = useGetFilterOptionsQuery(undefined);
  const categories: string[] = filterOptions?.categories || [];

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep input in sync when the URL search param changes externally
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    isUrlSync.current = true;
    setSearchQuery(urlSearch);
  }, [searchParams]);

  // Debounce: navigate 1 second after the user stops typing
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isUrlSync.current) {
      isUrlSync.current = false;
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const trimmed = searchQuery.trim();
      if (trimmed) {
        router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
      } else if (window.location.pathname === '/shop') {
        router.push('/shop');
      }
    }, 1000);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    } else if (window.location.pathname === '/shop') {
      router.push('/shop');
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    Cookies.remove('admin_token', { path: '/' });
    Cookies.remove('admin_role', { path: '/' });
    setShowUserMenu(false);
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-3.5 flex items-center justify-between gap-4">

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand */}
        <Link
          href="/"
          className="text-xl sm:text-2xl font-extrabold text-black shrink-0 tracking-tight"
          style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
        >
          SHOP.CO
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
          <div className="relative">
            <button
              onMouseEnter={() => setShowShopMenu(true)}
              onMouseLeave={() => setShowShopMenu(false)}
              className="flex items-center gap-1 hover:text-black transition-colors py-1"
            >
              Shop <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showShopMenu && (
              <div
                onMouseEnter={() => setShowShopMenu(true)}
                onMouseLeave={() => setShowShopMenu(false)}
                className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
              >
                {loadingCategories ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="mx-3 my-1.5 h-5 bg-gray-100 rounded animate-pulse" />
                  ))
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/shop?category=${encodeURIComponent(cat)}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors capitalize"
                      onClick={() => setShowShopMenu(false)}
                    >
                      {cat}
                    </Link>
                  ))
                ) : (
                  <span className="block px-4 py-2 text-xs text-gray-400">No categories yet</span>
                )}
              </div>
            )}
          </div>
          <Link href="/shop?isOnSale=true" className="hover:text-black transition-colors">
            On Sale
          </Link>
          <Link href="/shop?newArrivals=true&sort=newest" className="hover:text-black transition-colors">
            New Arrivals
          </Link>
          <Link href="/shop" className="hover:text-black transition-colors">
            All Products
          </Link>
          <Link href="/orders" className="hover:text-black transition-colors">
            My Orders
          </Link>
        </nav>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-[460px] hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-black/20 placeholder:text-gray-400"
            />
          </div>
        </form>

        {/* Icons row */}
        <div className="flex items-center gap-1">
          {/* Cart icon */}
          <Link
            href="/cart"
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
            {totalCartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalCartCount > 9 ? '9+' : totalCartCount}
              </span>
            )}
          </Link>

          {/* User / Account Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setShowUserMenu(!showUserMenu);
                } else {
                  setAuthModalOpen(true);
                }
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
              aria-label="User Account"
            >
              {isAuthenticated && user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <div className={`p-1 sm:p-1.5 rounded-full ${isAuthenticated ? 'bg-black text-white' : 'text-gray-800'}`}>
                  <User className="w-5 h-5 sm:w-5 sm:h-5" />
                </div>
              )}
            </button>

            {/* Dropdown Menu when Logged In */}
            {isAuthenticated && showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 font-['Satoshi'] animate-in fade-in duration-150">
                {/* User details header */}
                <div className="px-4 pb-3 mb-2 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden shrink-0">
                    {user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-black truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    {user?.loyaltyPoints !== undefined && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                        <Award className="w-3 h-3" /> {user.loyaltyPoints} Points
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col text-xs text-gray-700 font-medium">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 hover:text-black transition-colors text-left"
                  >
                    <Edit3 className="w-4 h-4 text-gray-500" />
                    <span>Edit Profile</span>
                  </button>

                  <Link
                    href="/orders"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 hover:text-black transition-colors text-left"
                  >
                    <ShoppingBag className="w-4 h-4 text-gray-500" />
                    <span>My Orders</span>
                  </Link>

                  {(user?.role === 'Admin' || user?.role === 'Super Admin') && (
                    <Link
                      href="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 hover:text-black transition-colors text-left"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-purple-700">Admin Dashboard</span>
                    </Link>
                  )}

                  <div className="my-1 border-t border-gray-100" />

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 text-red-600 hover:bg-red-50 font-bold transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-full py-2.5 pl-9 pr-4 text-sm outline-none"
            />
          </form>
          <nav className="flex flex-col gap-1">
            {[
              { href: '/shop', label: 'All Products' },
              ...categories.map((c) => ({
                href: `/shop?category=${encodeURIComponent(c)}`,
                label: c,
              })),
              { href: '/shop?isOnSale=true', label: 'On Sale' },
              { href: '/shop?newArrivals=true&sort=newest', label: 'New Arrivals' },
              { href: '/orders', label: 'My Orders' },
              { href: '/faq/my-account', label: 'My Account & Profile' },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-xl transition-colors capitalize"
              >
                {label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="px-3 py-2.5 text-sm font-bold text-black hover:bg-gray-100 rounded-xl transition-colors text-left flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Log In / Register
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Auth Modal & Profile Edit Modal */}
      <StoreAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ProfileEditModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </header>
  );
}
