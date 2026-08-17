'use client';

import React, { useState, useEffect } from 'react';
import { useGetAllUsersQuery } from '@/store/services/authApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { Users, Award, Shield, ShieldCheck, User } from 'lucide-react';
import { useLoading } from '@/context/LoadingContext';
import Pagination from '@/components/ui/Pagination';

type UserRole = 'User' | 'Admin' | 'Super Admin';

const ROLE_STYLES: Record<UserRole, string> = {
  'User': 'bg-gray-100 text-gray-700',
  'Admin': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Super Admin': 'bg-purple-50 text-purple-700 border border-purple-200',
};

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  'User': <User className="w-3 h-3" />,
  'Admin': <Shield className="w-3 h-3" />,
  'Super Admin': <ShieldCheck className="w-3 h-3" />,
};

function RoleBadge({ role }: { role: string }) {
  const r = role as UserRole;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
        ROLE_STYLES[r] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {ROLE_ICONS[r] ?? null}
      {role}
    </span>
  );
}

export default function AdminUsersPage() {
  const { setLoading } = useLoading();
  const { data: users = [], isLoading, isFetching } = useGetAllUsersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(isLoading || isFetching);
    return () => setLoading(false);
  }, [isLoading, isFetching, setLoading]);

  // Reset pagination on search / filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const filtered = users.filter((u: any) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u: any) => u.role === 'Admin' || u.role === 'Super Admin').length;
  const totalPoints = users.reduce((sum: number, u: any) => sum + (u.loyaltyPoints || 0), 0);

  // Pagination (10 per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 font-['Rubik']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-xs text-gray-400 font-['Open_Sans']">
            All registered accounts — fetched live from the database
          </p>
        </div>
        <div className="text-xs bg-white border border-gray-200 px-4 py-2 rounded-xl text-gray-600 font-semibold w-fit">
          <Users className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
          {totalUsers} registered user{totalUsers !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Admins</p>
            <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Loyalty Points</p>
            <p className="text-2xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-black/20"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none min-w-[160px]"
        >
          <option value="">All Roles</option>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
          <option value="Super Admin">Super Admin</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 text-xs font-semibold">
          {search || roleFilter ? 'No users match the current filters.' : 'No users found.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-['Open_Sans']">
            <thead>
              <tr className="border-b text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">#</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Loyalty Points</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {paginatedUsers.map((user: any, idx: number) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                return (
                  <tr key={user._id} className="hover:bg-gray-50 transition-all">
                    <td className="py-4 text-gray-400 font-mono">{globalIndex}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar circle with initials */}
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0 uppercase">
                          {user.name?.[0] ?? '?'}
                        </div>
                        <span className="font-bold text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-500">{user.email}</td>
                    <td className="py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="py-4">
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Award className="w-3.5 h-3.5" />
                        {(user.loyaltyPoints ?? 0).toLocaleString()} pts
                      </span>
                    </td>
                    <td className="py-4 text-gray-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            className="mt-4"
          />
        </div>
      )}
    </div>
  );
}
