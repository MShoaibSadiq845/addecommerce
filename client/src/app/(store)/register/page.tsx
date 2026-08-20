'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Loader2, UserPlus, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useRegisterMutation } from '@/store/services/authApi';
import { SocialLoginButtons } from '@/components/storefront/SocialLoginButtons';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function StoreRegisterPageInner() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const watchPassword = watch('password', '');

  const onSubmit = async (values: RegisterForm) => {
    try {
      await registerUser({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        role: 'User',
      }).unwrap();

      toast.success('Account created successfully! Please log in with your email and password.');
      // Move to login page with prefilled email
      router.push(`/login?email=${encodeURIComponent(values.email.trim().toLowerCase())}`);
    } catch (err: any) {
      const message =
        err?.data?.message ||
        (Array.isArray(err?.data?.message) ? err.data.message[0] : null) ||
        'Registration failed. Please check your details.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 font-['Satoshi']">
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-black text-white px-8 pt-8 pb-7 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 text-white mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
          >
            CREATE ACCOUNT
          </h1>
          <p className="text-gray-300 text-xs mt-1">
            Join FabDecor for seamless checkout and exclusive loyalty points.
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                placeholder="Muhammad Ali"
                autoComplete="name"
                {...register('name', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
                className={`w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-black ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <span className="text-[11px] text-red-500 font-medium">{errors.name.message}</span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
                className={`w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-black ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.email && (
                <span className="text-[11px] text-red-500 font-medium">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Must be at least 6 characters' },
                  })}
                  className={`w-full border rounded-xl p-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-black ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[11px] text-red-500 font-medium">{errors.password.message}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (v) => v === watchPassword || 'Passwords do not match',
                  })}
                  className={`w-full border rounded-xl p-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-black ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-[11px] text-red-500 font-medium">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-4">
            <SocialLoginButtons compact={true} />
          </div>

          {/* Link to Login */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-black hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreRegisterPage() {
  return (
    <Suspense>
      <StoreRegisterPageInner />
    </Suspense>
  );
}
