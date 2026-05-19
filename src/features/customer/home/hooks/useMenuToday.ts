import { useQuery } from '@tanstack/react-query';
import { getMenuToday } from '@api/menu';

export function useMenuToday(categoryId?: string) {
  return useQuery({
    queryKey: ['menu', 'today', categoryId ?? 'all'],
    queryFn: () => getMenuToday({ categoryId }),
    staleTime: 1000 * 60 * 2, // 2 minutes — menu availability can change
  });
}
