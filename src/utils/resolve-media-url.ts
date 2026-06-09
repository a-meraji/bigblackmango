const UPLOAD_PATH_PREFIX = '/uploads/';

function getApiOrigin(): string {
  const base: string = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base.startsWith('http://') && !base.startsWith('https://')) return '';
  try {
    return new URL(base).origin;
  } catch {
    return '';
  }
}

const API_ORIGIN = getApiOrigin();

/**
 * Resolve a stored media reference to a browser-loadable URL.
 *
 * Stored values are usually relative `/uploads/…` paths. In dev they're served
 * via the Vite proxy on the same origin; in prod the backend is on a different
 * origin, so we prepend it here. We also normalize any stale absolute URLs
 * (e.g. `http://localhost:3000/uploads/…` written by a backend with APP_URL
 * unset) onto the current API origin so the asset actually loads.
 */
export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const { pathname } = new URL(trimmed);
      if (pathname.startsWith(UPLOAD_PATH_PREFIX)) {
        return API_ORIGIN ? `${API_ORIGIN}${pathname}` : pathname;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return API_ORIGIN ? `${API_ORIGIN}${path}` : path;
}
