'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ShieldCheck, Loader2, Lock, Mail, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

import { useLoginMutation, useRegisterMutation } from '@/store/services/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { SocialLoginButtons } from '@/components/storefront/SocialLoginButtons';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Inner page (needs useSearchParams — wrapped in Suspense below) ───────────

function AdminLoginInner() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/admin';

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [login, { isLoading: loggingIn }] = useLoginMutation();
  const [register, { isLoading: registering }] = useRegisterMutation();

  // ── Login form ──────────────────────────────────────────────────────────
  const {
    register: regLogin,
    handleSubmit: handleLoginSubmit,
    reset: resetLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>();

  // ── Register form ───────────────────────────────────────────────────────
  const {
    register: regReg,
    handleSubmit: handleRegisterSubmit,
    reset: resetReg,
    watch,
    formState: { errors: regErrors },
  } = useForm<RegisterForm>();

  const watchPassword = watch('password', '');

  // ── Persist auth after a successful API response ────────────────────────
  function persistAuth(data: { token: string; user: any }) {
    dispatch(
      setCredentials({
        token: data.token,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          loyaltyPoints: data.user.loyaltyPoints ?? 0,
          avatar: data.user.avatar ?? '',
        },
      }),
    );

    const cookieOpts: Cookies.CookieAttributes = {
      expires: 7,          // days
      sameSite: 'Strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
    Cookies.set('admin_token', data.token, cookieOpts);
    Cookies.set('admin_role', data.user.role, cookieOpts);
  }

  // ── Submit: Login ───────────────────────────────────────────────────────
  const onLogin = async (values: LoginForm) => {
    try {
      const data = await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap();

      persistAuth(data);
      toast.success(`Welcome back, ${data.user.name}!`);

      const role: string = data.user?.role ?? '';
      if (role === 'Admin' || role === 'Super Admin') {
        window.location.href = nextPath || '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      const msg =
        err?.data?.message || 'Login failed. Check your credentials.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  // ── Submit: Register ────────────────────────────────────────────────────
  const onRegister = async (values: RegisterForm) => {
    try {
      const data = await register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap();

      toast.success('Account created successfully! Please sign in with your credentials.');
      resetReg();
      resetLogin({
        email: values.email.trim().toLowerCase(),
        password: '',
      });
      setTab('login');
    } catch (err: any) {
      const msg =
        err?.data?.message || 'Registration failed. Please try again.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  // ── Shared input class ──────────────────────────────────────────────────
  const inputCls = (hasError: boolean) =>
    `w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all pl-10
     ${hasError
      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-gray-200 focus:ring-2 focus:ring-black/10 focus:border-gray-400'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center px-4 py-12 font-['Satoshi']">
      <div className="w-full max-w-[420px] flex flex-col gap-6">

        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-2xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
          >
            SHOP.CO Admin
          </h1>
          <p className="text-xs text-gray-400">
            Restricted access · Authorised personnel only
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Tab switcher */}
          <div className="grid grid-cols-2 border-b border-gray-100">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-4 text-sm font-bold transition-colors capitalize
                  ${tab === t
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div className="p-8">

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <div className="flex flex-col gap-5">
                <form onSubmit={handleLoginSubmit(onLogin)} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="admin@shop.co"
                        autoComplete="email"
                        className={inputCls(!!loginErrors.email)}
                        {...regLogin('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Enter a valid email',
                          },
                        })}
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-xs text-red-500">{loginErrors.email.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className={`${inputCls(!!loginErrors.password)} pr-11`}
                        {...regLogin('password', {
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Min 6 characters' },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-xs text-red-500">{loginErrors.password.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loggingIn}
                    className="w-full py-3.5 bg-black text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                  >
                    {loggingIn ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /> Sign In to Dashboard</>
                    )}
                  </button>
                </form>

                {/* Social Login Buttons */}
                <SocialLoginButtons labelPrefix="Sign in with" />
              </div>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && (
              <div className="flex flex-col gap-5">
                <form onSubmit={handleRegisterSubmit(onRegister)} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        autoComplete="name"
                        className={inputCls(!!regErrors.name)}
                        {...regReg('name', {
                          required: 'Name is required',
                          minLength: { value: 2, message: 'Min 2 characters' },
                        })}
                      />
                    </div>
                    {regErrors.name && (
                      <p className="text-xs text-red-500">{regErrors.name.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        className={inputCls(!!regErrors.email)}
                        {...regReg('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Enter a valid email',
                          },
                        })}
                      />
                    </div>
                    {regErrors.email && (
                      <p className="text-xs text-red-500">{regErrors.email.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        autoComplete="new-password"
                        className={`${inputCls(!!regErrors.password)} pr-11`}
                        {...regReg('password', {
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Min 6 characters' },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {regErrors.password && (
                      <p className="text-xs text-red-500">{regErrors.password.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        className={`${inputCls(!!regErrors.confirmPassword)} pr-11`}
                        {...regReg('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (v) =>
                            v === watchPassword || 'Passwords do not match',
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {regErrors.confirmPassword && (
                      <p className="text-xs text-red-500">{regErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={registering}
                    className="w-full py-3.5 bg-black text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                  >
                    {registering ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                {/* Social Login Buttons */}
                <SocialLoginButtons labelPrefix="Register with" />

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 text-center">
                  New accounts are created as regular users.
                  Contact a Super Admin to grant admin privileges.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-600">
          This page is not publicly listed.
          Unauthorised access attempts are logged.
        </p>
      </div>
    </div>
  );
}

// ─── Page export (Suspense wrapper required for useSearchParams) ──────────────

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginInner />
    </Suspense>
  );
}
