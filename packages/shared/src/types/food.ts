/** Public API category (GET /home, GET /categories) */
export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  layoutWidth: '1col' | '2col';
  sortOrder: number;
  isActive: boolean;
}

export interface FoodRating {
  average: number;
  count: number;
}

/** Public food summary (menu, related foods) */
export interface PublicFoodSummary {
  id: string;
  name: string;
  shortDescription: string | null;
  price: number;
  imageUrl: string | null;
  tags: string[];
  rating: FoodRating;
}

/** Public food detail (GET /foods/:id) */
export interface PublicFoodDetail extends PublicFoodSummary {
  categoryId: string;
  description: string | null;
}

export interface FoodTodayAvailability {
  menuItemId: string | null;
  stock: number;
  isAvailable: boolean;
  discountPercent?: number | null;
  salePrice?: number;
}

export interface DailyMenuItemCategory {
  id: string;
  name: string;
  slug: string | null;
}

export interface DailyMenuItem {
  menuItemId: string;
  stock: number;
  discountPercent?: number | null;
  salePrice?: number;
  food: PublicFoodSummary;
  category: DailyMenuItemCategory;
}

/** Admin catalog shape (GET/POST /admin/foods) */
export interface Food {
  id: string;
  categoryId: string;
  name: string;
  shortDescription?: string;
  description: string;
  basePrice: number;
  thumbnailUrl: string;
  tags: string[];
  preparationTime?: number;
  isActive: boolean;
  rating: FoodRating;
  createdAt: string;
  updatedAt: string;
}
