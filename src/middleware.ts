import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, isAuthEnabled } from '@/lib/auth/constants';
import { verifyAuthCookie } from '@/lib/auth/edge';

const PUBLIC_API_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/status',
]);

export async function middleware(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (PUBLIC_API_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (await verifyAuthCookie(cookie)) {
    return NextResponse.next();
  }

  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

export const config = {
  matcher: '/api/:path*',
};
