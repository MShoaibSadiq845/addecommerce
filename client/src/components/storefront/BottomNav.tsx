'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, LayoutGrid, Tag, Sparkles } from 'lucide-react';

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
    isActive: (pathname, sp) =>
      pathname === '/shop' && !sp.get('isOnSale') && !sp.get('newArrivals'),
  },
  {
    id: 'on-sale',
    label: 'On Sale',
    href: '/shop?isOnSale=true',
    icon: Tag,
    isActive: (_pathname, sp) => sp.get('isOnSale') === 'true',
  },
  {
    id: 'new-arrivals',
    label: 'New Arrivals',
    href: '/shop?newArrivals=true&sort=newest',
    icon: Sparkles,
    isActive: (_pathname, sp) => sp.get('newArrivals') === 'true',
  },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    // fixed bottom-0 + md:hidden → locked to viewport bottom, mobile/tablet only
    <nav
      aria-label="Mobile bottom navigation"
      // paddingBottom via inline style — env() is not valid as a Tailwind arbitrary value
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      className="
        fixed bottom-0 left-0 right-0 z-50
        md:hidden
        bg-white/95 backdrop-blur-md
        border-t border-gray-200
        shadow-[0_-4px_24px_rgba(0,0,0,0.08)]
        font-['Satoshi']
      "
    >
      <ul className="flex items-stretch justify-around h-[62px]">
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
                  group relative flex flex-col items-center justify-center gap-[3px]
                  w-full h-full px-1
                  transition-colors duration-200 select-none
                  ${active ? 'text-black' : 'text-gray-400 hover:text-gray-700'}
                `}
              >
                {/* ── Active pill indicator at top edge ── */}
                {active && (
                  <span
                    aria-hidden="true"
                    className="
                      absolute top-0 left-1/2 -translate-x-1/2
                      w-8 h-[3px] rounded-b-full bg-black
                    "
                  />
                )}

                {/* ── Icon wrapper ── */}
                <span
                  className={`
                    flex items-center justify-center rounded-xl
                    transition-all duration-200
                    ${
                      active
                        ? 'bg-black/[0.06] w-10 h-7 scale-105'
                        : 'w-10 h-7 group-hover:bg-gray-100 group-active:scale-90'
                    }
                  `}
                >
                  <Icon
                    className="transition-all duration-200"
                    style={{ width: active ? 18 : 17, height: active ? 18 : 17 }}
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                </span>

                {/* ── Label ── */}
                <span
                  className={`
                    text-[10px] leading-none tracking-wide
                    transition-all duration-200
                    ${active ? 'font-semibold text-black' : 'font-medium'}
                  `}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
