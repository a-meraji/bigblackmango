import { useCallback } from 'react';
import { usePwaInstall } from '@hooks/usePwaInstall';
import { trackLandingEvent } from '../track-landing-event';

export function useLandingInstall() {
  const { isInstallable, isIos, triggerInstall } = usePwaInstall();

  const handleInstallClick = useCallback(
    async (sectionId: string) => {
      trackLandingEvent('install_click', { sectionId });

      if (isIos) {
        const el = document.getElementById('install-ios');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        trackLandingEvent('ios_instructions_view', { sectionId });
        return 'ios' as const;
      }

      const outcome = await triggerInstall();
      if (outcome === 'accepted') {
        trackLandingEvent('install_accepted', { sectionId });
      } else if (outcome === 'dismissed') {
        trackLandingEvent('install_dismissed', { sectionId });
      }
      return outcome;
    },
    [isIos, triggerInstall],
  );

  return { handleInstallClick, isInstallable, isIos };
}
