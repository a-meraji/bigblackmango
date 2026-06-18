import { useSyncExternalStore } from 'react';

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

// ─── Shared install state ─────────────────────────────────────────────────────
// `beforeinstallprompt` fires once, early — often before lazily-loaded components (e.g. the
// landing page) mount. We therefore capture it at module load (this module is in the eager
// entry) into a single shared store, so every usePwaInstall() consumer sees the same deferred
// prompt regardless of when it mounts. A per-instance useEffect listener would miss the event.

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = typeof window !== 'undefined' ? isInStandaloneMode() : false;

interface InstallState {
  isInstallable: boolean;
  isInstalled: boolean;
}
let snapshot: InstallState = { isInstallable: false, isInstalled: installed };

const listeners = new Set<() => void>();

function update(): void {
  snapshot = { isInstallable: deferredPrompt !== null, isInstalled: installed };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): InstallState {
  return snapshot;
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    update();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installed = true;
    update();
  });
}

export async function triggerInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  // The prompt can only be used once.
  deferredPrompt = null;
  update();
  return outcome;
}

export function usePwaInstall() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    isInstallable: state.isInstallable,
    isInstalled: state.isInstalled,
    isIos: isIosSafari(),
    triggerInstall,
  };
}
