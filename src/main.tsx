import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register the service worker for the customer PWA only. On /admin we never register it, so
// admin runs as a plain web app with no PWA install, offline, or caching behaviour.
if (!window.location.pathname.startsWith('/admin')) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}
