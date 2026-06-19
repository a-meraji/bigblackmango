import axios, { AxiosError } from 'axios';

import { useAuthStore } from '@store/auth.store';
import type { ApiError } from '@t/api';

import { getApiBaseUrl } from './api-config';
import { isAccessTokenExpiringSoon } from './jwt-utils';
import {
  clearAuthTokens,
  getRefreshToken,
  hasStoredTokens,
  setAuthTokens,
} from './token-storage';

export type RefreshOutcome =
  | { kind: 'success'; accessToken: string }
  | { kind: 'auth_failed' }
  | { kind: 'transient_failed' };

export const ACCESS_TOKEN_REFRESH_BUFFER_MS = 120_000;

const BOOT_RETRY_DELAYS_MS = [400, 800];

const DEFAULT_REAUTH_MESSAGE = 'نشست شما منقضی شده است. برای ادامه، دوباره وارد شوید.';

let refreshPromise: Promise<RefreshOutcome> | null = null;

export function isDefinitiveAuthFailure(status?: number): boolean {
  return status === 401 || status === 403;
}

function classifyRefreshError(error: unknown): RefreshOutcome {
  const status = (error as AxiosError)?.response?.status;
  if (isDefinitiveAuthFailure(status)) {
    return { kind: 'auth_failed' };
  }
  return { kind: 'transient_failed' };
}

async function doRefresh(): Promise<RefreshOutcome> {
  const refreshToken = getRefreshToken();
  try {
    const res = await axios.post<{
      data: { accessToken: string; refreshToken: string };
    }>(
      `${getApiBaseUrl()}/auth/refresh`,
      refreshToken ? { refreshToken } : {},
      { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
    );
    const data = res.data.data;
    if (!data?.accessToken || !data?.refreshToken) {
      return { kind: 'transient_failed' };
    }
    setAuthTokens(data.accessToken, data.refreshToken);
    return { kind: 'success', accessToken: data.accessToken };
  } catch (error) {
    const outcome = classifyRefreshError(error);
    if (outcome.kind === 'auth_failed') {
      clearAuthTokens();
    }
    return outcome;
  }
}

/** Deduplicated refresh — concurrent 401s share one in-flight request. */
export function refreshAccessToken(): Promise<RefreshOutcome> {
  refreshPromise ??= doRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

/** Refresh before requests when access token is near expiry. */
export async function ensureFreshAccessToken(): Promise<void> {
  if (!hasStoredTokens()) return;

  if (refreshPromise) {
    await refreshPromise;
    return;
  }

  if (!isAccessTokenExpiringSoon(ACCESS_TOKEN_REFRESH_BUFFER_MS)) return;

  const outcome = await refreshAccessToken();
  if (outcome.kind === 'auth_failed') {
    requireReauth();
  }
}

export function logoutSession(): void {
  clearAuthTokens();
  useAuthStore.getState().clearUser();
}

export function requireReauth(message?: string): void {
  clearAuthTokens();
  useAuthStore.getState().openReauth(message ?? DEFAULT_REAUTH_MESSAGE);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isUnauthorizedError(error: unknown): boolean {
  return (error as ApiError)?.code === 'UNAUTHORIZED';
}

/** Boot-time session restore with retries; preserves tokens on transient failure. */
export async function resolveBootSession(): Promise<void> {
  const { setUser, clearUser, setLoading } = useAuthStore.getState();

  if (!hasStoredTokens()) {
    clearUser();
    return;
  }

  const { getMe } = await import('./auth');

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const user = await getMe();
      setUser(user);
      return;
    } catch (error) {
      if (isUnauthorizedError(error)) {
        requireReauth();
        return;
      }
      if (attempt < BOOT_RETRY_DELAYS_MS.length) {
        await sleep(BOOT_RETRY_DELAYS_MS[attempt]!);
      }
    }
  }

  setLoading(false);
}

/** Retry session restore when tokens exist but profile is not loaded. */
export async function tryRecoverSession(): Promise<boolean> {
  const { isAuthenticated, isLoading, setUser, reauthOpen } = useAuthStore.getState();

  if (isLoading || isAuthenticated || reauthOpen || !hasStoredTokens()) {
    return false;
  }

  const { getMe } = await import('./auth');

  try {
    const user = await getMe();
    setUser(user);
    return true;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      requireReauth();
    }
    return false;
  }
}
