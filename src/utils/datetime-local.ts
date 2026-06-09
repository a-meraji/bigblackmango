import { defaultStoryExpiryIso } from './locale';

/** @deprecated Use JalaliDateTimePicker with ISO values instead. */
export function toDatetimeLocalValue(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** @deprecated Use defaultStoryExpiryIso from @utils/locale instead. */
export function defaultStoryExpiryLocal(): string {
  return toDatetimeLocalValue(defaultStoryExpiryIso());
}
