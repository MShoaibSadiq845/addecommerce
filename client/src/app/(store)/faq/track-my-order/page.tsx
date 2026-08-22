'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Package, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';

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

const statusSteps = [
  { icon: <Clock className="w-4 h-4" />, label: 'Pending', desc: 'Order received, awaiting confirmation', color: 'bg-yellow-100 text-yellow-700' },
  { icon: <Package className="w-4 h-4" />, label: 'Processing', desc: 'Order confirmed and being packed', color: 'bg-blue-100 text-blue-700' },
  { icon: <Truck className="w-4 h-4" />, label: 'Shipped', desc: 'Handed to courier, on the way', color: 'bg-indigo-100 text-indigo-700' },
  { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Delivered', desc: 'Package delivered to your address', color: 'bg-green-100 text-green-700' },
  { icon: <XCircle className="w-4 h-4" />, label: 'Canceled', desc: 'Order was canceled (refund initiated)', color: 'bg-red-100 text-red-700' },
];

export default function TrackMyOrderPage() {
  return (
    <div className="w-full max-w-[860px] mx-auto px-4 py-12 font-['Satoshi'] flex flex-col gap-10">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">Track My Order</span>
      </nav>

      <div>
        <h1 className="text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF','Inter',sans-serif" }}>TRACK MY ORDER</h1>
        <p className="text-gray-500 text-sm mt-2">Use your email to look up your order status in real time.</p>
      </div>

      {/* CTA to orders page */}
      <div className="bg-black text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-base">Check Your Order Status</p>
          <p className="text-sm text-gray-300 mt-0.5">Enter the email you used at checkout to see all your orders.</p>
        </div>
        <Link href="/orders"
          className="shrink-0 px-6 py-3 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-100 transition-colors">
          Go to My Orders →
        </Link>
      </div>

      {/* Status legend */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="font-bold text-base text-black">Order Status Meanings</h2>
        <div className="flex flex-col gap-3">
          {statusSteps.map(({ icon, label, desc, color }) => (
            <div key={label} className="flex items-center gap-4">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${color} shrink-0 min-w-[110px]`}>
                {icon}{label}
              </span>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-1">
        <h2 className="font-bold text-base text-black mb-3">Frequently Asked Questions</h2>
        <AccordionItem q="Where can I track my order?"
          a={<>Go to the <Link href="/orders" className="font-semibold underline text-black">My Orders</Link> page, enter the email used at checkout, and you'll see your order list with current status and a live progress bar.</>} />
        <AccordionItem q="How long does delivery take?"
          a="Karachi, Lahore & Islamabad: 2–3 business days. Other cities: 3–5 days. Remote areas: up to 7 days. See our Delivery Details page for full information." />
        <AccordionItem q="My order shows 'Processing' for more than 2 days. What should I do?"
          a={<>If your order has been in Processing for over 48 hours, please contact us at <a href="mailto:fabdecor09@gmail.com" className="font-semibold underline text-black">fabdecor09@gmail.com</a> or call <a href="tel:+923291747459" className="font-semibold underline text-black">0329-1747459</a>.</>} />
        <AccordionItem q="I received a wrong or damaged item."
          a="We sincerely apologize. Please contact us within 48 hours of delivery with photos of the item and packaging. We will arrange a free replacement or full refund." />
        <AccordionItem q="Can I change my delivery address after placing an order?"
          a="Address changes are only possible if the order is still in 'Pending' status. Contact us immediately at our support email or phone number." />
        <AccordionItem q="What happens if nobody is home for delivery?"
          a="The courier will attempt delivery up to 2 times. After that, the package is returned to our warehouse and you'll be contacted to arrange re-delivery or a refund." />
      </div>
    </div>
  );
}
