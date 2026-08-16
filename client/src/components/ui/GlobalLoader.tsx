'use client';

import React, { useEffect, useState } from 'react';

interface GlobalLoaderProps {
  message?: string;
}

const LOADING_MESSAGES = [
  'Connecting to database...',
  'Fetching storefront items...',
  'Syncing fresh catalog details...',
  'Securing connection to server...',
  'Preparing your experience...',
];

export default function GlobalLoader({ message }: GlobalLoaderProps) {
  const [displayedMessage, setDisplayedMessage] = useState(message || LOADING_MESSAGES[0]);

  // Cycle through helpful messages if load takes longer than expected
  useEffect(() => {
    if (message) {
      setDisplayedMessage(message);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setDisplayedMessage(LOADING_MESSAGES[index]);
    }, 2500);

    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-md transition-opacity duration-300">
      <div className="flex flex-col items-center max-w-xs text-center p-6 rounded-2xl bg-white/40 shadow-xl border border-white/20">
        
        {/* Modern Double-Ring SVG Spinner */}
        <div className="relative w-16 h-16 mb-6">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-black/10 border-t-black animate-spin duration-1000"></div>
          {/* Inner Ring (reversing spin) */}
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-amber-500 border-b-amber-500 animate-spin duration-700 [animation-direction:reverse]"></div>
        </div>

        {/* Brand Text with Shimmer/Glow */}
        <h1 className="text-2xl font-black tracking-widest text-black mb-2 select-none animate-pulse">
          SHOP.CO
        </h1>

        {/* Status Message */}
        <div className="flex items-center gap-1.5 justify-center">
          <p className="text-sm font-semibold text-gray-700 tracking-wide transition-all duration-300">
            {displayedMessage}
          </p>
        </div>

        {/* Micro subtext */}
        <span className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-mono">
          Live Database Sync
        </span>
      </div>
    </div>
  );
}
