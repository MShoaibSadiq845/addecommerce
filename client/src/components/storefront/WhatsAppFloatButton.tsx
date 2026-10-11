'use client';

import React, { useState } from 'react';

interface WhatsAppFloatButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppFloatButton({
  phoneNumber = '923291747459',
  defaultMessage = 'Hello! I am interested in your products.',
}: WhatsAppFloatButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Encode message for WhatsApp URL
  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <div
      className="fixed z-[60] bottom-24 right-4 sm:right-6 md:bottom-8 md:right-8 flex items-center group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip / Label */}
      <aside
        aria-hidden={!isHovered}
        className={`
          hidden sm:flex items-center gap-2 mr-3 px-3.5 py-2
          bg-white/95 backdrop-blur-md text-gray-800 text-xs font-semibold
          rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-gray-100
          transition-all duration-300 pointer-events-none whitespace-nowrap
          ${
            isHovered
              ? 'opacity-100 translate-x-0 scale-100'
              : 'opacity-0 translate-x-3 scale-95'
          }
        `}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span>Chat with us on WhatsApp</span>
      </aside>

      {/* WhatsApp Button Anchor */}
      <a
        id="whatsapp-floating-button"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp (03291747459)"
        className="
          relative flex items-center justify-center
          p-1.5 sm:p-2
          bg-white/90 backdrop-blur-md
          rounded-full
          border border-gray-200/80
          shadow-[0_8px_30px_rgba(0,0,0,0.16)]
          transition-all duration-300
          hover:shadow-[0_10px_35px_rgba(37,211,102,0.35)]
          hover:scale-110 active:scale-95
        "
      >
        {/* Subtle breathing ripple around icon */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/25 animate-ping -z-10 opacity-75" />

        {/* Inner Green Circle */}
        <span
          className="
            flex items-center justify-center
            w-12 h-12 sm:w-14 sm:h-14
            rounded-full
            bg-[#25D366] hover:bg-[#20bd5a]
            text-white
            shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_3px_10px_rgba(37,211,102,0.4)]
            transition-colors duration-200
          "
        >
          {/* WhatsApp SVG Icon */}
          <svg
            viewBox="0 0 32 32"
            className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-[0.5px]"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M16.002 0C7.164 0 0 7.164 0 16.002c0 2.825.738 5.484 2.031 7.794L.073 31.927l8.351-1.939A15.91 15.91 0 0 0 16.002 32C24.84 32 32 24.836 32 16.002 32 7.164 24.84 0 16.002 0zm0 29.333c-2.482 0-4.81-.667-6.822-1.831l-.489-.284-5.067 1.176 1.196-4.935-.318-.506A13.27 13.27 0 0 1 2.667 16C2.667 8.648 8.648 2.667 16.002 2.667 23.352 2.667 29.333 8.648 29.333 16c0 7.352-5.981 13.333-13.331 13.333zm7.323-9.972c-.401-.201-2.373-1.171-2.74-1.305-.368-.134-.636-.201-.904.201-.268.402-1.037 1.305-1.271 1.573-.235.268-.469.301-.87.1-.402-.201-1.698-.626-3.234-1.996-1.195-1.066-2.002-2.382-2.236-2.784-.235-.402-.025-.619.176-.819.181-.18.402-.469.603-.703.201-.235.268-.402.402-.67.134-.268.067-.502-.034-.703-.1-.201-.904-2.179-1.238-2.983-.325-.783-.655-.677-.904-.69-.234-.012-.502-.014-.77-.014-.268 0-.703.1-1.072.502-.368.402-1.406 1.373-1.406 3.35 0 1.977 1.44 3.886 1.641 4.154.201.268 2.834 4.327 6.866 6.069.959.414 1.708.662 2.292.848.963.306 1.84.263 2.533.159.773-.116 2.373-.97 2.708-1.908.335-.938.335-1.742.235-1.909-.101-.167-.369-.268-.77-.469z" />
          </svg>
        </span>
      </a>
    </div>
  );
}
