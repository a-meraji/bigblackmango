export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  mobile: string;
  role: UserRole;
}

export interface OtpRequestPayload {
  mobile: string;
}

export interface OtpRequestResponse {
  otpExpiresInSeconds: number;
  retryAfterSeconds: number;
}

export interface OtpVerifyPayload {
  mobile: string;
  code: string;
}

export interface OtpVerifyResponse {
  user: User;
  profileCompleted: boolean;
}
