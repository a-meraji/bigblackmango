export interface GuestCartFoodSnapshot {
  id: string;
  name: string;
  thumbnailUrl: string | null;
}

export interface GuestCartStoredItem {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  food: GuestCartFoodSnapshot;
}

export interface GuestCartStorage {
  items: GuestCartStoredItem[];
}

export interface GuestCartItemInput {
  menuItemId: string;
  unitPrice: number;
  food: GuestCartFoodSnapshot;
}
