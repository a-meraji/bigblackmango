import { format } from 'date-fns-jalali';

/**
 * Format an ISO date string to Jalali date (e.g. ۱۴۰۴/۰۲/۲۸).
 */
export function toJalali(isoDate: string): string {
  return format(new Date(isoDate), 'yyyy/MM/dd');
}

/**
 * Format an ISO date string to Jalali date + time (e.g. ۱۴۰۴/۰۲/۲۸ ۱۴:۳۰).
 */
export function toJalaliWithTime(isoDate: string): string {
  return format(new Date(isoDate), 'yyyy/MM/dd HH:mm');
}
