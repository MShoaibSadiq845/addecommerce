'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { X, Eye, EyeOff, Mail, Lock, User, Loader2, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

import { useLoginMutation, useRegisterMutation } from '@/store/services/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { SocialLoginButtons } from '@/components/storefront/SocialLoginButtons';

interface StoreAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  onSuccess?: () => void;
}

type LoginForm = {
  email: string;
  password: string;
};

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function StoreAuthModal({
  isOpen,
  onClose,
  initialTab = 'login',
  onSuccess,
}: StoreAuthModalProps) {
  const dispatch = useDispatch();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [login, { isLoading: loggingIn }] = useLoginMutation();
  const [register, { isLoading: registering }] = useRegisterMutation();

  const {
    register: regLogin,
    handleSubmit: handleLoginSubmit,
    reset: resetLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>();

  const {
    register: regReg,
    handleSubmit: handleRegisterSubmit,
    reset: resetReg,
    watch,
    formState: { errors: regErrors },
  } = useForm<RegisterForm>();

  const watchPassword = watch('password', '');

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      resetLogin();
      resetReg();
    }
  }, [isOpen, initialTab, resetLogin, resetReg]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const persistAuth = (data: { token: string; user: any }) => {
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
  };

  const onLogin = async (values: LoginForm) => {
    try {
      const data = await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap();

      persistAuth(data);
      toast.success(`Welcome back, ${data.user.name || 'shopper'}!`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const message =
        err?.data?.message ||
        (Array.isArray(err?.data?.message) ? err.data.message[0] : null) ||
        'Invalid email or password';
      toast.error(message);
    }
  };

  const onRegister = async (values: RegisterForm) => {
    try {
      const data = await register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        role: 'User',
      }).unwrap();

      toast.success('Account created successfully! Please log in with your email and password.');
      resetReg();
      resetLogin({
        email: values.email.trim().toLowerCase(),
        password: '',
      });
      setTab('login');
    } catch (err: any) {
      const message =
        err?.data?.message ||
        (Array.isArray(err?.data?.message) ? err.data.message[0] : null) ||
        'Registration failed. Please check your details.';
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Card */}
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden font-['Satoshi']"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Banner */}
        <div className="bg-black text-white px-7 pt-7 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 text-white mb-3 shadow-inner">
            {tab === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
          >
            {tab === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
          </h2>
          <p className="text-gray-300 text-xs mt-1">
            {tab === 'login'
              ? 'Sign in to auto-fill delivery details and track your orders.'
              : 'Join FabDecor for seamless checkout and exclusive loyalty points.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/70 p-1.5 gap-1.5 mx-6 mt-5 rounded-2xl">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              tab === 'register'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-4">
          {tab === 'login' ? (
            /* ─── LOGIN FORM ─── */
            <form onSubmit={handleLoginSubmit(onLogin)} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...regLogin('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${
                    loginErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {loginErrors.email && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {loginErrors.email.message}
                  </span>
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
                    {...regLogin('password', {
                      required: 'Password is required',
                    })}
                    className={`w-full border rounded-xl p-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-black ${
                      loginErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
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
                {loginErrors.password && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {loginErrors.password.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2 shadow-md hover:shadow-lg"
              >
                {loggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing In…
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ─── REGISTER FORM ─── */
            <form onSubmit={handleRegisterSubmit(onRegister)} className="flex flex-col gap-3.5">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <input
                  type="text"
                  placeholder="Muhammad Ali"
                  {...regReg('name', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                  className={`w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-black ${
                    regErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {regErrors.name && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {regErrors.name.message}
                  </span>
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
                  {...regReg('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-black ${
                    regErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {regErrors.email && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {regErrors.email.message}
                  </span>
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
                    {...regReg('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Must be at least 6 characters' },
                    })}
                    className={`w-full border rounded-xl p-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-black ${
                      regErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
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
                {regErrors.password && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {regErrors.password.message}
                  </span>
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
                    {...regReg('confirmPassword', {
                      required: 'Please confirm password',
                      validate: (v) => v === watchPassword || 'Passwords do not match',
                    })}
                    className={`w-full border rounded-xl p-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-black ${
                      regErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200'
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
                {regErrors.confirmPassword && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {regErrors.confirmPassword.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2 shadow-md hover:shadow-lg"
              >
                {registering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Account…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Create Account
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Logins */}
          <div className="mt-4">
            <SocialLoginButtons compact={true} />
          </div>

          {/* Switch tab prompt */}
          <div className="mt-4 pt-3 border-t border-gray-100 text-center text-xs text-gray-500">
            {tab === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="font-bold text-black hover:underline"
                >
                  Register now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="font-bold text-black hover:underline"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
