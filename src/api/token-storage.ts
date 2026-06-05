// Cross-site auth needs a token the browser can attach to every request,
// because the backend's cookie is third-party from a different-origin frontend
// (e.g. masoudrazaghi.com -> blackmango.runflare.run) and gets blocked by
// modern browsers regardless of SameSite=None. We keep cookies too, so the
// same-origin frontend keeps working with HttpOnly cookies; the header is the
// cross-origin fallback.

const ACCESS_TOKEN_KEY = 'bm_access_token';
const REFRESH_TOKEN_KEY = 'bm_refresh_token';

function read(key: string): string | null {
  try {
    const value = localStorage.getItem(key);
    // localStorage stringifies undefined to "undefined" — guard against that
    // (catches stale storage from before the bearer-token path existed).
    if (!value || value === 'undefined' || value === 'null') return null;
    return value;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return read(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return read(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(
  accessToken: string | undefined,
  refreshToken: string | undefined,
): void {
  // If backend didn't return tokens (rolling deploy with mixed code, or old
  // backend), do not overwrite storage with "undefined" — keep whatever is
  // there and surface a console warning so the deploy mismatch is visible.
  if (!accessToken || !refreshToken) {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn(
        '[auth] verify/refresh response missing tokens — backend may be running pre-bearer code',
      );
    }
    return;
  }
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    // localStorage unavailable (private mode, quota); cookies still work for same-site.
  }
}

export function clearAuthTokens(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}
