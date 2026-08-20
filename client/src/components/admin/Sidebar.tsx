'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, ShoppingCart, PackageCheck, XCircle, Bell, PlusCircle, Users, ArrowLeft, Mail, X } from 'lucide-react';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard',        href: '/admin',                  icon: LayoutDashboard },
    { label: 'Products',         href: '/admin/products',         icon: ShoppingBag },
    { label: 'Add Product',      href: '/admin/products/add',     icon: PlusCircle },
    { label: 'All Orders',       href: '/admin/orders',           icon: ShoppingCart },
    { label: 'Delivered Orders', href: '/admin/orders/delivered', icon: PackageCheck },
    { label: 'Canceled Orders',  href: '/admin/orders/canceled',  icon: XCircle },
    { label: 'Users',            href: '/admin/users',            icon: Users },
    { label: 'Notifications',    href: '/admin/notifications',   icon: Bell },
    { label: 'Newsletter',       href: '/admin/newsletter',       icon: Mail },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between p-6 font-['Rubik']
          fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col gap-8">
          {/* Brand & Mobile Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xl font-['Integral_CF']">
                A
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight text-gray-900">Arik Admin</h1>
                <p className="text-xs text-gray-400 font-['Open_Sans']">Store Management</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-black lg:hidden rounded-lg hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isExactOrChild =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : item.href === '/admin/products'
                  ? pathname === '/admin/products' || (pathname.startsWith('/admin/products/') && !pathname.startsWith('/admin/products/add'))
                  : item.href === '/admin/orders'
                  ? pathname === '/admin/orders'
                  : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isExactOrChild
                      ? 'bg-black text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <Link
            href="/shop"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            Back to Storefront
          </Link>
        </div>
      </aside>
    </>
  );
}
