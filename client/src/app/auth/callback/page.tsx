'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');

    if (!token) {
      setStatus('error');
      setErrorMessage('Authentication failed: No token received.');
      toast.error('Social authentication failed.');
      setTimeout(() => {
        router.push('/');
      }, 2500);
      return;
    }

    const processAuth = async () => {
      try {
        let userData: any = null;

        if (userRaw) {
          try {
            userData = JSON.parse(decodeURIComponent(userRaw));
          } catch (e) {
            console.error('Failed to parse user raw param:', e);
          }
        }

        if (!userData) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const res = await fetch(`${apiUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error(`Failed to fetch user profile (${res.status})`);
          }

          userData = await res.json();
        }

        if (userData) {
          const formattedUser = {
            id: userData.id || userData._id,
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || 'User',
            loyaltyPoints: userData.loyaltyPoints ?? 0,
            avatar: userData.avatar ?? '',
            phone: userData.phone ?? '',
            address: userData.address ?? '',
            provider: userData.provider ?? 'Social',
          };

          dispatch(
            setCredentials({
              token,
              user: formattedUser,
            }),
          );

          const cookieOpts: Cookies.CookieAttributes = {
            expires: 7,
            sameSite: 'Strict',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
          };
          Cookies.set('admin_token', token, cookieOpts);
          Cookies.set('admin_role', formattedUser.role, cookieOpts);

          setStatus('success');
          const providerName = formattedUser.provider
            ? formattedUser.provider.charAt(0).toUpperCase() + formattedUser.provider.slice(1)
            : 'Social';
          toast.success(`Logged in with ${providerName}! Welcome back, ${formattedUser.name || 'User'}.`, { id: 'auth-success' });

          setTimeout(() => {
            if (formattedUser.role === 'Admin' || formattedUser.role === 'Super Admin') {
              router.push('/admin');
            } else {
              router.push('/');
            }
          }, 1200);
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Failed to process user session.');
        toast.error('Authentication processing error.', { id: 'auth-error' });
        setTimeout(() => {
          router.push('/');
        }, 2500);
      }
    };

    processAuth();
  }, [searchParams, router, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-['Satoshi']">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center flex flex-col items-center gap-4">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-black animate-spin" />
            </div>
            <h2 className="text-xl font-extrabold text-black" style={{ fontFamily: "'Integral CF', sans-serif" }}>
              AUTHENTICATING...
            </h2>
            <p className="text-xs text-gray-500">
              Verifying your credentials and establishing your secure session. Please wait.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>
            <h2 className="text-xl font-extrabold text-black" style={{ fontFamily: "'Integral CF', sans-serif" }}>
              WELCOME BACK!
            </h2>
            <p className="text-xs text-gray-500">
              Authentication successful. Redirecting you to your account...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-extrabold text-red-600">AUTH ERROR</h2>
            <p className="text-xs text-gray-500">{errorMessage}</p>
            <p className="text-[11px] text-gray-400">Redirecting to homepage...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}
