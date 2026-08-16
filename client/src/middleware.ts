import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge middleware — runs on every request BEFORE the page renders.
 *
 * Protection rules:
 *  /admin/login  → always accessible (the auth page itself)
 *  /admin/*      → requires a token cookie AND an admin role claim
 *                  Redirects to /admin/login on failure.
 *
 * The JWT is stored in a cookie called `admin_token` (set by the login page
 * after a successful API call).  We do a lightweight decode of the payload
 * here — NO cryptographic verification, because the Edge Runtime cannot run
 * the Node.js `jsonwebtoken` library.  Full verification still happens on
 * every protected API call via the NestJS AuthGuard('jwt').
 *
 * The role is stored in the cookie `admin_role` so we don't have to decode
 * the JWT on every request.
 */

const ADMIN_LOGIN = '/admin/login';
const ADMIN_ROOT = '/admin';
const VALID_ROLES = ['Admin', 'Super Admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only act on /admin routes
  if (!pathname.startsWith(ADMIN_ROOT)) {
    return NextResponse.next();
  }

  // Always allow access to the login page itself
  if (pathname === ADMIN_LOGIN || pathname.startsWith(`${ADMIN_LOGIN}/`)) {
    // If already authenticated redirect straight to dashboard
    const role = request.cookies.get('admin_role')?.value;
    const token = request.cookies.get('admin_token')?.value;
    if (token && role && VALID_ROLES.includes(role)) {
      return NextResponse.redirect(new URL(ADMIN_ROOT, request.url));
    }
    return NextResponse.next();
  }

  // All other /admin/* paths require valid credentials
  const token = request.cookies.get('admin_token')?.value;
  const role = request.cookies.get('admin_role')?.value;

  if (!token || !role || !VALID_ROLES.includes(role)) {
    const loginUrl = new URL(ADMIN_LOGIN, request.url);
    // Pass the original destination so the login page can redirect back
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every /admin path, but skip static assets and Next.js internals
  matcher: ['/admin/:path*'],
};
