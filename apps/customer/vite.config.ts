import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';

/**
 * Dependency-free build-time precompression. Emits `.gz` (gzip) and `.br` (brotli) siblings
 * for compressible text assets so nginx can serve them via `gzip_static`/`brotli_static`
 * without spending CPU at request time. woff2/png/ico are already compressed → skipped.
 */
function precompress(): Plugin {
  const COMPRESSIBLE = /\.(?:js|css|html|svg|json|webmanifest)$/;
  const MIN_BYTES = 1024;

  function walk(dir: string, out: string[] = []): string[] {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, out);
      else if (COMPRESSIBLE.test(entry.name)) out.push(full);
    }
    return out;
  }

  return {
    name: 'bbm-precompress',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(outDir)) return;
      for (const file of walk(outDir)) {
        const buf = fs.readFileSync(file);
        if (buf.byteLength < MIN_BYTES) continue;
        fs.writeFileSync(`${file}.gz`, zlib.gzipSync(buf, { level: 9 }));
        fs.writeFileSync(
          `${file}.br`,
          zlib.brotliCompressSync(buf, {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
              [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.byteLength,
            },
          }),
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      // The PWA is the customer app only. We register the service worker manually in main.tsx
      // and skip it entirely on /admin, so admin stays a plain web app (see main.tsx).
      injectRegister: false,
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'بلک منگو',
        short_name: 'منگو',
        description: 'منوی روزانه و سفارش غذا',
        theme_color: '#C97645',
        background_color: '#FBF7EF',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'fa',
        dir: 'rtl',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
          { src: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
          { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-256.png', sizes: '256x256', type: 'image/png' },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          { src: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
          { src: 'favicon.ico', sizes: '64x64 48x48 32x32 16x16', type: 'image/x-icon' },
        ],
      },
      injectManifest: {
        // Precache exactly the customer app shell: HTML, the entry chunk + its only static
        // chunk import (vendor), the entry CSS, the font, and icons. Every other route/
        // component chunk is fetched and runtime-cached on demand (see sw.ts), so the PWA
        // install payload stays minimal. This build contains customer code only.
        globPatterns: [
          'index.html',
          'manifest.webmanifest',
          'assets/index-*.js',
          'assets/index-*.css',
          'assets/vendor-*.js',
          '**/*.woff2',
        ],
      },
    }),
    precompress(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Stable libraries shared across the customer app. Bundled into one vendor chunk
          // that's precached and long-cached.
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@tanstack[\\/]react-query|zustand|axios|clsx|lucide-react|date-fns-jalali|date-fns-tz)[\\/]/.test(
              id,
            )
          ) {
            return 'vendor';
          }
        },
      },
    },
  },
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
    port: Number(process.env.CUSTOMER_PORT ?? 3001),
    strictPort: false,
    // Trust the *.localhost hosts the dev host-router (scripts/dev.mjs) routes on. When run
    // through that proxy, bind IPv4 (the proxy dials 127.0.0.1) and point HMR back at the
    // proxy port so live-reload works behind it.
    allowedHosts: ['app.localhost', 'localhost'],
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
