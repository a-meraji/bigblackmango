import type { LandingPayload } from '@t/landing';

export const LANDING_FALLBACK: LandingPayload = {
  hero: {
    title: 'بلک منگو — غذای روز + پذیرایی مجالس',
    subtitle: 'منوی ناهار هر روز · تحویل سریع · پذیرایی VIP مجالس',
    imageUrl: null,
    imageAlt: 'بلک منگو',
    badge: 'اپ رسمی بلک منگو',
    trustLine: 'بدون نیاز به فضای زیاد · نصب در ۱۰ ثانیه',
  },
  socialStrip: {
    items: ['۱۲,۰۰۰+ سفارش', '۳۵۰+ مجلس', '۴.۹ امتیاز'],
  },
  stats: [
    { label: 'سفارش تحویل‌شده', value: '۱۲,۰۰۰+', icon: 'ShoppingBag' },
    { label: 'مجلس و رویداد', value: '۳۵۰+', icon: 'PartyPopper' },
    { label: 'سال تجربه', value: '۸+', icon: 'Award' },
  ],
  faq: [
    {
      question: 'چطور اپ را نصب کنم؟',
      answer:
        'در اندروید روی «نصب رایگان اپ» بزن. در آیفون از دکمه اشتراک‌گذاری → «افزودن به صفحه اصلی» استفاده کن.',
    },
    {
      question: 'آیا رایگان است؟',
      answer: 'بله، نصب و استفاده کاملاً رایگان است.',
    },
    {
      question: 'پرداخت امن است؟',
      answer: 'پرداخت از طریق درگاه بانکی معتبر با رمزگذاری SSL انجام می‌شود.',
    },
    {
      question: 'فقط ناهار است یا پذیرایی مجالس هم دارید؟',
      answer: 'هر دو؛ منوی روزانه و سرویس VIP پذیرایی مجالس.',
    },
    {
      question: 'بدون نصب می‌توانم سفارش بدهم؟',
      answer: 'برای بهترین تجربه و پیگیری سفارش، نصب اپ توصیه می‌شود.',
    },
  ],
  foodShowcase: {
    sectionTitle: 'طعم‌های محبوب ما',
    sectionIcon: 'ChefHat',
    lead: 'غذاهای تازه و خوشمزه — برای دیدن منوی کامل و سفارش، اپ را نصب کن',
  },
  valueProps: {
    sectionTitle: 'چرا اپ بلک منگو؟',
    items: [
      {
        icon: 'Bell',
        title: 'نوتیف منوی روزانه',
        body: 'هر روز ساعت ۱۰:۳۰ منوی ناهار مستقیم روی گوشیت',
      },
      {
        icon: 'Zap',
        title: 'باز شدن فوری',
        body: 'مثل اپ اصلی — بدون باز کردن مرورگر',
      },
      {
        icon: 'Smartphone',
        title: 'بدون فضای اضافه',
        body: 'نصب سبک PWA — بدون دانلود از استور (فعلاً)',
      },
    ],
  },
  howItWorks: {
    sectionTitle: '۳ قدم تا سفارش',
    steps: [
      {
        icon: 'Download',
        title: 'اپ را نصب کن',
        body: 'از مرورگر گزینه نصب را بزن — کمتر از ۱۰ ثانیه',
      },
      {
        icon: 'UtensilsCrossed',
        title: 'منوی امروز را ببین',
        body: 'غذاها را انتخاب کن و به سبد اضافه کن',
      },
      {
        icon: 'CreditCard',
        title: 'سفارش بده و پرداخت کن',
        body: 'تحویل در محل · پیگیری لحظه‌ای',
      },
    ],
  },
  partySection: {
    title: 'پذیرایی و مجالس',
    caption: 'سفارش VIP برای رویدادهای خاص',
  },
  testimonials: [],
  testimonialsSectionTitle: 'رضایت مشتریان',
  trustSectionTitle: 'اعتماد شما',
  finalCta: {
    title: 'همین الان نصب کن',
    subtitle: 'همه منو و سفارش در یک اپ',
    trustItems: ['نصب رایگان', 'بدون فضای اضافه', 'پشتیبانی فارسی', 'پرداخت امن'],
    links: [],
  },
  footer: {
    brandName: 'بلک منگو',
    tagline: 'غذای روز + پذیرایی VIP مجالس',
    phone: '02191000000',
    address: 'تهران، خیابان ولیعصر، بالاتر از پارک ساعی',
    hours: 'منوی ناهار: هر روز ۱۰ تا ۱۵ · پذیرایی مجالس: تماس بگیرید',
    quickLinks: [
      { label: 'نحوه نصب', href: '#how-it-works-title' },
      { label: 'سوالات متداول', href: '#landing-faq' },
      { label: 'نصب اپ', href: '#section-final-cta' },
    ],
  },
  partyServiceBanners: [],
  featuredFoods: [],
};

export function mergeLandingWithFallback(
  data: LandingPayload | undefined,
): LandingPayload {
  if (!data) return LANDING_FALLBACK;
  return {
    ...LANDING_FALLBACK,
    ...data,
    hero: { ...LANDING_FALLBACK.hero, ...data.hero },
    socialStrip: {
      items:
        data.socialStrip.items.length > 0
          ? data.socialStrip.items
          : LANDING_FALLBACK.socialStrip.items,
    },
    stats: data.stats.length > 0 ? data.stats : LANDING_FALLBACK.stats,
    faq: data.faq.length > 0 ? data.faq : LANDING_FALLBACK.faq,
    foodShowcase: { ...LANDING_FALLBACK.foodShowcase, ...data.foodShowcase },
    valueProps: {
      sectionTitle: data.valueProps.sectionTitle || LANDING_FALLBACK.valueProps.sectionTitle,
      items:
        data.valueProps.items.length > 0
          ? data.valueProps.items
          : LANDING_FALLBACK.valueProps.items,
    },
    howItWorks: {
      sectionTitle: data.howItWorks.sectionTitle || LANDING_FALLBACK.howItWorks.sectionTitle,
      steps:
        data.howItWorks.steps.length > 0
          ? data.howItWorks.steps
          : LANDING_FALLBACK.howItWorks.steps,
    },
    partySection: { ...LANDING_FALLBACK.partySection, ...data.partySection },
    finalCta: {
      ...LANDING_FALLBACK.finalCta,
      ...data.finalCta,
      trustItems:
        data.finalCta.trustItems.length > 0
          ? data.finalCta.trustItems
          : LANDING_FALLBACK.finalCta.trustItems,
    },
    footer: {
      ...LANDING_FALLBACK.footer,
      ...data.footer,
      quickLinks:
        data.footer.quickLinks.length > 0
          ? data.footer.quickLinks
          : LANDING_FALLBACK.footer.quickLinks,
    },
    featuredFoods: data.featuredFoods ?? LANDING_FALLBACK.featuredFoods,
    testimonials: data.testimonials ?? LANDING_FALLBACK.testimonials,
    testimonialsSectionTitle:
      data.testimonialsSectionTitle || LANDING_FALLBACK.testimonialsSectionTitle,
    trustSectionTitle: data.trustSectionTitle || LANDING_FALLBACK.trustSectionTitle,
  };
}
