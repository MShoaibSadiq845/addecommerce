'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Bell, PlusCircle, Users, ArrowLeft, Mail } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard',   href: '/admin',                icon: LayoutDashboard },
    { label: 'Products',    href: '/admin/products',       icon: ShoppingBag },
    { label: 'Add Product', href: '/admin/products/add',   icon: PlusCircle },
    { label: 'Orders',      href: '/admin/orders',         icon: ShoppingCart },
    { label: 'Users',       href: '/admin/users',          icon: Users },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Newsletter',  href: '/admin/newsletter',     icon: Mail },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between p-6 font-['Rubik']">
      <div className="flex flex-col gap-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xl font-['Integral_CF']">
            A
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-gray-900">Arik Admin</h1>
            <p className="text-xs text-gray-400 font-['Open_Sans']">Store Management</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
        const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname === item.href || pathname.startsWith(item.href + '/');
            // prevent /admin/products matching /admin/products/add
            const isExactOrChild = item.href === '/admin/products'
              ? pathname === '/admin/products' || (pathname.startsWith('/admin/products/') && !pathname.startsWith('/admin/products/add'))
              : isActive;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isExactOrChild
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-gray-100">
        <Link
          href="/shop"
          className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Storefront
        </Link>
      </div>
    </aside>
  );
}
