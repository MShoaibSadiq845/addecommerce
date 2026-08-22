'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, User, KeyRound, Award, ShoppingBag, Mail } from 'lucide-react';

function AccordionItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="font-semibold text-sm text-black">{q}</span>
        <span className={`text-gray-400 text-lg font-bold shrink-0 transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && <div className="pb-4 text-sm text-gray-600 leading-relaxed">{a}</div>}
    </div>
  );
}

export default function MyAccountPage() {
  return (
    <div className="w-full max-w-[860px] mx-auto px-4 py-12 font-['Satoshi'] flex flex-col gap-10">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">My Account</span>
      </nav>

      <div>
        <h1 className="text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF','Inter',sans-serif" }}>MY ACCOUNT</h1>
        <p className="text-gray-500 text-sm mt-2">Everything about managing your SHOP.CO account.</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <ShoppingBag className="w-5 h-5" />, label: 'My Orders', href: '/orders' },


          { icon: <Mail className="w-5 h-5" />, label: 'Contact Support', href: '/help/customer-support' },
        ].map(({ icon, label, href }) => (
          <Link key={label} href={href}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:border-black hover:shadow-md transition-all text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-black">{icon}</div>
            <span className="text-xs font-bold text-gray-800">{label}</span>
          </Link>
        ))}
      </div>

      {/* FAQ accordion */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-1">
        <h2 className="font-bold text-base text-black mb-3">Frequently Asked Questions</h2>
        <AccordionItem q="Do I need an account to place an order?"
          a="No. You can place an order as a guest by providing your email address at checkout. However, creating an account lets you track orders, earn loyalty points, and view order history." />
        <AccordionItem q="How do I create an account?"
          a="Click the account icon in the top navigation, then select 'Register'. Fill in your name, email, and password. You'll receive a confirmation email immediately." />

        <AccordionItem q="How do I update my email or phone number?"
          a="Log in to your account, go to Account Settings, and update your contact details. You may be asked to verify the new email address." />

        <AccordionItem q="Can I have multiple accounts?"
          a="Each email address can only be linked to one account. Creating multiple accounts to abuse promotions or loyalty points may result in all accounts being suspended." />
        <AccordionItem q="How do I delete my account?"
          a={<>To delete your account, email us at <a href="mailto:sadiqshoaibbilal9140@gmail.com" className="font-semibold underline text-black">fabdecore09@gmail.com || 0329-1747459</a>. Your data will be permanently removed within 14 business days.</>} />
      </div>
    </div>
  );
}
