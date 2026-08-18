'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Loader2, LogIn, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

import { useLoginMutation } from '@/store/services/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { SocialLoginButtons } from '@/components/storefront/SocialLoginButtons';

type LoginForm = {
  email: string;
  password: string;
};

function StoreLoginPageInner() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const redirectParam = searchParams.get('redirect') || '/';

  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: initialEmail,
      password: '',
    },
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      const data = await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap();

      dispatch(
        setCredentials({
          token: data.token,
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role || 'User',
            loyaltyPoints: data.user.loyaltyPoints ?? 0,
            avatar: data.user.avatar ?? '',
          },
        }),
      );

      const cookieOpts: Cookies.CookieAttributes = {
        expires: 7,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      };
      Cookies.set('admin_token', data.token, cookieOpts);
      Cookies.set('admin_role', data.user.role || 'User', cookieOpts);

      toast.success(`Welcome back, ${data.user.name || 'shopper'}!`);
      router.push(redirectParam);
    } catch (err: any) {
      const message =
        err?.data?.message ||
        (Array.isArray(err?.data?.message) ? err.data.message[0] : null) ||
        'Invalid email or password';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 font-['Satoshi']">
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-black text-white px-8 pt-8 pb-7 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 text-white mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
          >
            WELCOME BACK
          </h1>
          <p className="text-gray-300 text-xs mt-1">
            Sign in to access your orders, saved items, and loyalty points.
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            
            {/* Email */}
            <div className="flex flex-col gap-1.5">
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
                className={`w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.email && (
                <span className="text-[11px] text-red-500 font-medium">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  className={`w-full border rounded-xl p-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-black ${
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing In…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-4">
            <SocialLoginButtons compact={true} />
          </div>

          {/* Link to Register */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-black hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreLoginPage() {
  return (
    <Suspense>
      <StoreLoginPageInner />
    </Suspense>
  );
}
