'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, RotateCcw, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

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

export default function ReturnsAndRefundsPage() {
  const eligible = [
    'Item received is defective or damaged',
    'Wrong item or size delivered',
    'Item is significantly different from description',
    'Item not received within 14 days of order',
  ];
  const notEligible = [
    'Items that have been worn, washed, or altered',
    'Items without original tags and packaging',
    'Sale / discounted items (final sale)',
    'Requests made after 7 days of delivery',
    'Items bought during special promotions unless defective',
  ];

  return (
    <div className="w-full max-w-[860px] mx-auto px-4 py-12 font-['Satoshi'] flex flex-col gap-10">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">Returns & Refunds</span>
      </nav>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center">
          <RotateCcw className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF','Inter',sans-serif" }}>RETURNS & REFUNDS</h1>
          <p className="text-gray-500 text-sm mt-1">7-day return policy on eligible items. Your satisfaction is our priority.</p>
        </div>
      </div>

      {/* Policy summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Clock className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', title: '7 Days', desc: 'Return window from delivery date' },
          { icon: <RotateCcw className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50', title: 'Free Returns', desc: 'For defective or wrong items' },
          { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, bg: 'bg-green-50', title: '5–7 Business Days', desc: 'Refund processing time' },
        ].map(({ icon, bg, title, desc }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>{icon}</div>
            <p className="font-bold text-base text-black">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Eligible / Not eligible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="font-bold text-sm text-green-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Eligible for Return</h3>
          <ul className="flex flex-col gap-2">
            {eligible.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-green-800">
                <span className="mt-0.5 shrink-0">✓</span>{item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="font-bold text-sm text-red-800 flex items-center gap-2"><XCircle className="w-4 h-4" />Not Eligible for Return</h3>
          <ul className="flex flex-col gap-2">
            {notEligible.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-red-800">
                <span className="mt-0.5 shrink-0">✗</span>{item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* How to return steps */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="font-bold text-base text-black">How to Initiate a Return</h2>
        <ol className="flex flex-col gap-4">
          {[
            { step: '1', title: 'Contact Us Within 7 Days', desc: <>Email <a href="mailto:sadiqshoaibbilal9140@gmail.com" className="font-semibold underline text-black">sadiqshoaibbilal9140@gmail.com</a> with your Order ID, the item(s) to return, and reason with photos if applicable.</> },
            { step: '2', title: 'Get Approval', desc: 'Our team will review your request within 24 hours and send return instructions along with a return authorization number.' },
            { step: '3', title: 'Pack & Ship the Item', desc: 'Pack the item securely in its original packaging with all tags attached. Drop it off at the nearest courier.' },
            { step: '4', title: 'Refund Processed', desc: 'Once we receive and inspect the returned item (2–3 business days), your refund will be initiated within 5–7 business days.' },
          ].map(({ step, title, desc }) => (
            <li key={step} className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center shrink-0">{step}</span>
              <div>
                <p className="font-bold text-sm text-black">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* FAQ accordion */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-1">
        <h2 className="font-bold text-base text-black mb-3">Frequently Asked Questions</h2>
        <AccordionItem q="How long do I have to return an item?"
          a="You have 7 days from the date of delivery to request a return. Requests after this window will not be accepted unless the item is defective." />
        <AccordionItem q="Who pays for the return shipping?"
          a="If the return is due to our error (wrong or defective item), we cover the return shipping cost. For other reasons (e.g., change of mind), the customer bears the shipping cost." />
        <AccordionItem q="How will I receive my refund?"
          a="Refunds are credited to your original payment method. For card payments: 5–7 business days. For COD: bank transfer within 7 business days. For Loyalty Points purchases: points are credited back." />
        <AccordionItem q="Can I exchange an item instead of getting a refund?"
          a="Yes! If your size or colour preference is in stock, we can arrange an exchange. Contact us within 7 days and we'll organise it for you at no extra cost for defective items." />
        <AccordionItem q="What if my returned item is rejected?"
          a="If the item doesn't meet return eligibility criteria upon inspection, it will be shipped back to you at your expense and no refund will be issued. We'll notify you by email." />
        <AccordionItem q="I haven't received my refund yet."
          a={<>If it's been more than 7 business days, first check your bank account. If nothing shows, contact us at <a href="mailto:sadiqshoaibbilal9140@gmail.com" className="font-semibold underline text-black">sadiqshoaibbilal9140@gmail.com</a> with your Order ID.</>} />
      </div>

      {/* Alert */}
      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Need help with a return? Call us at{' '}
          <a href="tel:+923281298871" className="font-semibold underline">0328-1298871</a> or{' '}
          <a href="tel:+923291747459" className="font-semibold underline">0329-1747459</a>{' '}
          Mon–Sat, 9am–6pm PKT.
        </p>
      </div>
    </div>
  );
}
