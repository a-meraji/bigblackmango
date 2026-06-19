import { useSyncExternalStore } from 'react';
import { isInStandaloneMode } from '@hooks/usePwaInstall';

// When the user clicks "ادامه در وب" on the landing page we persist this flag so `/` renders
// the real app experience (categories grid + cart + bottom nav) in a plain browser, and the
// choice survives reloads/navigation. Stored under the codebase-wide `bbm_…` convention.
const WEB_MODE_KEY = 'bbm_continue_on_web';

function readStored(): boolean {
  try {
    return localStorage.getItem(WEB_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

// Module-level shared state (mirrors usePwaInstall / useIsLandingPage). A `useSyncExternalStore`
// store — not React state — because useIsLandingPage must read this synchronously and stay
// reactive across every consumer regardless of mount order.
let chosen = typeof window !== 'undefined' ? readStored() : false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
  // Keep mode in sync if another tab opts in.
  window.addEventListener('storage', (e) => {
    if (e.key !== WEB_MODE_KEY) return;
    chosen = readStored();
    emit();
  });
}

/** Opt into the in-browser app experience. Idempotent. */
export function enableWebAppMode(): void {
  if (chosen) return;
  chosen = true;
  try {
    localStorage.setItem(WEB_MODE_KEY, '1');
  } catch {
    /* private mode / disabled storage — flag still applies for this session */
  }
  emit();
}

export function subscribeWebAppMode(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Non-hook getter for consumers that already run their own `useSyncExternalStore`. */
export function getWebAppModeChosen(): boolean {
  return chosen;
}

/** True when the user explicitly chose to continue in the browser. */
export function useWebAppModeChosen(): boolean {
  return useSyncExternalStore(subscribeWebAppMode, getWebAppModeChosen, () => false);
}

/** True when the full app experience should show: installed PWA OR chose web. */
export function useIsAppMode(): boolean {
  const chosenWeb = useWebAppModeChosen();
  return isInStandaloneMode() || chosenWeb;
}
