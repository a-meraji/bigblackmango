import { apiClient } from './client';
import { clearAuthTokens, getRefreshToken, setAuthTokens } from './token-storage';
import type { ApiResponse } from '@t/api';
import type {
  OtpRequestPayload,
  OtpRequestResponse,
  OtpVerifyPayload,
  OtpVerifyResponse,
  RefreshSessionResponse,
  User,
} from '@t/auth';

export async function requestOtp(payload: OtpRequestPayload): Promise<OtpRequestResponse> {
  const res = await apiClient.post<ApiResponse<OtpRequestResponse>>('/auth/otp/request', payload);
  return res.data.data;
}

export async function verifyOtp(payload: OtpVerifyPayload): Promise<OtpVerifyResponse> {
  const res = await apiClient.post<ApiResponse<OtpVerifyResponse>>('/auth/otp/verify', payload);
  const data = res.data.data;
  setAuthTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function refreshSession(): Promise<RefreshSessionResponse> {
  const refreshToken = getRefreshToken() ?? undefined;
  const res = await apiClient.post<ApiResponse<RefreshSessionResponse>>(
    '/auth/refresh',
    refreshToken ? { refreshToken } : {},
  );
  const data = res.data.data;
  setAuthTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    clearAuthTokens();
  }
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<ApiResponse<User>>('/me');
  return res.data.data;
}
