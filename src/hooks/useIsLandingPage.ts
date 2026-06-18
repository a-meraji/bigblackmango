import { useSyncExternalStore } from 'react';
import { isInStandaloneMode } from '@hooks/usePwaInstall';

let pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
const listeners = new Set<() => void>();

function notifyPathnameChange() {
  const next = window.location.pathname;
  if (next === pathname) return;
  pathname = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return pathname;
}

function getServerSnapshot() {
  return '/';
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', notifyPathnameChange);

  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args) => {
    originalPushState(...args);
    notifyPathnameChange();
  };

  history.replaceState = (...args) => {
    originalReplaceState(...args);
    notifyPathnameChange();
  };
}

/** True on `/` in browser mode (not installed PWA). Safe inside and outside RouterProvider. */
export function useIsLandingPage(): boolean {
  const currentPath = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return currentPath === '/' && !isInStandaloneMode();
}

/** True on any `/admin` route. Safe inside and outside RouterProvider. */
export function useIsAdminRoute(): boolean {
  const currentPath = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return currentPath.startsWith('/admin');
}
