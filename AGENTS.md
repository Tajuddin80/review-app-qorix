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
| `npm run generate` | `shopify app generate` (create extensions) |

## Architecture

- **Router**: React Router v7 with flat file routing via `@react-router/fs-routes` (`app/routes.js`). Route files map 1:1 to URL paths.
- **Auth**: `shopify.authenticate.admin(request)` in every protected loader/action. Webhook auth uses `authenticate.webhook(request)`.
- **DB**: Prisma + SQLite (`prisma/schema.prisma`) — stores Shopify session tokens. Switch datasource for production.
- **UI**: Polaris web components (`<s-page>`, `<s-button>`, etc.) via App Bridge, not React Polaris.
- **API version**: `ApiVersion.October25` everywhere (`shopify.server.js`, `.graphqlrc.js`, `shopify.app.toml`).

## Embedded app rules

- Use `<Link>` from react-router or Polaris — never `<a>` tags.
- Use `redirect` returned from `authenticate.admin`, not react-router's `redirect`.
- Use `useSubmit` from react-router for form submissions.

## Quirks

- **Shopify CLI must be installed globally** (`npm i -g @shopify/cli`). It is not a local dep.
- **Node engine**: `>=20.19 <22 || >=22.12` (enforced by `.npmrc` `engine-strict=true`).
- **No import alias**: The eslint config references `^~/` but the repo does not use it. Use relative imports.
- **No test framework**: This project has no tests configured.
- **Setup order matters**: `prisma generate` must run before `prisma migrate deploy`. The `setup` script does both.
- **Typegen is required**: `react-router typegen` generates `.react-router/types/` — run before `tsc`.
- **GraphQL queries** must use the `#graphql` template tag for codegen to pick them up.
- **Dev store**: `test-store-1100000000000000000000000000000003592.myshopify.com` (in `.shopify/project.json`).
- **Docker**: Uses `node:20-alpine`, installs `openssl` for Prisma, runs `npm ci --omit=dev`, then `build` + `docker-start`.
- **Theme extension**: `extensions/qorix-extension/` (type = theme).
- **Webhooks**: Declared in `shopify.app.toml` (app-specific, not via `afterAuth` hook). Processed in route files.
- **MCP**: Shopify Dev MCP configured (`.mcp.json`, `.cursor/mcp.json`).
- **Session model** includes `refreshToken` + `refreshTokenExpires` with `expiringOfflineAccessTokens: true` enabled.
