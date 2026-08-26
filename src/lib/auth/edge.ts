import {
  AUTH_PAYLOAD,
  getAuthPassword,
  isAuthEnabled,
} from './constants';

const base64url = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const createAuthToken = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(AUTH_PAYLOAD),
  );
  return base64url(new Uint8Array(signature));
};

export const verifyAuthCookie = async (
  cookieValue: string | undefined,
): Promise<boolean> => {
  if (!isAuthEnabled()) return true;

  const password = getAuthPassword();
  if (!password || !cookieValue) return false;

  const expected = await createAuthToken(password);
  return cookieValue === expected;
};
