'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useSubscribeNewsletterMutation } from '@/store/services/newsletterApi';

const footerLinks = {
  company: [

    { label: 'New Arrivals', href: '/shop?newArrivals=true&sort=newest' },
    { label: 'On Sale', href: '/shop?isOnSale=true' },
    { label: 'All Products', href: '/shop' },
    { label: 'My Orders', href: '/orders' },
  ],
  help: [
    { label: 'Customer Support', href: '/help/customer-support' },
    { label: 'Delivery Details', href: '/help/delivery-details' },
    { label: 'Terms & Conditions', href: '/help/terms-and-conditions' },
    { label: 'Privacy Policy', href: '/help/privacy-policy' },
  ],
  faq: [
    { label: 'My Account', href: '/faq/my-account' },
    { label: 'Track My Order', href: '/faq/track-my-order' },
    { label: 'Payments', href: '/faq/payments' },
    { label: 'Returns & Refunds', href: '/faq/returns-and-refunds' },
  ],
  contact: [
    { label: '📞 0329-1747459', href: 'tel:+923291747459' },
    { label: '💬 EmailUs:     fabdecor09@gmail.com', href: 'mailto:fabdecor09@gmail.com' },
    { label: '📍 Punjab Pakistan', href: '#' },
  ],
};

const socialLinks = [

  {
    img: '/images/22.png',
    alt: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61593629676246',
  },
  {
    img: '/images/98.jpg',
    alt: 'WhatsApp',
    href: 'https://wa.me/923291747459',
  },
  {
    img: '/images/23.png',
    alt: 'GitHub',
    href: 'https://www.instagram.com/fabdecor09/',
  },
];

export function StorefrontFooter() {
  const [email, setEmail] = useState('');
  const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();

  const handleSubscribe = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    try {
      await subscribe(trimmed).unwrap();
      toast.success("You're subscribed! Thanks for joining.");
      setEmail('');
    } catch (err: any) {
      const msg = err?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
    }
  };
  return (
    <footer className="w-full bg-[#f0f0f0] pt-14 pb-8 font-['Satoshi'] text-black">
      {/* ─── Newsletter Banner ─── */}
      <div className="w-full bg-black mb-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight max-w-sm"
            style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
          >
            STAY UPTO DATE ABOUT OUR LATEST OFFERS
          </h2>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                placeholder="Enter your email address"
                className="w-full bg-white rounded-full py-3 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-white text-black rounded-full py-3 text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Subscribing…' : 'Subscribe to Newsletter'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Footer columns ─── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 border-b border-gray-300 pb-10">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/94.webp"
                alt="Logo"
                className="h-9 sm:h-10 w-auto object-contain mix-blend-multiply"
              />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-[210px]">
              Premium fabrics for every home — bringing comfort, quality, and timeless elegance to your space.  Trusted by thousands of happy customers across Pakistan.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-1">
              {socialLinks.map(({ img, alt, href }) => (
                <a
                  key={alt}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={alt}
                  className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-black hover:shadow-sm transition-all overflow-hidden"
                >
                  <Image src={img} width={18} height={18} alt={alt} className="object-contain" />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm tracking-widest uppercase">COMPANY</h4>
            {footerLinks.company.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Help */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm tracking-widest uppercase">HELP</h4>
            {footerLinks.help.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* FAQ */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm tracking-widest uppercase">FAQ</h4>
            {footerLinks.faq.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm tracking-widest uppercase">CONTACT US</h4>
            {footerLinks.contact.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ─── Bottom bar ─── */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            FabDecorCo © 2025, All Rights Reserved &mdash; Developed by{' '}
            <a
              href="https://github.com/MShoaibSadiq845"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-black transition-colors underline"
            >
              M. Shoaib Sadiq
            </a>
          </p>
          <div className="flex items-center gap-2">
            {[
              { src: '/images/25.png', alt: 'Visa' },
              { src: '/images/26.png', alt: 'Mastercard' },
              { src: '/images/27.png', alt: 'PayPal' },
              { src: '/images/28.png', alt: 'Apple Pay' },
              { src: '/images/29.png', alt: 'Google Pay' },
            ].map(({ src, alt }) => (
              <div key={alt} className="h-7 px-2  flex items-center justify-center">
                <Image src={src} width={38} height={24} alt={alt} className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
