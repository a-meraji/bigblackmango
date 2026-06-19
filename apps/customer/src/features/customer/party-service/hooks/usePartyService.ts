import { useQuery } from '@tanstack/react-query';
import { getPartyService } from '@api/party-services';

export function usePartyService(serviceId: string) {
  return useQuery({
    queryKey: ['party-service', serviceId],
    queryFn: () => getPartyService(serviceId),
    enabled: !!serviceId,
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error) => {
      const code = (error as { code?: string })?.code;
      if (code === 'INACTIVE_RESOURCE' || code === 'NOT_FOUND') return false;
      return failureCount < 1;
    },
  });
}
