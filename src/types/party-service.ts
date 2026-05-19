export interface FaqItem {
  question: string;
  answer: string;
}

export interface ServiceItem {
  title: string;
  description?: string;
}

export interface PartyServiceSummary {
  id: string;
  title: string;
  heroImageUrl: string | null;
  summary: string | null;
  serviceItems: ServiceItem[];
  contactPhone: string | null;
}

export interface PartyServicePage extends PartyServiceSummary {
  gallery: string[];
  description: string | null;
  faq: FaqItem[];
}
