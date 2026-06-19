import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@t/api';
import type { AdminServiceTestimonial } from '@t/admin-content';

export interface TestimonialPayload {
  servicePageId: string;
  authorName: string;
  role?: string;
  text: string;
  rating?: number;
  avatarUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

type RawTestimonial = {
  id: string;
  servicePageId: string;
  authorName: string;
  role: string | null;
  text: string;
  rating: number;
  avatarUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

function mapTestimonial(raw: RawTestimonial): AdminServiceTestimonial {
  return {
    id: raw.id,
    servicePageId: raw.servicePageId,
    authorName: raw.authorName,
    role: raw.role,
    text: raw.text,
    rating: raw.rating,
    avatarUrl: raw.avatarUrl,
    sortOrder: raw.sortOrder,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
  };
}

export async function adminListTestimonials(
  servicePageId: string,
): Promise<AdminServiceTestimonial[]> {
  const res = await apiClient.get<
    ApiResponse<{ items: RawTestimonial[]; meta: PaginationMeta }>
  >('/admin/testimonials', {
    params: { servicePageId, limit: 100 },
  });
  return res.data.data.items.map(mapTestimonial);
}

export async function adminCreateTestimonial(
  payload: TestimonialPayload,
): Promise<AdminServiceTestimonial> {
  const res = await apiClient.post<ApiResponse<{ testimonial: RawTestimonial }>>(
    '/admin/testimonials',
    payload,
  );
  return mapTestimonial(res.data.data.testimonial);
}

export async function adminUpdateTestimonial(
  id: string,
  payload: Partial<Omit<TestimonialPayload, 'servicePageId'>>,
): Promise<AdminServiceTestimonial> {
  const res = await apiClient.patch<ApiResponse<{ testimonial: RawTestimonial }>>(
    `/admin/testimonials/${id}`,
    payload,
  );
  return mapTestimonial(res.data.data.testimonial);
}

export async function adminDeleteTestimonial(id: string): Promise<void> {
  await apiClient.delete(`/admin/testimonials/${id}`);
}
