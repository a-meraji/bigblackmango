import { apiClient } from './client';
import type { ApiResponse } from '@types/api';
import type { User } from '@types/auth';

export interface Address {
  id: string;
  label?: string;
  addressLine: string;
  unit?: string;
  postalCode?: string;
  notes?: string;
  isDefault: boolean;
}

export interface UserProfile extends User {
  addresses: Address[];
}

export async function getProfile(): Promise<UserProfile> {
  const res = await apiClient.get<ApiResponse<{ user: UserProfile }>>('/me');
  return res.data.data.user;
}

export async function updateProfile(payload: {
  firstName?: string;
  lastName?: string;
}): Promise<User> {
  const res = await apiClient.patch<ApiResponse<{ user: User }>>('/me', payload);
  return res.data.data.user;
}

export async function getAddresses(): Promise<Address[]> {
  const res = await apiClient.get<ApiResponse<{ addresses: Address[] }>>('/me/addresses');
  return res.data.data.addresses;
}

export async function createAddress(
  payload: Omit<Address, 'id' | 'isDefault'>,
): Promise<Address> {
  const res = await apiClient.post<ApiResponse<{ address: Address }>>('/me/addresses', payload);
  return res.data.data.address;
}
