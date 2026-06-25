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

// After page load, Chrome needs a moment (service-worker install + engagement heuristics) before
// it fires `beforeinstallprompt` — longer on slow connections. Until then install CTAs stay
// hidden, so the user only ever sees an install button once the app is actually installable. If
// the event still hasn't arrived after this grace window (Firefox, in-app browsers, desktop
// without the heuristic), we reveal the CTAs anyway so a click can fall back to manual install
// instructions rather than the button never appearing.
const INSTALL_READY_GRACE_MS = 5000;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = typeof window !== 'undefined' ? isInStandaloneMode() : false;
let graceElapsed = false;

interface InstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  graceElapsed: boolean;
}
let snapshot: InstallState = {
  isInstallable: false,
  isInstalled: installed,
  graceElapsed: false,
};

const listeners = new Set<() => void>();
// Resolvers waiting for a *late* `beforeinstallprompt`. The event is gated behind Chrome's
// install-criteria + engagement heuristics, so it frequently fires a second or two after the
// page (and the install button) is already interactive. Anyone who clicks during that window
// parks a resolver here instead of failing instantly — see `waitForPrompt` / `triggerInstall`.
const promptWaiters = new Set<(available: boolean) => void>();

function update(): void {
  snapshot = { isInstallable: deferredPrompt !== null, isInstalled: installed, graceElapsed };
  listeners.forEach((listener) => listener());
  if (deferredPrompt) {
    promptWaiters.forEach((resolve) => resolve(true));
    promptWaiters.clear();
  }
}

// Resolves `true` as soon as a deferred prompt is available, or `false` after `timeoutMs`.
function waitForPrompt(timeoutMs: number): Promise<boolean> {
  if (deferredPrompt) return Promise.resolve(true);
  if (installed || timeoutMs <= 0) return Promise.resolve(false);
  return new Promise((resolve) => {
    const settle = (available: boolean) => {
      promptWaiters.delete(settle);
      clearTimeout(timer);
      resolve(available);
    };
    const timer = setTimeout(() => settle(false), timeoutMs);
    promptWaiters.add(settle);
  });
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
  // Fallback so install CTAs don't stay in "preparing" forever where no prompt ever fires.
  if (!installed) {
    setTimeout(() => {
      graceElapsed = true;
      update();
    }, INSTALL_READY_GRACE_MS);
  }
}

export async function triggerInstall(
  waitMs = 0,
): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  // The button is clickable before `beforeinstallprompt` fires; rather than no-op, give the
  // event a short grace period to arrive. Calling `.prompt()` on a deferred event does not
  // require fresh user activation in Chrome, so waiting here is safe.
  if (!deferredPrompt && waitMs > 0) await waitForPrompt(waitMs);
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
  const isIos = isIosSafari();
  // An install CTA should be shown once the app is actually installable: the native prompt is
  // captured, or it's iOS (manual flow — no prompt to wait for), or the grace window has elapsed
  // (manual fallback). Already-installed users never see CTAs.
  const isInstallReady = !state.isInstalled && (state.isInstallable || isIos || state.graceElapsed);
  return {
    isInstallable: state.isInstallable,
    isInstalled: state.isInstalled,
    isInstallReady,
    isIos,
    triggerInstall,
  };
}
