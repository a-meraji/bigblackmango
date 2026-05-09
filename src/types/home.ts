import type { Category } from './food';

export interface Story {
  id: string;
  title: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl: string;
  expiresAt: string;
}

export interface PartyServiceBannerSummary {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  servicePageId: string;
}

export interface HomePayload {
  stories: Story[];
  partyServiceBanners: PartyServiceBannerSummary[];
  categories: Category[];
  dailyMenuSummary: {
    menuDate: string;
    expiresAt: string;
  };
}
