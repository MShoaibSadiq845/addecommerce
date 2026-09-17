'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, LayoutGrid, Tag, Package } from 'lucide-react';

// ──────────────────────────────────────────────
// Nav item definition
// ──────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  /** Returns true when this item should be considered "active" */
  isActive: (pathname: string, searchParams: URLSearchParams) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: Home,
    isActive: (pathname) => pathname === '/',
  },
  {
    id: 'all-products',
    label: 'All Products',
    href: '/shop',
    icon: LayoutGrid,
    isActive: (pathname, sp) => {
      if (pathname !== '/shop') return false;
      const category = sp.get('category');
      const isOnSale = sp.get('isOnSale');
      const newArrivals = sp.get('newArrivals');
      const search = sp.get('search');
      return (!category || category === 'all') && !isOnSale && !newArrivals && !search;
    },
  },
  {
    id: 'on-sale',
    label: 'On Sale',
    href: '/shop?isOnSale=true',
    icon: Tag,
    isActive: (pathname, sp) => pathname === '/shop' && sp.get('isOnSale') === 'true',
  },
  {
    id: 'my-orders',
    label: 'My Orders',
    href: '/orders',
    icon: Package,
    isActive: (pathname) => pathname === '/orders' || pathname.startsWith('/orders/'),
  },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    // Floating dock container with side margins and bottom spacing
    <div
      className="fixed bottom-3 inset-x-3 sm:inset-x-6 max-w-md mx-auto z-50 md:hidden pointer-events-none"
      style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
    >
      <nav
        aria-label="Mobile bottom navigation"
        className="
          pointer-events-auto
          w-full
          bg-white/95 backdrop-blur-xl
          border border-gray-200/90
          rounded-2xl sm:rounded-3xl
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          p-1.5
          font-['Satoshi']
        "
      >
        <ul className="flex items-center justify-around gap-1">
          {NAV_ITEMS.map(({ id, label, href, icon: Icon, isActive }) => {
            const active = isActive(pathname, searchParams);

            return (
              <li key={id} className="flex-1">
                <Link
                  id={`bottom-nav-${id}`}
                  href={href}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={`
                    group relative flex flex-col items-center justify-center gap-1
                    py-2 px-1 rounded-xl
                    transition-all duration-200 select-none
                    ${
                      active
                        ? 'bg-black text-white shadow-sm font-semibold'
                        : 'text-gray-500 hover:text-black hover:bg-gray-100/80 font-medium'
                    }
                  `}
                >
                  <Icon
                    className="transition-transform duration-200 group-active:scale-90"
                    style={{ width: 18, height: 18 }}
                    strokeWidth={active ? 2.3 : 1.8}
                  />

                  <span className="text-[10.5px] leading-none tracking-tight">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
