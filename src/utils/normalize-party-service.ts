import type { FaqItem, ServiceItem } from '@types/party-service';

export function normalizeServiceItems(raw: unknown): ServiceItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): ServiceItem | null => {
      if (typeof item === 'string') {
        const title = item.trim();
        return title ? { title } : null;
      }
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>;
        if (typeof o.title === 'string') {
          const title = o.title.trim();
          if (!title) return null;
          const description =
            typeof o.description === 'string' ? o.description.trim() : undefined;
          return description ? { title, description } : { title };
        }
      }
      return null;
    })
    .filter((item): item is ServiceItem => item !== null);
}

export function normalizeFaq(raw: unknown): FaqItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): FaqItem | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;

      if (typeof o.question === 'string' && typeof o.answer === 'string') {
        return { question: o.question, answer: o.answer };
      }

      if (typeof o.title === 'string') {
        return {
          question: o.title,
          answer: typeof o.description === 'string' ? o.description : '',
        };
      }

      return null;
    })
    .filter((item): item is FaqItem => item !== null);
}
