'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Truck, Clock, MapPin, Package, AlertCircle } from 'lucide-react';

export default function DeliveryDetailsPage() {
  const zones = [
    { zone: 'Karachi, Lahore, Islamabad', time: '7–10 Business Days', cost: 'FREE' },
    { zone: 'Other Major Cities', time: '7–10 Business Days', cost: 'FREE' },
    { zone: 'Remote Areas', time: '7–10 Business Days', cost: 'FREE' },
    { zone: 'Free Shipping', time: 'Orders above Rs5,000', cost: 'FREE' },
  ];

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 py-12 font-['Satoshi'] flex flex-col gap-10">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">Delivery Details</span>
      </nav>

      <div>
        <h1 className="text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF','Inter',sans-serif" }}>DELIVERY DETAILS</h1>
        <p className="text-gray-500 text-sm mt-2">Everything you need to know about how we deliver your order to your doorstep.</p>
      </div>

      {/* Highlight cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Truck className="w-5 h-5" />, title: 'Fast Delivery', desc: 'Nationwide shipping' },
          { icon: <Clock className="w-5 h-5" />, title: '7–10 Days', desc: 'Estimated delivery' },
          { icon: <MapPin className="w-5 h-5" />, title: 'All Pakistan', desc: 'We deliver everywhere' },
          { icon: <Package className="w-5 h-5" />, title: 'Tracked Orders', desc: 'Track via email' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-2 shadow-sm items-start">
            <div className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center">{icon}</div>
            <p className="font-bold text-sm text-black">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Delivery zones */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="font-bold text-base text-black">Delivery Zones & Charges</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3">Zone</th>
                <th className="pb-3">Estimated Time</th>
                <th className="pb-3">Shipping Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {zones.map(({ zone, time, cost }) => (
                <tr key={zone} className="hover:bg-gray-50">
                  <td className="py-3 font-semibold text-gray-800">{zone}</td>
                  <td className="py-3 text-gray-600">{time}</td>
                  <td className={`py-3 font-bold ${cost === 'FREE' ? 'text-green-600' : 'text-black'}`}>{cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process steps */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="font-bold text-base text-black">How Delivery Works</h2>
        <ol className="flex flex-col gap-4">
          {[
            { step: '1', title: 'Place Your Order', desc: 'Add items to cart, fill in your shipping address and complete payment.' },
            { step: '2', title: 'Order Confirmed', desc: 'You receive a confirmation email with your order ID and summary.' },
            { step: '3', title: 'Processing', desc: 'Our team picks, packs and dispatches your order within 24 hours.' },
            { step: '4', title: 'Out for Delivery', desc: 'A courier partner picks up and delivers to your address.' },
            { step: '5', title: 'Delivered', desc: 'You receive your package. Check items and enjoy!' },
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

      {/* Note */}
      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">Delivery times may vary during sale events, public holidays, or extreme weather conditions. For queries contact: <a href="mailto:sadiqshoaibbilal9140@gmail.com" className="font-bold underline">sadiqshoaibbilal9140@gmail.com</a></p>
      </div>
    </div>
  );
}
