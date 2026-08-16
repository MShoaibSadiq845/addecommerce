import React from 'react';
import { DashboardWidgetSkeleton, TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6 p-8 animate-pulse">
      {/* Page title bar */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <div className="h-7 bg-gray-200 rounded-lg w-52" />
          <div className="h-3 bg-gray-100 rounded w-36" />
        </div>
        <div className="h-9 bg-gray-200 rounded-xl w-36" />
      </div>
      <DashboardWidgetSkeleton />
      <TableSkeleton rows={8} />
    </div>
  );
}
