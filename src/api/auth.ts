import { apiClient } from './client';
import type { ApiResponse } from '@types/api';
import type {
  OtpRequestPayload,
  OtpRequestResponse,
  OtpVerifyPayload,
  OtpVerifyResponse,
  User,
} from '@types/auth';

export async function requestOtp(payload: OtpRequestPayload): Promise<OtpRequestResponse> {
  const res = await apiClient.post<ApiResponse<OtpRequestResponse>>('/auth/otp/request', payload);
  return res.data.data;
}

export async function verifyOtp(payload: OtpVerifyPayload): Promise<OtpVerifyResponse> {
  const res = await apiClient.post<ApiResponse<OtpVerifyResponse>>('/auth/otp/verify', payload);
  return res.data.data;
}

export async function refreshSession(): Promise<void> {
  await apiClient.post('/auth/refresh');
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<ApiResponse<User>>('/me');
  return res.data.data;
}
