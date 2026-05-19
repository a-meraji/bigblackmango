const UPLOAD_PATH_PREFIX = '/uploads/';

/**
 * Resolve a stored media reference to a browser-loadable URL.
 * Upload paths are served at /uploads/… (proxied to the API in Vite dev).
 */
export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const { pathname } = new URL(trimmed);
      if (pathname.startsWith(UPLOAD_PATH_PREFIX)) {
        return pathname;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
