'use client';

import React from 'react';

interface SocialLoginButtonsProps {
  labelPrefix?: string;
  compact?: boolean;
}

export function SocialLoginButtons({ labelPrefix = 'Sign in with', compact = false }: SocialLoginButtonsProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleSocialLogin = (provider: 'google' | 'github' | 'discord') => {
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="relative flex items-center justify-center my-1">
        <div className="border-t border-gray-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider absolute">
          OR CONTINUE WITH
        </span>
      </div>

      <div className={`grid ${compact ? 'grid-cols-3 gap-2' : 'grid-cols-1 sm:grid-cols-3 gap-2.5'} mt-2`}>
        {/* Google Button */}
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all shadow-sm group text-xs font-bold text-gray-700"
          title="Sign in with Google"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className={compact ? 'hidden sm:inline' : ''}>
            {compact ? 'Google' : `${labelPrefix} Google`}
          </span>
        </button>

        {/* GitHub Button */}
        <button
          type="button"
          onClick={() => handleSocialLogin('github')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gray-900 hover:bg-black text-white rounded-xl transition-all shadow-sm text-xs font-bold"
          title="Sign in with GitHub"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className={compact ? 'hidden sm:inline' : ''}>
            {compact ? 'GitHub' : `${labelPrefix} GitHub`}
          </span>
        </button>

        {/* Discord Button */}
        <button
          type="button"
          onClick={() => handleSocialLogin('discord')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl transition-all shadow-sm text-xs font-bold"
          title="Sign in with Discord"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c2.68-27.18-4.52-50.95-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.92,53.87,53,48.77,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.2,45.92,96.07,53,91,65.69,84.69,65.69Z" />
          </svg>
          <span className={compact ? 'hidden sm:inline' : ''}>
            {compact ? 'Discord' : `${labelPrefix} Discord`}
          </span>
        </button>
      </div>
    </div>
  );
}
