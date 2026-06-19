import { apiClient } from './client';
import type { ApiResponse } from '@t/api';
import type {
  PartyServicePage,
  PartyServiceSummary,
  ServiceItem,
  ServiceTestimonial,
  ServiceStat,
} from '@t/party-service';
import { normalizeFaq } from '@utils/normalize-party-service';

function toStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === 'string');
}

function mapServiceItem(raw: Record<string, unknown>): ServiceItem {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    description: typeof raw.description === 'string' ? raw.description : null,
    gallery: toStringArray(raw.gallery),
    features: toStringArray(raw.features),
    icon: typeof raw.icon === 'string' ? raw.icon : null,
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : 0,
  };
}

function mapTestimonial(raw: Record<string, unknown>): ServiceTestimonial {
  return {
    id: String(raw.id ?? ''),
    authorName: String(raw.authorName ?? ''),
    role: typeof raw.role === 'string' ? raw.role : null,
    text: String(raw.text ?? ''),
    rating: typeof raw.rating === 'number' ? raw.rating : 5,
    avatarUrl: typeof raw.avatarUrl === 'string' ? raw.avatarUrl : null,
  };
}

function mapStat(raw: Record<string, unknown>): ServiceStat {
  return {
    label: String(raw.label ?? ''),
    value: String(raw.value ?? ''),
    icon: typeof raw.icon === 'string' ? raw.icon : null,
  };
}

function mapPartyServiceSummary(raw: Record<string, unknown>): PartyServiceSummary {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    heroImageUrl: typeof raw.heroImageUrl === 'string' ? raw.heroImageUrl : null,
    summary: typeof raw.summary === 'string' ? raw.summary : null,
    contactPhone: typeof raw.contactPhone === 'string' ? raw.contactPhone : null,
  };
}

function mapPartyServicePage(raw: Record<string, unknown>): PartyServicePage {
  const serviceItemsRaw = Array.isArray(raw.serviceItems) ? raw.serviceItems : [];
  const testimonialsRaw = Array.isArray(raw.testimonials) ? raw.testimonials : [];
  const statsRaw = Array.isArray(raw.stats) ? raw.stats : [];
  const highlightsRaw = Array.isArray(raw.highlights) ? raw.highlights : [];

  return {
    ...mapPartyServiceSummary(raw),
    gallery: toStringArray(raw.gallery),
    description: typeof raw.description === 'string' ? raw.description : null,
    serviceItems: serviceItemsRaw
      .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object')
      .map(mapServiceItem),
    testimonials: testimonialsRaw
      .filter((t): t is Record<string, unknown> => !!t && typeof t === 'object')
      .map(mapTestimonial),
    stats: statsRaw
      .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
      .map(mapStat),
    faq: normalizeFaq(raw.faq),
    highlights: highlightsRaw
      .filter((h): h is Record<string, unknown> => !!h && typeof h === 'object')
      .map((h) => ({
        id: String(h.id ?? ''),
        title: String(h.title ?? ''),
        mediaType: h.mediaType === 'video' ? 'video' as const : 'image' as const,
        mediaUrl: String(h.mediaUrl ?? h.videoUrl ?? ''),
        thumbnailUrl: typeof h.thumbnailUrl === 'string' ? h.thumbnailUrl : null,
      })),
  };
}

export async function getPartyServices(): Promise<PartyServiceSummary[]> {
  const res = await apiClient.get<ApiResponse<Record<string, unknown>[]>>('/party-services');
  return res.data.data.map(mapPartyServiceSummary);
}

export async function getPartyService(serviceId: string): Promise<PartyServicePage> {
  const res = await apiClient.get<ApiResponse<{ service: Record<string, unknown> }>>(
    `/party-services/${serviceId}`,
  );
  return mapPartyServicePage(res.data.data.service);
}
