import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// Admin is a plain SPA: NO vite-plugin-pwa, no service worker, no manifest. Served at the
// admin subdomain root (base '/'), it proxies its own /api + /uploads to the shared backend
// in dev — mirroring the nginx self-proxy in production (same-origin → zero CORS).
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      // App-local code
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      // Shared platform (@blackmango/shared) — consumed from source
      '@components': path.resolve(__dirname, '../../packages/shared/src/components'),
      '@api': path.resolve(__dirname, '../../packages/shared/src/api'),
      '@store': path.resolve(__dirname, '../../packages/shared/src/store'),
      '@hooks': path.resolve(__dirname, '../../packages/shared/src/hooks'),
      '@t': path.resolve(__dirname, '../../packages/shared/src/types'),
      '@utils': path.resolve(__dirname, '../../packages/shared/src/utils'),
      '@styles': path.resolve(__dirname, '../../packages/shared/src/styles'),
      '@assets': path.resolve(__dirname, '../../packages/shared/src/assets'),
      '@constants': path.resolve(__dirname, '../../packages/shared/src/constants'),
      '@query-client': path.resolve(__dirname, '../../packages/shared/src/query-client.ts'),
    },
  },
  server: {
    port: Number(process.env.ADMIN_PORT ?? 3002),
    strictPort: false,
    // Trust the *.localhost hosts the dev host-router (scripts/dev.mjs) routes on. When run
    // through that proxy, bind IPv4 (the proxy dials 127.0.0.1) and point HMR back at the
    // proxy port so live-reload works on the subdomain.
    allowedHosts: ['admin.localhost', 'localhost'],
    ...(process.env.DEV_PROXY_PORT
      ? { host: '127.0.0.1', hmr: { clientPort: Number(process.env.DEV_PROXY_PORT) } }
      : {}),
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
