'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, CreditCard, Smartphone, Banknote, ShieldCheck, AlertCircle } from 'lucide-react';
import Image from 'next/image';

function AccordionItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="font-semibold text-sm text-black">{q}</span>
        <span className={`text-gray-400 text-lg font-bold shrink-0 transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && <div className="pb-4 text-sm text-gray-600 leading-relaxed">{a}</div>}
    </div>
  );
}

export default function PaymentsPage() {
  const methods = [
    { icon: <Banknote className="w-5 h-5" />, title: 'Cash on Delivery', desc: 'Pay in cash when your order arrives at your door. Available across all of Pakistan.', available: true },
    { icon: <CreditCard className="w-5 h-5" />, title: 'Debit / Credit Card', desc: 'Visa, Mastercard accepted. Transactions are secured with SSL encryption.', available: true },
    { icon: <Smartphone className="w-5 h-5" />, title: 'JazzCash / EasyPaisa', desc: 'Mobile wallet payments for quick and easy checkout.', available: true },
    { icon: <Banknote className="w-5 h-5" />, title: 'Bank Transfer', desc: 'Direct bank transfer. Order is processed after payment confirmation (1–2 hours).', available: true },
  ];

  return (
    <div className="w-full max-w-[860px] mx-auto px-4 py-12 font-['Satoshi'] flex flex-col gap-10">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">Payments</span>
      </nav>

      <div>
        <h1 className="text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF','Inter',sans-serif" }}>PAYMENTS</h1>
        <p className="text-gray-500 text-sm mt-2">Safe, simple, and flexible payment options for every customer.</p>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
        <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
        <p className="text-sm text-green-800 font-semibold">All transactions are secured with 256-bit SSL encryption. Your payment details are never stored on our servers.</p>
      </div>

      {/* Payment methods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {methods.map(({ icon, title, desc }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4 shadow-sm items-start">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shrink-0">{icon}</div>
            <div>
              <p className="font-bold text-sm text-black">{title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accepted cards */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
        <p className="font-bold text-sm text-black">Accepted Payment Logos</p>
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { src: '/images/25.png', alt: 'Visa' },
            { src: '/images/26.png', alt: 'Mastercard' },
            { src: '/images/27.png', alt: 'PayPal' },
            { src: '/images/28.png', alt: 'Apple Pay' },
            { src: '/images/29.png', alt: 'Google Pay' },
          ].map(({ src, alt }) => (
            <div key={alt} className="h-9 px-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
              <Image src={src} width={48} height={28} alt={alt} className="object-contain" />
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-1">
        <h2 className="font-bold text-base text-black mb-3">Frequently Asked Questions</h2>
        <AccordionItem q="Is it safe to pay online on SHOP.CO?"
          a="Absolutely. We use SSL 256-bit encryption for all transactions. We never store your card details — they are handled directly by our secure payment gateway." />
        <AccordionItem q="What currency are prices displayed in?"
          a="All prices are displayed in Pakistani Rupees (PKR). No foreign transaction fees apply." />
        <AccordionItem q="My payment was deducted but the order wasn't confirmed."
          a={<>Don't worry. This usually resolves within 1–2 hours. If your order is still not confirmed after 3 hours, contact us at <a href="mailto:sadiqshoaibbilal9140@gmail.com" className="font-semibold underline text-black">sadiqshoaibbilal9140@gmail.com</a> with proof of payment and we'll resolve it immediately.</>} />
        <AccordionItem q="Can I pay partially with loyalty points and partially with cash?"
          a="Yes! If you have enough loyalty points, you can use them to cover part of your order value at checkout. The remaining amount can be paid via any available method." />
        <AccordionItem q="Are there any extra charges or hidden fees?"
          a="No. The price you see is exactly what you pay, except for the applicable shipping charges shown at checkout. There are no hidden fees." />
        <AccordionItem q="Can I get an invoice for my order?"
          a="Yes. A digital invoice is automatically sent to your email after every successful order. You can also view order details on the My Orders page." />
        <AccordionItem q="How do refunds work?"
          a={<>Refunds are credited back to your original payment method within 5–7 business days. For COD orders, refunds are issued via bank transfer. See our <Link href="/faq/returns-and-refunds" className="font-semibold underline text-black">Returns & Refunds</Link> page for full details.</>} />
      </div>

      {/* Note */}
      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">For payment issues, contact us at <a href="mailto:sadiqshoaibbilal9140@gmail.com" className="font-semibold underline">sadiqshoaibbilal9140@gmail.com</a> or call <a href="tel:+923281298871" className="font-semibold underline">0328-1298871</a>.</p>
      </div>
    </div>
  );
}
