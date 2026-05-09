import { apiClient } from './client';
import type { ApiResponse } from '@types/api';
import type { PartyServicePage } from '@types/party-service';

export async function getPartyServices(): Promise<PartyServicePage[]> {
  const res = await apiClient.get<ApiResponse<{ services: PartyServicePage[] }>>('/party-services');
  return res.data.data.services;
}

export async function getPartyService(serviceId: string): Promise<PartyServicePage> {
  const res = await apiClient.get<ApiResponse<{ service: PartyServicePage }>>(
    `/party-services/${serviceId}`,
  );
  return res.data.data.service;
}
