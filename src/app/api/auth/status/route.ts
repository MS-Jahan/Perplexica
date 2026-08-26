import {
  AUTH_COOKIE_NAME,
  isAuthEnabled,
} from '@/lib/auth/constants';
import { verifyAuthCookie } from '@/lib/auth/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const required = isAuthEnabled();

  if (!required) {
    return NextResponse.json({
      required: false,
      authenticated: true,
    });
  }

  const cookieStore = await cookies();
  const cookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const authenticated = verifyAuthCookie(cookie);

  return NextResponse.json({
    required: true,
    authenticated,
  });
};
