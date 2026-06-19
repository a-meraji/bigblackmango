/**
 * Generates a RFC4122-ish unique id that works in BOTH secure and insecure contexts.
 *
 * `crypto.randomUUID()` is only defined in secure contexts (HTTPS or localhost). When the
 * app is served over plain HTTP (e.g. http://<ip>), `crypto.randomUUID` is `undefined` and
 * calling it throws a TypeError. `crypto.getRandomValues()`, however, is available in insecure
 * contexts too, so we fall back to it, and finally to Math.random if crypto is missing entirely.
 */
export function safeRandomId(): string {
  const c = globalThis.crypto;

  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }

  if (c && typeof c.getRandomValues === 'function') {
    const bytes = c.getRandomValues(new Uint8Array(16));
    // Per RFC4122 v4: set version and variant bits.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // Last-resort fallback — not cryptographically strong, but always available.
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 10)}`;
}
