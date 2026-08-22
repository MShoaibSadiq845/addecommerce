'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Mail, Phone, MessageCircle, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useSubmitContactMessageMutation } from '@/store/services/notificationsApi';
import { toast } from 'react-hot-toast';

export default function CustomerSupportPage() {
  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitContactMessage, { isLoading }] = useSubmitContactMessageMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContactMessage(form).unwrap();
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 py-12 font-['Satoshi'] flex flex-col gap-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/help/customer-support" className="text-black font-medium">Customer Support</Link>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF','Inter',sans-serif" }}>
          CUSTOMER SUPPORT
        </h1>
        <p className="text-gray-500 text-sm">We're here to help. Reach out any time and we'll get back to you within 24 hours.</p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Phone className="w-5 h-5 text-black" />, title: 'Call Us', lines: ['0328-1298871', '0329-1747459'], sub: 'Mon–Sat, 9am–6pm PKT' },
          { icon: <Mail className="w-5 h-5 text-black" />, title: 'Email Us', lines: ['sadiqshoaibbilal9140@gmail.com'], sub: 'Reply within 24 hours' },
          { icon: <Clock className="w-5 h-5 text-black" />, title: 'Support Hours', lines: ['Monday – Saturday', '9:00 AM – 6:00 PM'], sub: 'Pakistan Standard Time' },
        ].map(({ icon, title, lines, sub }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">{icon}</div>
            <p className="font-bold text-sm text-black">{title}</p>
            {lines.map((l) => <p key={l} className="text-sm text-gray-700 font-medium">{l}</p>)}
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Contact form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
        <h2 className="font-bold text-lg text-black">Send Us a Message</h2>
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-bold text-black text-lg">Message Sent!</p>
            <p className="text-sm text-gray-500">We'll get back to you at <strong>{form.phone}</strong> within 24 hours.</p>
            <button 
              onClick={() => {
                setSubmitted(false);
                setForm({ name: '', phone: '', subject: '', message: '' });
              }} 
              className="mt-2 px-6 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-colors"
            >
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Your Name', key: 'name', type: 'text', placeholder: 'Shoaib Sadiq', col: 1 },
              { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '0328-1298871', col: 1 },
              { label: 'Subject', key: 'subject', type: 'text', placeholder: 'Order issue, refund, etc.', col: 2 },
            ].map(({ label, key, type, placeholder, col }) => (
              <div key={key} className={`flex flex-col gap-1 ${col === 2 ? 'sm:col-span-2' : ''}`}>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</label>
                <input type={type} placeholder={placeholder} required value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black" />
              </div>
            ))}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Message</label>
              <textarea rows={4} required placeholder="Describe your issue in detail..." value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black resize-none" />
            </div>
            <div className="sm:col-span-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-black text-white rounded-full py-3 text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
