/** Format ISO date for `<input type="datetime-local" />` in local timezone. */
export function toDatetimeLocalValue(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function defaultStoryExpiryLocal(): string {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return toDatetimeLocalValue(d);
}
