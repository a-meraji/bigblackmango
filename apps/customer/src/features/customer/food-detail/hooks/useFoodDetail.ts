import { useQuery } from '@tanstack/react-query';
import { getFoodDetail } from '@api/foods';

export function useFoodDetail(foodId: string) {
  return useQuery({
    queryKey: ['food', foodId],
    queryFn: () => getFoodDetail(foodId),
    enabled: !!foodId,
    staleTime: 1000 * 60 * 3,
    retry: (failureCount, error) => {
      const code = (error as { code?: string })?.code;
      if (code === 'INACTIVE_RESOURCE' || code === 'NOT_FOUND') return false;
      return failureCount < 1;
    },
  });
}
