'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { ChevronRight, Mail, Phone, MessageCircle, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useSubmitContactMessageMutation } from '@/store/services/notificationsApi';
import { toast } from 'react-hot-toast';

interface ContactFormData {
  name: string;
  phone: string;
  subject: string;
  message: string;
}

export default function CustomerSupportPage() {
  const [submittedPhone, setSubmittedPhone] = useState<string | null>(null);
  const [submitContactMessage, { isLoading }] = useSubmitContactMessageMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    defaultValues: {
      name: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await submitContactMessage(data).unwrap();
      setSubmittedPhone(data.phone);
      reset();
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
          {
            icon: <Phone className="w-5 h-5 text-black" />,
            title: 'Customer Support',
            lines: ['03291747459'],
            href: 'tel:+923291747459',
            sub: 'Reply within 24 hours',
          },
          {
            icon: <Mail className="w-5 h-5 text-black" />,
            title: 'Email Us',
            lines: ['fabdecor09@gmail.com'],
            href: 'mailto:fabdecor09@gmail.com',
            sub: 'Reply within 24 hours',
          },
          {
            icon: <Clock className="w-5 h-5 text-black" />,
            title: 'Support Hours',
            lines: ['Monday – Sunday', '9:00 AM – 6:00 PM'],
            sub: 'Pakistan Standard Time',
          },
        ].map(({ icon, title, lines, sub, href }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">{icon}</div>
            <p className="font-bold text-sm text-black">{title}</p>
            {lines.map((l) =>
              href ? (
                <a key={l} href={href} className="text-sm text-gray-700 font-medium hover:text-black transition-colors">
                  {l}
                </a>
              ) : (
                <p key={l} className="text-sm text-gray-700 font-medium">{l}</p>
              )
            )}
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Contact form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
        <h2 className="font-bold text-lg text-black">Send Us a Message</h2>
        {submittedPhone ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-bold text-black text-lg">Message Sent!</p>
            <p className="text-sm text-gray-500">We'll get back to you at <strong>{submittedPhone}</strong> within 24 hours.</p>
            <button
              onClick={() => {
                setSubmittedPhone(null);
                reset();
              }}
              className="mt-2 px-6 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-colors"
            >
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Your Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                {...register('name', {
                  required: 'Your name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
                className={`border rounded-xl p-3 text-sm outline-none transition-all ${
                  errors.name
                    ? 'border-red-500 bg-red-50/50 focus:ring-2 focus:ring-red-400'
                    : 'border-gray-200 focus:ring-2 focus:ring-black'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.name.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                placeholder="Enter your number (e.g. 03291747459)"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9+\-\s()]{7,16}$/,
                    message: 'Only numbers allowed (minimum 7 digits)',
                  },
                })}
                onInput={(e) => {
                  // Prevent non-numeric characters (only digits, +, -, and space allowed)
                  e.currentTarget.value = e.currentTarget.value.replace(/[^0-9+\-\s]/g, '');
                }}
                className={`border rounded-xl p-3 text-sm outline-none transition-all ${
                  errors.phone
                    ? 'border-red-500 bg-red-50/50 focus:ring-2 focus:ring-red-400'
                    : 'border-gray-200 focus:ring-2 focus:ring-black'
                }`}
              />
              {errors.phone && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.phone.message}</p>}
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Subject</label>
              <input
                type="text"
                placeholder="Order issue, refund, etc."
                {...register('subject', {
                  required: 'Subject is required',
                  minLength: { value: 3, message: 'Subject must be at least 3 characters' },
                })}
                className={`border rounded-xl p-3 text-sm outline-none transition-all ${
                  errors.subject
                    ? 'border-red-500 bg-red-50/50 focus:ring-2 focus:ring-red-400'
                    : 'border-gray-200 focus:ring-2 focus:ring-black'
                }`}
              />
              {errors.subject && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.subject.message}</p>}
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Message</label>
              <textarea
                rows={4}
                placeholder="Describe your issue in detail..."
                {...register('message', {
                  required: 'Message is required',
                  minLength: { value: 10, message: 'Message must be at least 10 characters' },
                })}
                className={`border rounded-xl p-3 text-sm outline-none transition-all resize-none ${
                  errors.message
                    ? 'border-red-500 bg-red-50/50 focus:ring-2 focus:ring-red-400'
                    : 'border-gray-200 focus:ring-2 focus:ring-black'
                }`}
              />
              {errors.message && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.message.message}</p>}
            </div>

            {/* Submit Button */}
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

