# review-app — Shopify App (React Router)

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | `shopify app dev` — full dev loop (tunnel + env + Prisma migrate) |
| `npm run build` | `react-router build` |
| `npm run start` | `react-router-serve ./build/server/index.js` |
| `npm run setup` | `prisma generate && prisma migrate deploy` |
| `npm run typecheck` | `react-router typegen && tsc --noEmit` — **typegen must run first** |
| `npm run lint` | eslint with cache |
| `npm run graphql-codegen` | generates TS types from `#graphql` tagged queries in `app/` → `app/types/` |
| `npm run docker-start` | `npm run setup && npm run start` |
| `npm run deploy` | `shopify app deploy` |

## Architecture

- **Router**: React Router v7 with flat file routing (`app/routes.js` → `@react-router/fs-routes`). Route files map 1:1 to URL paths. Directory routes (e.g. `auth.login/route.jsx`) and catch-all (`auth.$.jsx`) follow React Router conventions.
- **Auth**: `shopify.authenticate.admin(request)` in every protected loader/action. Webhook auth uses `authenticate.webhook(request)`. Auth flow goes through `auth.$.jsx` (install callback) and `auth.login/route.jsx` (login form).
- **DB**: Prisma + SQLite (`prisma/schema.prisma`) — stores Shopify session tokens. Switch datasource for production.
- **UI**: Polaris web components (`<s-page>`, `<s-button>`, etc.) via App Bridge, not React Polaris.
- **API version**: JS code uses `ApiVersion.October25` (`shopify.server.js`, `.graphqlrc.js`). TOML config uses `api_version = "2026-10"` (`shopify.app.toml`). Keep them in sync.
- **Webhooks**: Declared in `shopify.app.toml` (app-specific, not via `afterAuth` hook). Route files at `app/routes/webhooks.app.uninstalled.jsx` → `/webhooks/app/uninstalled`.

## Embedded app rules

- Use `<Link>` from react-router or Polaris — never `<a>` tags.
- Use `redirect` returned from `authenticate.admin`, not react-router's `redirect`.
- Use `useSubmit` from react-router for form submissions.

## Quirks

- **Shopify CLI must be installed globally** (`npm i -g @shopify/cli`). Not a local dep.
- **Node engine**: `>=20.19 <22 || >=22.12` (enforced by `.npmrc` `engine-strict=true`).
- **No import alias**: The eslint config references `^~/` but the repo does not use it. Use relative imports.
- **No test framework**: No tests configured.
- **Setup order matters**: `prisma generate` must run before `prisma migrate deploy`. `npm run setup` does both. During dev, `shopify.web.toml` handles this via its `predev` and `dev` commands automatically.
- **Typegen is required**: `react-router typegen` generates `.react-router/types/` — run before `tsc`.
- **GraphQL queries** must use the `#graphql` template tag for codegen to pick them up.
- **Dev store**: `test-store-1100000000000000000000000000000003592.myshopify.com` (in `.shopify/project.json`).
- **Docker**: Uses `node:20-alpine`, installs `openssl` for Prisma, runs `npm ci --omit=dev`, then `build` + `docker-start`.
- **Theme extension**: `extensions/qorix-extension/` (type = theme).
- **MCP**: Shopify Dev MCP configured (`.mcp.json`, `.cursor/mcp.json`).
- **Session model**: Includes `refreshToken` + `refreshTokenExpires` with `expiringOfflineAccessTokens: true` enabled.
- **Vite HOST workaround**: `vite.config.js` replaces `HOST` env var with `SHOPIFY_APP_URL` to avoid breaking the Vite server. Don't remove this.
