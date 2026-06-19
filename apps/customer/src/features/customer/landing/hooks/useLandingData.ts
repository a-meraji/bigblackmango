import { useQuery } from '@tanstack/react-query';
import { getLanding } from '@api/landing';

export function useLandingData() {
  return useQuery({
    queryKey: ['landing'],
    queryFn: getLanding,
    staleTime: 1000 * 60 * 5,
  });
}
