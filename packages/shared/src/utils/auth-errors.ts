import { useAuthStore } from '@store/auth.store';
import type { ApiError } from '@t/api';

export function isAuthError(error: unknown): boolean {
  const code = (error as ApiError)?.code;
  return code === 'UNAUTHORIZED' || code === 'FORBIDDEN';
}

/** Skip error toasts while the inline re-auth modal is handling session recovery. */
export function shouldSuppressAuthToast(error: unknown): boolean {
  if (!isAuthError(error)) return false;
  return useAuthStore.getState().reauthOpen;
}
