import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Normalize all API errors to { code, message, details }
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = error.response?.data?.error ?? {
      code: 'UNKNOWN_ERROR',
      message: 'خطای غیرمنتظره‌ای رخ داد.',
      details: [],
    };
    return Promise.reject(apiError);
  },
);
