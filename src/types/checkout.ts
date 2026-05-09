export interface AddressInput {
  label?: string;
  addressLine: string;
  unit?: string;
  postalCode?: string;
  notes?: string;
}

export interface ContactInput {
  firstName: string;
  lastName: string;
  mobile: string;
}

export interface CheckoutPayload {
  addressId?: string;
  address?: AddressInput;
  contact: ContactInput;
}

export interface CheckoutResponse {
  id: string;
  status: 'pending';
  items: unknown[];
  pricing: { subtotal: number; deliveryFee: number; total: number };
  address: AddressInput;
  contact: ContactInput;
  createdAt: string;
}
