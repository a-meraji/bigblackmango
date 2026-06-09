import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FolderTree,
  UtensilsCrossed,
  CalendarDays,
  CirclePlay,
  Image,
  PartyPopper,
  ShoppingBag,
  MessageSquare,
  Bell,
  Smartphone,
  Ticket,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
}

export const ADMIN_NAV_OPERATIONS: AdminNavItem[] = [
  { label: 'داشبورد', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'دسته‌بندی‌ها', path: '/admin/categories', icon: FolderTree },
  { label: 'غذاها', path: '/admin/foods', icon: UtensilsCrossed },
  { label: 'منوی امروز', path: '/admin/daily-menu', icon: CalendarDays },
  { label: 'استوری‌ها و بنرها', path: '/admin/stories', icon: CirclePlay },
  { label: 'بنرهای کیترینگ', path: '/admin/banners', icon: Image },
  { label: 'سرویس‌های کیترینگ', path: '/admin/party-services', icon: PartyPopper },
  { label: 'صفحه لندینگ', path: '/admin/landing', icon: Smartphone },
  { label: 'نوتیفیکیشن‌ها', path: '/admin/notifications', icon: Bell },
];

export const ADMIN_NAV_MANAGEMENT: AdminNavItem[] = [
  { label: 'سفارش‌ها', path: '/admin/orders', icon: ShoppingBag },
  { label: 'کدهای تخفیف', path: '/admin/discount-codes', icon: Ticket },
  { label: 'نظرات', path: '/admin/reviews', icon: MessageSquare },
];

export const ADMIN_PAGE_TITLES: Record<string, string> = {
  '/admin': 'داشبورد',
  '/admin/categories': 'دسته‌بندی‌ها',
  '/admin/foods': 'غذاها',
  '/admin/daily-menu': 'منوی امروز',
  '/admin/stories': 'استوری‌ها و بنرها',
  '/admin/banners': 'بنرهای کیترینگ',
  '/admin/party-services': 'سرویس‌های کیترینگ',
  '/admin/landing': 'صفحه لندینگ',
  '/admin/notifications': 'نوتیفیکیشن‌ها',
  '/admin/orders': 'سفارش‌ها',
  '/admin/discount-codes': 'کدهای تخفیف',
  '/admin/reviews': 'نظرات',
};

export function getAdminPageTitle(pathname: string): string {
  if (ADMIN_PAGE_TITLES[pathname]) return ADMIN_PAGE_TITLES[pathname];
  const match = Object.keys(ADMIN_PAGE_TITLES)
    .filter((p) => p !== '/admin')
    .sort((a, b) => b.length - a.length)
    .find((p) => pathname.startsWith(p));
  return match ? ADMIN_PAGE_TITLES[match] : 'مدیریت';
}
