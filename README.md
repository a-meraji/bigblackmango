# bigblackmango — frontend

An npm-workspaces monorepo holding **two fully separate apps** plus their shared platform:

```
apps/customer/   @blackmango/customer  — the PWA (service worker + manifest). Served at <domain>.
apps/admin/      @blackmango/admin     — plain admin SPA (no service worker). Served at admin.<domain>.
packages/shared/ @blackmango/shared    — design-system, api client, auth/toast stores, hooks, types.
```

The customer build ships **zero** admin code (enforced by the ESLint import boundary and
verified at build time). Admin is a separate origin in production and a separate Vite server
in dev — they never share a bundle or a service-worker scope.

## Local development

The two apps live on two hosts in production (`admin.<domain>` vs `<domain>`). To reproduce
that split locally, run the **host-router** — it starts both Vite servers and routes by the
`Host` header, exactly like nginx does in prod:

```bash
npm install            # once, at this folder (hoists workspaces)
npm run dev:all
```

Then open:

| URL | App |
| --- | --- |
| http://admin.localhost:8080 | Admin SPA |
| http://localhost:8080 (or http://app.localhost:8080) | Customer PWA |

`*.localhost` resolves to `127.0.0.1` in every modern browser — no `/etc/hosts` edits needed.
Change the port with `DEV_PROXY_PORT=9000 npm run dev:all`.

> Why this exists: a plain `npm run dev` serves only ONE app on a port, regardless of the
> hostname you type. Opening `admin.localhost:3001` against the customer server just shows the
> customer home page. `dev:all` is what makes the admin subdomain actually resolve to admin
> locally.

Single-app alternatives (no subdomain routing):

```bash
npm run dev          # customer only → http://localhost:3001
npm run dev:admin    # admin only    → http://localhost:3002
```

Both proxy `/api` + `/uploads` to the backend at `http://localhost:3000`
(override with `VITE_API_PROXY_TARGET`).

## Build

```bash
npm run build        # customer PWA  → apps/customer/dist
npm run build:admin  # admin SPA     → apps/admin/dist
npm run build:all    # both
```

Deployment of these artifacts is handled by `deploy/scripts/*` — see `deploy/DOMAIN_SETUP.md`.
