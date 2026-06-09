import { format, parse, isValid } from 'date-fns-jalali';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export const TEHRAN_TZ = 'Asia/Tehran';

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Convert Persian/Arabic digits to ASCII (for logic, API, validation). */
export function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (c) => String(PERSIAN_DIGITS.indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String(ARABIC_DIGITS.indexOf(c)));
}

/** Convert ASCII digits to Persian (for UI display). */
export function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** Format a number with Persian digits (replaces toLocaleString('fa-IR')). */
export function formatNumber(n: number, options?: Intl.NumberFormatOptions): string {
  return n.toLocaleString('fa-IR', options);
}

/** Format a string value for display (mobile, tracking codes, postal codes). */
export function formatDigits(value: string): string {
  return toPersianDigits(value);
}

function parseIso(iso: string): Date {
  return new Date(iso);
}

function tehranDateParts(d: Date): { y: number; m: string; day: string } {
  const zoned = toZonedTime(d, TEHRAN_TZ);
  return {
    y: zoned.getFullYear(),
    m: String(zoned.getMonth() + 1).padStart(2, '0'),
    day: String(zoned.getDate()).padStart(2, '0'),
  };
}

/** ISO or ISO date → Gregorian YYYY-MM-DD in Tehran. */
export function isoToGregorianDate(iso: string): string {
  if (!iso) return '';
  const { y, m, day } = tehranDateParts(parseIso(iso));
  return `${y}-${m}-${day}`;
}

/** Gregorian YYYY-MM-DD (Tehran wall date) → ISO UTC. */
export function gregorianDateToIso(dateStr: string, endOfDay = false): string {
  if (!dateStr) return '';
  const time = endOfDay ? '23:59:59' : '00:00:00';
  return fromZonedTime(`${dateStr}T${time}`, TEHRAN_TZ).toISOString();
}

/** ISO → Jalali date string with Persian digits (e.g. ۱۴۰۴/۰۲/۲۸). */
export function isoToJalali(isoDate: string): string {
  if (!isoDate) return '';
  try {
    const zoned = toZonedTime(parseIso(isoDate), TEHRAN_TZ);
    return toPersianDigits(format(zoned, 'yyyy/MM/dd'));
  } catch {
    return '';
  }
}

/** ISO → Jalali date + time with Persian digits. */
export function isoToJalaliWithTime(isoDate: string): string {
  if (!isoDate) return '';
  try {
    const zoned = toZonedTime(parseIso(isoDate), TEHRAN_TZ);
    return toPersianDigits(format(zoned, 'yyyy/MM/dd HH:mm'));
  } catch {
    return '';
  }
}

/** Jalali date string (Persian or ASCII digits) → Gregorian YYYY-MM-DD or null. */
export function jalaliDateToGregorian(jalali: string): string | null {
  const n = toEnglishDigits(jalali).trim();
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(n)) return null;
  try {
    const d = parse(n, 'yyyy/MM/dd', new Date());
    if (!isValid(d)) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return null;
  }
}

/** Gregorian YYYY-MM-DD → Jalali display string (Persian digits). */
export function gregorianDateToJalali(dateStr: string): string {
  if (!dateStr) return '';
  return isoToJalali(gregorianDateToIso(dateStr));
}

export interface JalaliDateTimeParts {
  date: string;
  time: string;
}

/** ISO UTC → Jalali date + time parts for picker (Persian digits). */
export function isoToJalaliDateTimeParts(iso: string): JalaliDateTimeParts {
  if (!iso) return { date: '', time: '' };
  try {
    const zoned = toZonedTime(parseIso(iso), TEHRAN_TZ);
    return {
      date: toPersianDigits(format(zoned, 'yyyy/MM/dd')),
      time: toPersianDigits(format(zoned, 'HH:mm')),
    };
  } catch {
    return { date: '', time: '' };
  }
}

/** Jalali date + time (Tehran) → ISO UTC. */
export function jalaliDateTimeToIso(jalaliDate: string, jalaliTime: string): string | null {
  const gregDate = jalaliDateToGregorian(jalaliDate);
  if (!gregDate) return null;
  const time = toEnglishDigits(jalaliTime).trim();
  if (!/^\d{2}:\d{2}$/.test(time)) return null;
  return fromZonedTime(`${gregDate}T${time}:00`, TEHRAN_TZ).toISOString();
}

/** Default story expiry: 24h from now in Tehran, as ISO. */
export function defaultStoryExpiryIso(): string {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return d.toISOString();
}
