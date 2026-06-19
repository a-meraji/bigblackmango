import { apiClient } from '@api/client';
import type { ApiResponse } from '@t/api';
import type {
  NotificationTemplate,
  NotificationLog,
  NotificationStats,
  CreateTemplatePayload,
  SendNotificationPayload,
} from '@t/notifications';

export async function adminGetNotificationStats(): Promise<NotificationStats> {
  const res = await apiClient.get<ApiResponse<NotificationStats>>(
    '/admin/notifications/stats',
  );
  return res.data.data;
}

export async function adminListTemplates(): Promise<NotificationTemplate[]> {
  const res = await apiClient.get<ApiResponse<NotificationTemplate[]>>(
    '/admin/notifications/templates',
  );
  return res.data.data;
}

export async function adminCreateTemplate(
  payload: CreateTemplatePayload,
): Promise<NotificationTemplate> {
  const res = await apiClient.post<ApiResponse<NotificationTemplate>>(
    '/admin/notifications/templates',
    payload,
  );
  return res.data.data;
}

export async function adminUpdateTemplate(
  id: string,
  payload: Partial<CreateTemplatePayload>,
): Promise<NotificationTemplate> {
  const res = await apiClient.patch<ApiResponse<NotificationTemplate>>(
    `/admin/notifications/templates/${id}`,
    payload,
  );
  return res.data.data;
}

export async function adminDeleteTemplate(id: string): Promise<void> {
  await apiClient.delete(`/admin/notifications/templates/${id}`);
}

export async function adminSendNotification(
  payload: SendNotificationPayload,
): Promise<{ sent: number; failed: number }> {
  const res = await apiClient.post<ApiResponse<{ sent: number; failed: number }>>(
    '/admin/notifications/send',
    payload,
  );
  return res.data.data;
}
