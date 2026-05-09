export interface FaqItem {
  question: string;
  answer: string;
}

export interface PartyServicePage {
  id: string;
  title: string;
  heroImageUrl: string;
  gallery: string[];
  summary: string;
  description: string;
  serviceItems: string[];
  faq: FaqItem[];
  contactPhone: string;
  isActive: boolean;
}
