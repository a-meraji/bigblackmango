export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface FoodRating {
  average: number;
  count: number;
}

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

export interface DailyMenuItem {
  menuItemId: string;
  stock: number;
  food: Pick<
    Food,
    'id' | 'name' | 'shortDescription' | 'basePrice' | 'thumbnailUrl' | 'tags' | 'rating'
  >;
}
