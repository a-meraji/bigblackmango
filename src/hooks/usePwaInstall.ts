import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) && /webkit/i.test(ua) && !/crios|fxios/i.test(ua);
}

export function isInStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isInStandaloneMode());

  useEffect(() => {
    if (isInStandaloneMode()) {
      setIsInstalled(true);
      return;
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    }

    function onAppInstalled() {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  async function triggerInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') setIsInstallable(false);
    return outcome;
  }

  return { isInstallable, isInstalled, isIos: isIosSafari(), triggerInstall };
}
