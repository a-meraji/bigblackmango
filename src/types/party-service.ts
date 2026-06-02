export interface FaqItem {
  question: string;
  answer: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string | null;
  gallery: string[];
  features: string[];
  icon: string | null;
  sortOrder: number;
}

export interface ServiceTestimonial {
  id: string;
  authorName: string;
  role: string | null;
  text: string;
  rating: number;
  avatarUrl: string | null;
}

export interface ServiceStat {
  label: string;
  value: string;
  icon?: string | null;
}

export interface Highlight {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
}

export interface PartyServiceSummary {
  id: string;
  title: string;
  heroImageUrl: string | null;
  summary: string | null;
  contactPhone: string | null;
}

export interface PartyServicePage extends PartyServiceSummary {
  gallery: string[];
  description: string | null;
  serviceItems: ServiceItem[];
  testimonials: ServiceTestimonial[];
  stats: ServiceStat[];
  faq: FaqItem[];
  highlights: Highlight[];
}
