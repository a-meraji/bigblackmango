import { useCallback } from 'react';
import { usePwaInstall } from '@hooks/usePwaInstall';
import { toast } from '@store/toast.store';
import { trackLandingEvent } from '../track-landing-event';

// How long a click waits for a late `beforeinstallprompt` before falling back to manual
// instructions. Chrome usually fires it within ~1–2s of the page becoming interactive.
const PROMPT_WAIT_MS = 3000;

function scrollToInstallHelp() {
  const el = document.getElementById('install-ios') ?? document.getElementById('section-final-cta');
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function useLandingInstall() {
  const { isInstallable, isIos, triggerInstall } = usePwaInstall();

  const handleInstallClick = useCallback(
    async (sectionId: string) => {
      trackLandingEvent('install_click', { sectionId });

      if (isIos) {
        scrollToInstallHelp();
        trackLandingEvent('ios_instructions_view', { sectionId });
        return 'ios' as const;
      }

      const outcome = await triggerInstall(PROMPT_WAIT_MS);
      if (outcome === 'accepted') {
        trackLandingEvent('install_accepted', { sectionId });
      } else if (outcome === 'dismissed') {
        trackLandingEvent('install_dismissed', { sectionId });
      } else {
        // The native prompt never became available (engagement criteria not met yet, an
        // in-app/Firefox browser, or already installed). Never leave the click as a silent
        // no-op: point the user at the manual install help and tell them what to do.
        trackLandingEvent('install_unavailable', { sectionId });
        scrollToInstallHelp();
        toast.info('برای نصب، گزینه «افزودن به صفحه اصلی» را از منوی مرورگر انتخاب کنید');
      }
      return outcome;
    },
    [isIos, triggerInstall],
  );

  return { handleInstallClick, isInstallable, isIos };
}
