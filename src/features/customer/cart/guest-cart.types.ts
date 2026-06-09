export interface GuestCartFoodSnapshot {
  id: string;
  name: string;
  thumbnailUrl: string | null;
}

export interface GuestCartStoredItem {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice?: number;
  menuDiscountPercent?: number | null;
  food: GuestCartFoodSnapshot;
}

export interface GuestCartStorage {
  items: GuestCartStoredItem[];
}

export interface GuestCartItemInput {
  menuItemId: string;
  unitPrice: number;
  originalUnitPrice?: number;
  menuDiscountPercent?: number | null;
  food: GuestCartFoodSnapshot;
}
