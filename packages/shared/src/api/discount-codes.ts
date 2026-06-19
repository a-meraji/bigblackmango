import { apiClient } from '@api/client';
import type { ApiResponse } from '@t/api';
import type { DiscountValidationResult } from '@t/discount-code';

export async function validateDiscountCode(
  code: string,
): Promise<DiscountValidationResult> {
  const res = await apiClient.post<ApiResponse<DiscountValidationResult>>(
    '/discount-codes/validate',
    { code },
  );
  return res.data.data;
}
