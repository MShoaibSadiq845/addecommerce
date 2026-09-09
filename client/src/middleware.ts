import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge middleware — runs on every request BEFORE the page renders.
 *
 * Protection rules:
 *  /login, /register → if authenticated, redirect to / (or /admin for admins)
 *  /admin/login      → if authenticated, redirect to /admin (or / for regular users)
 *  /admin/*          → requires a token cookie AND an admin role claim
 *                      Redirects to /admin/login on failure.
 *
 * The JWT is stored in a cookie called `admin_token` (set by the login page
 * after a successful API call).
 *
 * The role is stored in the cookie `admin_role` so we don't have to decode
 * the JWT on every request.
 */

const ADMIN_LOGIN = '/admin/login';
const ADMIN_ROOT = '/admin';
const VALID_ROLES = ['Admin', 'Super Admin'];
const STORE_AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_token')?.value;
  const role = request.cookies.get('admin_role')?.value;
  const isAuthenticated = Boolean(token);
  const isAdmin = Boolean(token && role && VALID_ROLES.includes(role));

  // If user is already logged in, redirect them away from storefront auth pages (/login, /register)
  if (STORE_AUTH_ROUTES.includes(pathname)) {
    if (isAuthenticated) {
      const redirectUrl = isAdmin ? ADMIN_ROOT : '/';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Only act on /admin routes beyond this point
  if (!pathname.startsWith(ADMIN_ROOT)) {
    return NextResponse.next();
  }

  // Always allow access or redirect on the admin login page
  if (pathname === ADMIN_LOGIN || pathname.startsWith(`${ADMIN_LOGIN}/`)) {
    if (isAdmin) {
      return NextResponse.redirect(new URL(ADMIN_ROOT, request.url));
    }
    if (isAuthenticated && !isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // All other /admin/* paths require valid admin credentials
  if (!isAdmin) {
    const loginUrl = new URL(ADMIN_LOGIN, request.url);
    // Pass the original destination so the login page can redirect back
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on storefront auth routes and /admin routes, skipping static files & API routes
  matcher: ['/admin/:path*', '/login', '/register'],
};
