import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  getAuthPassword,
  isAuthEnabled,
} from '@/lib/auth/constants';
import { createAuthToken } from '@/lib/auth/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type LoginBody = {
  password?: string;
};

export const POST = async (req: NextRequest) => {
  if (!isAuthEnabled()) {
    return NextResponse.json({
      message: 'Authentication is not enabled.',
      authenticated: true,
    });
  }

  let body: LoginBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const password = body.password;
  if (!password || typeof password !== 'string') {
    return NextResponse.json(
      { message: 'Password is required.' },
      { status: 400 },
    );
  }

  const expectedPassword = getAuthPassword();
  if (!expectedPassword || password !== expectedPassword) {
    return NextResponse.json(
      { message: 'Invalid password.' },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, createAuthToken(expectedPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return NextResponse.json({
    message: 'Authenticated.',
    authenticated: true,
  });
};
