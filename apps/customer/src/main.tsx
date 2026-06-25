import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@styles/index.css';

// The service worker is registered from an inline <head> script in index.html so it starts
// downloading in parallel with this bundle (see index.html). Admin is a wholly separate app on
// its own origin and ships no service worker.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
