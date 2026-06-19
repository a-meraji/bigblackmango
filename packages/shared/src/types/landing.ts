import type { PartyServiceBannerSummary } from '@t/home';
import type { FaqItem, ServiceStat, ServiceTestimonial } from '@t/party-service';
import type { PublicFoodSummary } from '@t/food';

export interface LandingHero {
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  badge: string;
  trustLine: string;
}

export interface LandingSocialStrip {
  items: string[];
}

export interface LandingCardItem {
  icon: string | null;
  title: string;
  body: string;
}

export interface LandingFoodShowcase {
  sectionTitle: string;
  sectionIcon: string | null;
  lead: string;
}

export interface LandingValueProps {
  sectionTitle: string;
  items: LandingCardItem[];
}

export interface LandingHowItWorks {
  sectionTitle: string;
  steps: LandingCardItem[];
}

export interface LandingPartySection {
  title: string;
  caption: string;
}

export interface LandingTestimonial {
  authorName: string;
  role: string | null;
  text: string;
  rating: number;
  avatarUrl: string | null;
}

export interface LandingLink {
  label: string;
  href: string;
}

export interface LandingFinalCta {
  title: string;
  subtitle: string;
  trustItems: string[];
  links: LandingLink[];
}

export interface LandingFooterContent {
  brandName: string;
  tagline: string;
  phone: string;
  address: string;
  hours: string;
  quickLinks: LandingLink[];
}

export interface LandingPayload {
  hero: LandingHero;
  socialStrip: LandingSocialStrip;
  stats: ServiceStat[];
  faq: FaqItem[];
  foodShowcase: LandingFoodShowcase;
  valueProps: LandingValueProps;
  howItWorks: LandingHowItWorks;
  partySection: LandingPartySection;
  testimonials: ServiceTestimonial[];
  testimonialsSectionTitle: string;
  trustSectionTitle: string;
  finalCta: LandingFinalCta;
  footer: LandingFooterContent;
  partyServiceBanners: PartyServiceBannerSummary[];
  featuredFoods: PublicFoodSummary[];
}

export interface AdminLandingPage {
  id: string;
  heroTitle: string;
  heroSubtitle: string | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  heroBadge: string;
  heroTrustLine: string;
  stats: ServiceStat[];
  faq: FaqItem[];
  socialStrip: LandingSocialStrip;
  foodShowcase: LandingFoodShowcase & { featuredFoodIds: string[] };
  valueProps: LandingValueProps;
  howItWorks: LandingHowItWorks;
  partySection: LandingPartySection;
  testimonials: LandingTestimonial[];
  testimonialsSectionTitle: string;
  trustSectionTitle: string;
  finalCta: LandingFinalCta;
  footer: LandingFooterContent;
  isActive: boolean;
  updatedAt: string;
}

export interface UpdateLandingPayload {
  heroTitle: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  heroBadge?: string;
  heroTrustLine?: string;
  stats?: ServiceStat[];
  faq?: FaqItem[];
  socialStrip?: LandingSocialStrip;
  foodShowcase?: LandingFoodShowcase & { featuredFoodIds?: string[] };
  valueProps?: LandingValueProps;
  howItWorks?: LandingHowItWorks;
  partySection?: LandingPartySection;
  testimonials?: LandingTestimonial[];
  testimonialsSectionTitle?: string;
  trustSectionTitle?: string;
  finalCta?: LandingFinalCta;
  footer?: LandingFooterContent;
  isActive?: boolean;
}
