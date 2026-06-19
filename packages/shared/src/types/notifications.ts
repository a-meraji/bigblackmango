export interface NotificationTemplate {
  id: string;
  key: string;
  title: string;
  body: string;
  icon: string | null;
  badge: string | null;
  actionUrl: string | null;
  actionLabel: string | null;
  tag: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  templateId: string | null;
  title: string;
  body: string;
  totalSent: number;
  totalFailed: number;
  sentAt: string;
}

export interface NotificationStats {
  activeSubscriptions: number;
  recentNotifications: NotificationLog[];
}

export interface CreateTemplatePayload {
  key: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  actionUrl?: string;
  actionLabel?: string;
  tag?: string;
  isActive?: boolean;
}

export interface SendNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  actionUrl?: string;
  actionLabel?: string;
  tag?: string;
  templateId?: string;
}
