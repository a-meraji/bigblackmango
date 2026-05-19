import axios from 'axios';
import { useAuthStore } from '@store/auth.store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Normalize all API errors and handle session expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired — clear auth state so RequireAuth guards redirect to /auth/otp
      useAuthStore.getState().clearUser();
    }

    const apiError = error.response?.data?.error ?? {
      code: 'UNKNOWN_ERROR',
      message: 'خطای غیرمنتظره‌ای رخ داد.',
      details: [],
    };
    return Promise.reject(apiError);
  },
);
