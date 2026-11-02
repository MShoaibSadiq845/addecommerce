'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ViewMoreButtonProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  currentCount?: number;
  totalCount?: number;
  itemName?: string;
  buttonText?: string;
  showEndMessage?: boolean;
  className?: string;
}

export default function ViewMoreButton({
  onLoadMore,
  hasMore,
  isLoading = false,
  currentCount,
  totalCount,
  itemName = 'items',
  buttonText = 'View More',
  showEndMessage = true,
  className = '',
}: ViewMoreButtonProps) {
  // If no items at all, don't show the component
  if (currentCount !== undefined && currentCount === 0) {
    return null;
  }

  return (
    <div
      className={`w-full flex flex-col items-center justify-center pt-8 pb-4 border-t border-gray-200 mt-6 ${className}`}
    >
      {hasMore ? (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="group relative inline-flex items-center justify-center gap-2 px-10 py-3.5 text-sm font-bold text-white bg-black rounded-full hover:bg-neutral-800 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed disabled:active:scale-100 min-w-[180px]"
            aria-label={`${buttonText} ${itemName}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                <span>Loading more...</span>
              </>
            ) : (
              <span>{buttonText}</span>
            )}
          </button>
        </div>
      ) : showEndMessage ? (
        <div className="flex flex-col items-center gap-1.5 py-2 text-center animate-fade-in">
          <div className="w-10 h-0.5 bg-gray-200 rounded-full mb-2" />
          <p className="text-sm font-semibold text-gray-800">
            No more {itemName}
          </p>
          {totalCount !== undefined && (
            <p className="text-xs text-gray-400">
              You&apos;ve viewed all {totalCount} {itemName}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
