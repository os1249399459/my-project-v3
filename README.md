# Console

A Vue 3 + TypeScript admin console, structured the way a real back office is:
typed API layer, explicit stores, route-meta-driven navigation, and errors that
have exactly one shape.

> Rebuilt from a Vue 2 / vue-cli / Element UI demo (`my-project`) that had been
> collecting dust since 2022. Same idea, current toolchain, and the boundaries
> the original was missing.

## Stack

| Concern    | Choice                                                |
| ---------- | ----------------------------------------------------- |
| framework  | Vue 3.5, `<script setup>`, TypeScript strict          |
| build      | Vite 8 (rolldown)                                     |
| state      | Pinia 4, setup-store style                            |
| routing    | Vue Router 5, meta-driven                             |
| UI         | Element Plus, on-demand via `unplugin-vue-components` |
| HTTP       | axios with one typed envelope + one error normalizer  |
| validation | zod (environment config)                              |
| test       | Vitest 4 + jsdom, v8 coverage                         |
| lint       | oxlint + ESLint 10 + Prettier, wired into husky       |

## Structure

```
src/
├── api/            client.ts (envelope unwrap) · errors.ts (one error shape)
├── components/
│   └── layout/     AppSidebar · AppHeader
├── composables/    useApi.ts (loading/error/data around one request)
├── config/         env.ts (zod-validated at boot)
├── layouts/        AdminLayout.vue (shell: aside + header + routed content)
├── router/         index.ts (meta drives sidebar and breadcrumb)
├── stores/         session.ts · layout.ts
├── styles/         main.css (tokens + reset only)
├── types/          order.ts, generated component types
├── utils/          logger.ts
└── views/
    ├── dashboard/  stat tiles + table
    ├── orders/     paged list
    ├── users/      searchable list
    └── settings/   form + build info
```

## Three decisions worth explaining

**1. One error shape.** `normalizeError()` turns anything thrown — an axios
error, a business-code rejection, a plain `Error` — into `{ code, message,
retryable }`. Pages never branch on `error.response.status`; they branch on
`error.retryable`.

**2. Environment config fails at boot.** `src/config/env.ts` parses
`import.meta.env` through zod and throws with the full issue list. A typo in
`VITE_API_TIMEOUT` becomes a startup error, not a `NaN` timeout deep inside a
request three hours later.

**3. Persistence is explicit.** The layout store writes its own key and reads it
through a `try/catch`. A persistence plugin was tried and removed: its `persist`
option was invisible to `vue-tsc` in this setup, and six lines of
`localStorage` are easier to audit than a plugin configuration is to trust.

## Getting started

```bash
npm install --legacy-peer-deps   # see note below
cp .env.example .env.local
npm run dev                      # http://localhost:5173
```

`--legacy-peer-deps` is not a stylistic choice: npm 10's resolver crashes on
this dependency graph with `Cannot read properties of null (reading 'edgesOut')`.
CI passes the same flag. It is an npm bug, not a peer conflict — the tree
resolves cleanly.

Dev requests to `/api/*` are proxied to `VITE_DEV_PROXY_TARGET` (default
`http://127.0.0.1:8080`), so the browser never sees a cross-origin request.

## Scripts

```bash
npm run dev            # vite dev server
npm run type-check     # vue-tsc --build
npm run lint           # oxlint + eslint --fix
npm run format         # prettier
npm run test:unit      # vitest watch
npm run test:coverage  # vitest run --coverage
npm run build          # type-check + build
```

## Bundle

The Element Plus entry chunk is ~454 kB raw / 154 kB gzip even with on-demand
imports, because `el-table` and `el-form` pull most of the component runtime.
Three manual chunks split vendors by change rate so a dependency bump does not
invalidate the app chunk. If that 154 kB matters, the next step is replacing
`el-table` with a lighter table, not further code-splitting.

## What is not here

- **No mock server.** Pages degrade to documented fallback data when the API is
  absent, which is enough to look at the UI; a full msw layer was not worth the
  weight for a scaffold.
- **No auth backend.** The login form posts to `/auth/login` and the router
  guard reads the session store. Wiring a real backend means changing one
  endpoint and one response shape.
- **No i18n.** Element Plus is registered with the zh-CN locale; app strings are
  hard-coded. Adding vue-i18n is a separate decision, not a refactor.
