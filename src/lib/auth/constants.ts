export const AUTH_COOKIE_NAME = 'vane_auth';
export const AUTH_PAYLOAD = 'vane-auth-v1';
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const isAuthEnabled = (): boolean => {
  const password = process.env.VANE_PASSWORD;
  return Boolean(password && password.length > 0);
};

export const getAuthPassword = (): string | undefined => {
  const password = process.env.VANE_PASSWORD;
  if (!password || password.length === 0) return undefined;
  return password;
};
