#!/usr/bin/env node
// Local dev host-router — mirrors the production subdomain split on one machine.
//
// Production serves two SEPARATE apps on two hosts:
//   admin.<domain>  -> admin SPA      (apps/admin,    dist served by its own nginx block)
//   <domain>        -> customer PWA   (apps/customer, dist served by the apex nginx block)
//
// Vite's dev server serves ONE app per port regardless of the Host header, so opening
// `admin.localhost:<port>` against the customer dev server just renders the customer home
// page — exactly the "admin shows the home page" symptom. This script spawns BOTH Vite dev
// servers and a tiny Host-based reverse proxy so the same subdomain routing works locally:
//
//   http://admin.localhost:8080  -> admin app    (Vite :3002)
//   http://localhost:8080        -> customer app (Vite :3001)
//   http://app.localhost:8080    -> customer app (alias)
//
// `*.localhost` resolves to 127.0.0.1 in all modern browsers, so no /etc/hosts edits needed.
// Zero dependencies — pure Node http/net.
import { spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';

const PROXY_PORT = Number(process.env.DEV_PROXY_PORT ?? 8080);
const CUSTOMER_PORT = Number(process.env.CUSTOMER_PORT ?? 3001);
const ADMIN_PORT = Number(process.env.ADMIN_PORT ?? 3002);

// Tell each Vite server (a) which port the browser really talks to, so HMR websockets are
// pointed back through this proxy, and (b) to trust the *.localhost hosts we route on.
const childEnv = {
  ...process.env,
  DEV_PROXY_PORT: String(PROXY_PORT),
  CUSTOMER_PORT: String(CUSTOMER_PORT),
  ADMIN_PORT: String(ADMIN_PORT),
};

const children = [];
function run(name, args) {
  const child = spawn('npm', args, { stdio: 'inherit', env: childEnv });
  child.on('exit', (code) => {
    console.error(`[dev] ${name} exited (${code}); shutting down.`);
    shutdown(code ?? 1);
  });
  children.push(child);
}

function shutdown(code = 0) {
  for (const c of children) c.kill('SIGTERM');
  process.exit(code);
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

run('customer', ['run', 'dev', '-w', '@blackmango/customer']);
run('admin', ['run', 'dev', '-w', '@blackmango/admin']);

const hostOf = (h = '') => h.split(':')[0].toLowerCase();
const portFor = (h) => (hostOf(h).startsWith('admin.') ? ADMIN_PORT : CUSTOMER_PORT);

const proxy = http.createServer((req, res) => {
  const port = portFor(req.headers.host);
  const upstream = http.request(
    { host: '127.0.0.1', port, path: req.url, method: req.method, headers: req.headers },
    (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers);
      up.pipe(res);
    },
  );
  upstream.on('error', () => {
    res.writeHead(502, { 'content-type': 'text/plain' });
    res.end(`dev proxy: upstream :${port} not ready yet — retry in a moment`);
  });
  req.pipe(upstream);
});

// HMR / websocket upgrades — forward raw to the matching Vite server.
proxy.on('upgrade', (req, socket, head) => {
  const port = portFor(req.headers.host);
  const up = net.connect(port, '127.0.0.1', () => {
    up.write(
      `${req.method} ${req.url} HTTP/1.1\r\n` +
        Object.entries(req.headers)
          .map(([k, v]) => `${k}: ${v}\r\n`)
          .join('') +
        '\r\n',
    );
    if (head?.length) up.write(head);
    socket.pipe(up);
    up.pipe(socket);
  });
  up.on('error', () => socket.destroy());
  socket.on('error', () => up.destroy());
});

proxy.listen(PROXY_PORT, () => {
  /* eslint-disable no-console */
  console.log(`\n[dev] host-router ready → http://localhost:${PROXY_PORT}`);
  console.log(`[dev]   customer : http://localhost:${PROXY_PORT}  (alias http://app.localhost:${PROXY_PORT})`);
  console.log(`[dev]   admin    : http://admin.localhost:${PROXY_PORT}\n`);
});
