/**
 * Validate an Iranian mobile number.
 * Accepts formats: 09xxxxxxxxx or +989xxxxxxxxx
 */
export function isValidIranianMobile(value: string): boolean {
  return /^(0|\+98)9[0-9]{9}$/.test(value.trim());
}

/**
 * Validate a 6-digit OTP code.
 */
export function isValidOtp(value: string): boolean {
  return /^[0-9]{6}$/.test(value.trim());
}
