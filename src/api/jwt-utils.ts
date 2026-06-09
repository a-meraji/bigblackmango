import { getAccessToken, hasStoredTokens } from './token-storage';

interface JwtPayload {
  exp?: number;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getAccessTokenExpiresAt(): number | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

/** True when access token is missing, unreadable, or expires within bufferMs. */
export function isAccessTokenExpiringSoon(bufferMs: number): boolean {
  const token = getAccessToken();
  if (!token) {
    return hasStoredTokens();
  }
  const expiresAt = getAccessTokenExpiresAt();
  if (!expiresAt) return true;
  return expiresAt - Date.now() <= bufferMs;
}
