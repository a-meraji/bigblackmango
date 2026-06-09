import { toEnglishDigits } from './locale';

/**
 * Validate an Iranian mobile number.
 * Accepts formats: 09xxxxxxxxx or +989xxxxxxxxx
 */
export function isValidIranianMobile(value: string): boolean {
  return /^(0|\+98)9[0-9]{9}$/.test(toEnglishDigits(value).trim());
}

/**
 * Validate a 6-digit OTP code.
 */
export function isValidOtp(value: string): boolean {
  return /^[0-9]{6}$/.test(toEnglishDigits(value).trim());
}

/** Strip non-digits after normalizing Persian/Arabic digits. */
export function digitsOnly(value: string): string {
  return toEnglishDigits(value).replace(/\D/g, '');
}
