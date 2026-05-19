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
  const res = await apiClient.get<ApiResponse<UserProfile>>('/me');
  return res.data.data;
}

export async function updateProfile(payload: {
  firstName?: string;
  lastName?: string;
}): Promise<UserProfile> {
  const res = await apiClient.patch<ApiResponse<UserProfile>>('/me', payload);
  return res.data.data;
}

export async function getAddresses(): Promise<Address[]> {
  const res = await apiClient.get<ApiResponse<Address[]>>('/me/addresses');
  return res.data.data;
}

export async function createAddress(payload: Omit<Address, 'id' | 'isDefault'>): Promise<Address> {
  const res = await apiClient.post<ApiResponse<Address>>('/me/addresses', payload);
  return res.data.data;
}
