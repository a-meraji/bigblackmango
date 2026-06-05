import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@store/auth.store';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from './token-storage';

const rawBase: string = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
// Some platforms strip the protocol from env var values (e.g. "example.com/api" instead of "https://example.com/api").
// A bare hostname is not a valid axios baseURL — it gets treated as a relative path.
const baseURL = rawBase.startsWith('http') || rawBase.startsWith('/') ? rawBase : `https://${rawBase}`;

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

const AUTH_FREE_PATHS = ['/auth/otp/request', '/auth/otp/verify', '/auth/refresh'];

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  // Without a stored refresh token we can still try once (same-site cookie flow may have it).
  try {
    const res = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
      `${baseURL}/auth/refresh`,
      refreshToken ? { refreshToken } : {},
      { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
    );
    const data = res.data.data;
    setAuthTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clearAuthTokens();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as RetriableConfig | undefined;

    const isAuthFree =
      !!original?.url && AUTH_FREE_PATHS.some((p) => original.url?.includes(p));

    if (status === 401 && original && !original._retry && !isAuthFree) {
      original._retry = true;

      refreshInFlight = refreshInFlight ?? performRefresh();
      const newToken = await refreshInFlight;
      refreshInFlight = null;

      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        return apiClient.request(original);
      }

      useAuthStore.getState().clearUser();
    } else if (status === 401) {
      useAuthStore.getState().clearUser();
    }

    const apiError = (error.response?.data as { error?: unknown })?.error ?? {
      code: 'UNKNOWN_ERROR',
      message: 'خطای غیرمنتظره‌ای رخ داد.',
      details: [],
    };
    return Promise.reject(apiError);
  },
);
