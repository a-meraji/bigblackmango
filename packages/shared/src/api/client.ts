import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import { getApiBaseUrl } from './api-config';
import { ensureFreshAccessToken, refreshAccessToken, requireReauth } from './auth-session';
import { getAccessToken } from './token-storage';

const baseURL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const AUTH_FREE_PATHS = [
  '/auth/otp/request',
  '/auth/otp/verify',
  '/auth/refresh',
  '/auth/logout',
];

function isAuthFreeUrl(url?: string): boolean {
  return !!url && AUTH_FREE_PATHS.some((p) => url.includes(p));
}

function shouldSkipReauthOn401(url?: string): boolean {
  return isAuthFreeUrl(url);
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (!isAuthFreeUrl(config.url)) {
    await ensureFreshAccessToken();
  }
  const token = getAccessToken();
  if (token && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as RetriableConfig | undefined;

    const isAuthFree = isAuthFreeUrl(original?.url);

    if (status === 401 && original && !original._retry && !isAuthFree) {
      original._retry = true;

      const outcome = await refreshAccessToken();

      if (outcome.kind === 'success') {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>)['Authorization'] =
          `Bearer ${outcome.accessToken}`;
        return apiClient.request(original);
      }

      if (outcome.kind === 'auth_failed') {
        requireReauth();
      }
    } else if (status === 401 && !shouldSkipReauthOn401(original?.url)) {
      requireReauth();
    }

    const apiError = (error.response?.data as { error?: unknown })?.error ?? {
      code: 'UNKNOWN_ERROR',
      message: 'خطای غیرمنتظره‌ای رخ داد.',
      details: [],
    };
    return Promise.reject(apiError);
  },
);
