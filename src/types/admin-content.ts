import type { FaqItem, ServiceStat } from '@t/party-service';

export interface AdminStory {
  id: string;
  title: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaType: 'image' | 'video';
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  servicePage: {
    id: string;
    title: string;
    isActive: boolean;
  };
}

export interface AdminPartyServicePage {
  id: string;
  title: string;
  heroImageUrl: string | null;
  gallery: string[];
  summary: string | null;
  description: string | null;
  stats: ServiceStat[];
  faq: FaqItem[];
  contactPhone: string | null;
  isActive: boolean;
}

export interface AdminPartyServiceHighlight {
  id: string;
  servicePageId: string;
  title: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminServiceItem {
  id: string;
  servicePageId: string;
  title: string;
  description: string | null;
  gallery: string[];
  features: string[];
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminServiceTestimonial {
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
}
