import type { FaqItem } from '@types/party-service';

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
  serviceItems: string[];
  faq: FaqItem[];
  contactPhone: string | null;
  isActive: boolean;
}
