import React from 'react';

interface PakistanFlagProps {
  className?: string;
  animated?: boolean;
}

export function PakistanFlag({
  className = 'w-4 h-3 rounded-[2px] overflow-hidden inline-block shrink-0 shadow-xs',
  animated = true,
}: PakistanFlagProps) {
  return (
    <span className="inline-flex items-center justify-center relative">
      <style>{`
        @keyframes pkFlagWave {
          0%, 100% {
            transform: rotate(0deg) skewY(0deg) scaleX(1);
          }
          25% {
            transform: rotate(-4deg) skewY(3deg) scaleX(0.97);
          }
          50% {
            transform: rotate(3deg) skewY(-2.5deg) scaleX(1.02);
          }
          75% {
            transform: rotate(-2deg) skewY(2deg) scaleX(0.99);
          }
        }
        .animate-pk-flag-wave {
          transform-origin: left center;
          animation: pkFlagWave 2.2s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
      <svg
        viewBox="0 0 900 600"
        className={`${className} ${animated ? 'animate-pk-flag-wave' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Flag of Pakistan"
      >
        {/* Dark Green Background */}
        <rect width="900" height="600" fill="#01411C" />
        {/* White Vertical Stripe on Left (1/4 width) */}
        <rect width="225" height="600" fill="#FFFFFF" />
        {/* Crescent Outer White Circle */}
        <circle cx="562.5" cy="300" r="180" fill="#FFFFFF" />
        {/* Crescent Inner Green Circle */}
        <circle cx="598" cy="264.5" r="162" fill="#01411C" />
        {/* 5-Pointed White Star */}
        <g transform="translate(605, 240) rotate(45)">
          <polygon
            points="0,-42 12,-13 42,-13 18,5 27,34 0,16 -27,34 -18,5 -42,-13 -12,-13"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    </span>
  );
}

export default PakistanFlag;
