import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';
import {
  AUTH_PAYLOAD,
  getAuthPassword,
  isAuthEnabled,
} from './constants';

export const createAuthToken = (password: string): string => {
  return createHmac('sha256', password)
    .update(AUTH_PAYLOAD)
    .digest('base64url');
};

export const verifyAuthCookie = (cookieValue: string | undefined): boolean => {
  if (!isAuthEnabled()) return true;

  const password = getAuthPassword();
  if (!password || !cookieValue) return false;

  const expected = createAuthToken(password);

  try {
    const a = Buffer.from(cookieValue);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
};
