'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { RootState } from '@/store/store';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { AdminTopbar } from '@/components/admin/Topbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // The login page lives inside /admin but must NOT be wrapped
  // in the sidebar/topbar shell — render it bare.
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Automatically close mobile sidebar on navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mounted || isLoginPage) return;
    if (!isAuthenticated) {
      router.push('/admin/login');
    } else if (user && user.role !== 'Admin' && user.role !== 'Super Admin') {
      router.push('/');
    }
  }, [mounted, isAuthenticated, user, router, isLoginPage]);

  // Login page — render children directly with no shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Other /admin/* pages — render nothing until client has hydrated
  if (
    !mounted ||
    !isAuthenticated ||
    (user?.role !== 'Admin' && user?.role !== 'Super Admin')
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-['Rubik'] text-black relative">
      <AdminSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <AdminTopbar
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
