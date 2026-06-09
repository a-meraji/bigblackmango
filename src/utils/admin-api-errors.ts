import type { ApiError } from '@t/api';

export type AdminFormEntity =
  | 'category'
  | 'food'
  | 'story'
  | 'banner'
  | 'highlight'
  | 'partyService'
  | 'serviceItem';

const CONFLICT_MESSAGES: Record<AdminFormEntity, string> = {
  category: 'این نام یا شناسه URL قبلاً ثبت شده است.',
  food: 'این نام قبلاً ثبت شده است.',
  story: 'استوری با این مشخصات قبلاً ثبت شده است.',
  banner: 'بنر با این مشخصات قبلاً ثبت شده است.',
  highlight: 'هایلایت با این مشخصات قبلاً ثبت شده است.',
  partyService: 'سرویس با این مشخصات قبلاً ثبت شده است.',
  serviceItem: 'خدمت با این مشخصات قبلاً ثبت شده است.',
};

const DEFAULT_SAVE_ERROR = 'خطا در ذخیره‌سازی. دوباره تلاش کنید.';

export function getAdminFormErrorMessage(
  error: unknown,
  entity: AdminFormEntity,
): string {
  const apiErr = error as Partial<ApiError>;

  if (apiErr.code === 'CONFLICT') {
    return CONFLICT_MESSAGES[entity];
  }

  if (apiErr.code === 'NOT_FOUND' || apiErr.code === 'INACTIVE_RESOURCE') {
    return 'رکورد مرتبط یافت نشد یا غیرفعال است.';
  }

  if (apiErr.code === 'VALIDATION_ERROR' && apiErr.message?.trim()) {
    return apiErr.message;
  }

  return DEFAULT_SAVE_ERROR;
}
