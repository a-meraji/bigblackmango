// Cross-site auth needs a token the browser can attach to every request,
// because the backend's cookie is third-party from a different-origin frontend
// (e.g. masoudrazaghi.com -> blackmango.runflare.run) and gets blocked by
// modern browsers regardless of SameSite=None. We keep cookies too, so the
// same-origin frontend keeps working with HttpOnly cookies; the header is the
// cross-origin fallback.

const ACCESS_TOKEN_KEY = 'bm_access_token';
const REFRESH_TOKEN_KEY = 'bm_refresh_token';

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
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
