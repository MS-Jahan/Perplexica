import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const POST = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);

  return NextResponse.json({
    message: 'Logged out.',
    authenticated: false,
  });
};
