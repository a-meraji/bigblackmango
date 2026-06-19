import type { FoodRating } from '@t/food';

/** Admin category row (GET /admin/categories) */
export interface AdminCategory {
  id: string;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  layoutWidth: '1col' | '2col';
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Admin food row (GET /admin/foods) */
export interface AdminFood {
  id: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  imageUrl: string | null;
  tags: string[];
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

/** Optional rating when API adds it later */
export type AdminFoodWithRating = AdminFood & { rating?: FoodRating };

export interface AdminDailyMenuItem {
  id: string;
  foodId: string;
  stock: number;
  discountPercent: number | null;
  salePrice: number;
  isFeaturedInStory: boolean;
  food: {
    id: string;
    name: string;
    price: number;
    isActive: boolean;
    category: {
      id: string;
      name: string;
    };
  };
}

export interface AdminDailyMenu {
  menuDate: string;
  expiresAt: string;
  items: AdminDailyMenuItem[];
}
