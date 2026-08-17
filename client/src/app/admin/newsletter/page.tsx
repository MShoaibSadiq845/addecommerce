'use client';

import React, { useState, useEffect } from 'react';
import { useGetNewsletterSubscribersQuery } from '@/store/services/newsletterApi';
import { Mail, Search, Users } from 'lucide-react';
import { useLoading } from '@/context/LoadingContext';
import Pagination from '@/components/ui/Pagination';

export default function NewsletterSubscribersPage() {
  const { setLoading } = useLoading();
  const { data: subscribers = [], isLoading, isFetching } = useGetNewsletterSubscribersQuery(undefined, {
    pollingInterval: 30000,
  });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(isLoading || isFetching);
    return () => setLoading(false);
  }, [isLoading, isFetching, setLoading]);

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = subscribers.filter((s: any) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination (10 per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedSubscribers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-8 font-['Rubik']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-xs text-gray-400 font-['Open_Sans']">Home &gt; Newsletter</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 w-fit">
          <Users className="w-4 h-4 text-black" />
          {isLoading ? '—' : subscribers.length} total subscribers
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 flex flex-col gap-4">
        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black bg-gray-50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-['Open_Sans']">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Subscribed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 font-semibold">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-3 w-6 bg-gray-100 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-56 bg-gray-100 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-32 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Mail className="w-8 h-8 text-gray-200" />
                      {search ? 'No subscribers match your search.' : 'No subscribers yet.'}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSubscribers.map((sub: any, index: number) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={sub._id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4 text-gray-400">{globalIndex}</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {sub.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        {sub.email}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(sub.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
