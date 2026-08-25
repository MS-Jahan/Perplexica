export interface ProxySettings {
  server: string;
  username?: string;
  password?: string;
  bypass?: string;
}

/**
 * Reads proxy configuration from the environment.
 *
 * PROXY_SERVER     — proxy URL, e.g. http://proxy:8080, http://user:pass@proxy:8080 or socks5://proxy:1080
 * PROXY_USERNAME   — optional, overrides credentials embedded in the URL
 * PROXY_PASSWORD   — optional
 * PROXY_BYPASS     — optional comma-separated list of domains to exclude (Playwright only)
 *
 * Falls back to HTTPS_PROXY / HTTP_PROXY if PROXY_SERVER is unset.
 */
export function getProxySettings(): ProxySettings | undefined {
  const server =
    process.env.PROXY_SERVER ||
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY;

  if (!server) return undefined;

  let username = process.env.PROXY_USERNAME;
  let password = process.env.PROXY_PASSWORD;

  if (server.includes('@')) {
    try {
      const url = new URL(server);
      if (!username && url.username)
        username = decodeURIComponent(url.username);
      if (!password && url.password)
        password = decodeURIComponent(url.password);
    } catch {
      // URL not parseable — Playwright accepts scheme://user:pass@host as-is
    }
  }

  return {
    server,
    ...(username ? { username } : {}),
    ...(password ? { password } : {}),
    ...(process.env.PROXY_BYPASS
      ? { bypass: process.env.PROXY_BYPASS }
      : {}),
  };
}
