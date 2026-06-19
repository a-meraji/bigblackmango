import { apiClient } from '@api/client';
import type { ApiResponse } from '@t/api';
import type {
  AdminDiscountCode,
  DiscountCodePayload,
} from '@t/discount-code';

export async function adminListDiscountCodes(params?: {
  search?: string;
  isActive?: boolean;
  status?: 'active' | 'expired' | 'all';
}): Promise<AdminDiscountCode[]> {
  const res = await apiClient.get<ApiResponse<AdminDiscountCode[]>>(
    '/admin/discount-codes',
    { params },
  );
  return res.data.data;
}

export async function adminGenerateDiscountCode(): Promise<{ code: string }> {
  const res = await apiClient.post<ApiResponse<{ code: string }>>(
    '/admin/discount-codes/generate',
  );
  return res.data.data;
}

export async function adminCreateDiscountCode(
  payload: DiscountCodePayload,
): Promise<AdminDiscountCode> {
  const res = await apiClient.post<ApiResponse<AdminDiscountCode>>(
    '/admin/discount-codes',
    payload,
  );
  return res.data.data;
}

export async function adminUpdateDiscountCode(
  id: string,
  payload: Partial<DiscountCodePayload>,
): Promise<AdminDiscountCode> {
  const res = await apiClient.patch<ApiResponse<AdminDiscountCode>>(
    `/admin/discount-codes/${id}`,
    payload,
  );
  return res.data.data;
}

export async function adminDeleteDiscountCode(id: string): Promise<AdminDiscountCode> {
  const res = await apiClient.delete<ApiResponse<AdminDiscountCode>>(
    `/admin/discount-codes/${id}`,
  );
  return res.data.data;
}
