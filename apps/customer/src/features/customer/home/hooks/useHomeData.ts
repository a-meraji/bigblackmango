import { useQuery } from '@tanstack/react-query';
import { getHome } from '@api/home';

export function useHomeData() {
  return useQuery({
    queryKey: ['home'],
    queryFn: getHome,
    staleTime: 1000 * 60 * 5, // 5 minutes — home data rarely changes mid-session
  });
}
