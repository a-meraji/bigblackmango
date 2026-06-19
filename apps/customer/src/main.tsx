import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@styles/index.css';

// Register the service worker for the customer PWA only. On /admin we never register it, so
// admin runs as a plain web app with no PWA install, offline, or caching behaviour.
// Kicked off *before* React renders: an active service worker is a precondition for Chrome to
// fire `beforeinstallprompt`, so starting registration as early as possible makes the install
// buttons go live sooner.
if (!window.location.pathname.startsWith('/admin')) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
