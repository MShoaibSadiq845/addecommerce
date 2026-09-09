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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Card - Compact height so no scroll is needed */}
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden font-['Satoshi'] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white text-black hover:bg-gray-100 flex items-center justify-center transition-colors z-20 shadow-md"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Header Banner */}
        <div className="bg-black text-white px-6 py-4 text-center shrink-0 relative border-b border-gray-800">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 text-white mb-1 shadow-inner">
            {tab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </div>
          <h2
            className="text-lg sm:text-xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
          >
            {tab === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
          </h2>
          <p className="text-gray-300 text-[11px] mt-0.5">
            {tab === 'login'
              ? 'Sign in to auto-fill delivery details and track your orders.'
              : 'Join FabDecor for seamless checkout and rewards.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border border-gray-100 bg-gray-50/70 p-1 gap-1 mx-5 sm:mx-6 mt-3.5 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
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
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body - Compact padding & field heights */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          {tab === 'login' ? (
            /* ─── LOGIN FORM ─── */
            <form onSubmit={handleLoginSubmit(onLogin)} className="flex flex-col gap-3">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email Address
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
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black ${
                    loginErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {loginErrors.email && (
                  <span className="text-[10px] text-red-500 font-medium">
                    {loginErrors.email.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...regLogin('password', {
                      required: 'Password is required',
                    })}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2 pr-9 text-xs outline-none focus:ring-2 focus:ring-black ${
                      loginErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <span className="text-[10px] text-red-500 font-medium">
                    {loginErrors.password.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-1 shadow-sm hover:shadow"
              >
                {loggingIn ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing In…
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ─── REGISTER FORM ─── */
            <form onSubmit={handleRegisterSubmit(onRegister)} className="flex flex-col gap-2">
              {/* Full Name */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input
                  type="text"
                  placeholder="Muhammad Ali"
                  {...regReg('name', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black ${
                    regErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {regErrors.name && (
                  <span className="text-[10px] text-red-500 font-medium">
                    {regErrors.name.message}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email Address
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
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black ${
                    regErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {regErrors.email && (
                  <span className="text-[10px] text-red-500 font-medium">
                    {regErrors.email.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    {...regReg('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Must be at least 6 characters' },
                    })}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2 pr-9 text-xs outline-none focus:ring-2 focus:ring-black ${
                      regErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {regErrors.password && (
                  <span className="text-[10px] text-red-500 font-medium">
                    {regErrors.password.message}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    {...regReg('confirmPassword', {
                      required: 'Please confirm password',
                      validate: (v) => v === watchPassword || 'Passwords do not match',
                    })}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2 pr-9 text-xs outline-none focus:ring-2 focus:ring-black ${
                      regErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {regErrors.confirmPassword && (
                  <span className="text-[10px] text-red-500 font-medium">
                    {regErrors.confirmPassword.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-1 shadow-sm hover:shadow"
              >
                {registering ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating Account…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Create Account
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Logins */}
          <div className="mt-2">
            <SocialLoginButtons compact={true} />
          </div>

          {/* Switch tab prompt */}
          <div className="mt-2 pt-2 border-t border-gray-100 text-center text-[11px] text-gray-500">
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
