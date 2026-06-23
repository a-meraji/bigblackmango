import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@styles/index.css';

// Register the service worker for the customer PWA. Admin is a wholly separate app on its own
// origin (admin.<domain>) — it ships no service worker and shares no scope with this one.
// Kicked off *before* React renders: an active service worker is a precondition for Chrome to
// fire `beforeinstallprompt`, so starting registration as early as possible makes the install
// buttons go live sooner.
import('virtual:pwa-register').then(({ registerSW }) => {
  registerSW({ immediate: true });
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
