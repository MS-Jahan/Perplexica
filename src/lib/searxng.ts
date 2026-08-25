import { getSearxngURL } from './config/serverRegistry';

/**
 * Builds auth headers for an external SearXNG instance protected by a
 * gateway. SearXNG itself has no native API key for /search — protection is
 * done in front of it (reverse proxy, authelia, custom plugin), typically via
 * an Authorization or custom header.
 *
 * Env:
 *   SEARXNG_API_URL        base URL of the instance (falls back to config.json)
 *   SEARXNG_AUTH_HEADER    custom header name, e.g. `X-My-Gateway-Key`
 *   SEARXNG_AUTH_VALUE     custom header value, e.g. the key itself
 *                          (takes precedence over the modes below)
 *   SEARXNG_API_KEY        the key/token. With `basic` the value must be
 *                          `user:password`; with `bearer` (default) the raw
 *                          token. Credentials embedded in the URL
 *                          (`http://user:pass@host`) are detected automatically.
 *   SEARXNG_API_KEY_TYPE   `bearer` (default) or `basic`
 */
export const getSearxngAuthHeaders = (
  url?: string,
): Record<string, string> => {
  const headers: Record<string, string> = {};
  const key = process.env.SEARXNG_API_KEY;
  const type = (process.env.SEARXNG_API_KEY_TYPE || 'bearer').toLowerCase();

  /* Fully custom header: name + value chosen by the operator */
  const customHeader = process.env.SEARXNG_AUTH_HEADER;
  const customValue = process.env.SEARXNG_AUTH_VALUE;
  if (customHeader && customValue) {
    headers[customHeader] = customValue;
    return headers;
  }

  if (url && url.includes('@')) {
    try {
      const parsed = new URL(url);
      if (parsed.username) {
        const basic = Buffer.from(
          `${decodeURIComponent(parsed.username)}:${decodeURIComponent(parsed.password || '')}`,
        ).toString('base64');
        headers['Authorization'] = `Basic ${basic}`;
        return headers;
      }
    } catch {
      /* not a parseable URL — fall through */
    }
  }

  if (!key) return headers;

  if (type === 'basic') {
    const basic = Buffer.from(key).toString('base64');
    headers['Authorization'] = `Basic ${basic}`;
  } else {
    headers['Authorization'] = `Bearer ${key}`;
    /* Also send as a plain API-key header for gateways that expect one */
    headers['X-SearXNG-API-Key'] = key;
  }

  return headers;
};

export interface SearxngSearchOptions {
  categories?: string[];
  engines?: string[];
  language?: string;
  pageno?: number;
}

interface SearxngSearchResult {
  title: string;
  url: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  content?: string;
  author?: string;
  iframe_src?: string;
}

export const searchSearxng = async (
  query: string,
  opts?: SearxngSearchOptions,
) => {
  const searxngURL = getSearxngURL();

  const url = new URL(`${searxngURL}/search?format=json`);
  url.searchParams.append('q', query);

  if (opts) {
    Object.keys(opts).forEach((key) => {
      const value = opts[key as keyof SearxngSearchOptions];
      if (Array.isArray(value)) {
        url.searchParams.append(key, value.join(','));
        return;
      }
      url.searchParams.append(key, value as string);
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: getSearxngAuthHeaders(searxngURL),
    });

    if (!res.ok) {
      throw new Error(`SearXNG error: ${res.statusText}`);
    }

    const data = await res.json();

    const results: SearxngSearchResult[] = data.results;
    const suggestions: string[] = data.suggestions;

    return { results, suggestions };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('SearXNG search timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};
