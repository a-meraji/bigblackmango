export function getApiBaseUrl(): string {
  const rawBase: string = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
  return rawBase.startsWith('http') || rawBase.startsWith('/')
    ? rawBase
    : `https://${rawBase}`;
}
