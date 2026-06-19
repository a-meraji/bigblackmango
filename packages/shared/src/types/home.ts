import type { Category } from './food';

export interface StoryMenuItemSummary {
  menuItemId: string;
  foodId: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

export interface Story {
  id: string;
  title: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl: string | null;
  expiresAt: string;
  menuItem: StoryMenuItemSummary | null;
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
    expiresAt: string | null;
  };
}
