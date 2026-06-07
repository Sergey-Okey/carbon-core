# Core of Life

Core of Life is a Nuxt application for managing tasks, habits, goals, focus
sessions, rewards, and progress analytics.

## Stack

- Nuxt 3 and Vue 3
- Pinia with persisted client state
- Vue Flow for the goal board
- SCSS design tokens and reusable glass surfaces
- Optional Neon persistence through the Nitro sync API

## Local Development

```bash
npm ci
copy .env.example .env
npm run dev:local
```

The local application is available at `http://127.0.0.1:3005`.
`DATABASE_URL` is optional. Without it, the application runs in local-only mode.

## Quality Checks

```bash
npm run typecheck
npm run build
npm run check
```

`npm run check` is the required pre-commit verification command. It runs the
strict TypeScript check followed by a production build.

## Production

Build and run the Node server locally:

```bash
npm ci
npm run check
npm start
```

The production server listens on `http://localhost:3000` by default. Verify
readiness with `GET /api/health`.

## Android APK

The Capacitor Android project lives in `android`. To refresh its bundled web
application and build a debug APK:

```bash
npm run android:build
```

The downloadable APK used by onboarding is stored at
`public/downloads/core-of-life.apk`.

For Vercel, connect the repository and add `DATABASE_URL` in project
environment variables when cloud sync is required. The Vercel build uses the
Nitro serverless preset automatically.

## Project Structure

- `components/base`: global navigation, notifications, cursor, and shared shell
- `components/ui`: reusable form controls and modal primitives
- `components/task`: task creation, filtering, sections, and cards
- `components/branch`: Vue Flow board and branch/milestone editing
- `components/analytics`: progress charts and analytics views
- `stores`: domain state and persistence boundaries
- `composables`: reusable actions and algorithms
- `pages`: route-level composition and route metadata
- `server/api`: health and optional cloud-sync endpoints
- `assets/styles`: global tokens, mixins, reset, and shared styles

## Engineering Rules

- Keep business mutations in stores or domain composables.
- Keep reusable UI components free of domain-specific state.
- Use existing CSS variables and SCSS mixins instead of introducing local
  design constants.
- Add comments only for non-obvious business rules, algorithmic decisions, or
  compatibility constraints. Prefer clear names for ordinary code.
- Run `npm run check` after changes that affect shared behavior.

## Rendering And SEO

The authenticated product is a client-rendered application and is marked
`noindex`. The public onboarding route is the indexable product introduction.
Global metadata, route metadata, `robots.txt`, and the web app manifest live in
the Nuxt configuration, route files, and `public` directory.

If public organic acquisition becomes a primary goal, the next architectural
step is moving the public onboarding experience to an SSR or prerendered route
while keeping authenticated application routes client-only.

## Environment

Runtime secrets belong in `.env` and must never be committed. Copy
`.env.example` to `.env`. `DATABASE_URL` must be a PostgreSQL/Neon connection
string with permission to create and update the `cof_sync_state` table.

Authentication profiles currently live in the browser. Cloud sync is keyed by
a signed server session when `DATABASE_URL` is configured. If the backend is
not configured or reachable, the app falls back to a local-only profile.

Email/password accounts are stored in PostgreSQL with `scrypt` password
hashing. Sync endpoints require an authenticated session whenever the database
is configured.

Google and Yandex OAuth use server-side authorization-code flows with CSRF
state validation and an HttpOnly signed session cookie. Configure
`AUTH_SESSION_SECRET` and the corresponding provider client ID/secret values to
enable their buttons. Register these callback URLs with the providers:

- `https://your-domain/api/auth/google/callback`
- `https://your-domain/api/auth/yandex/callback`

Set `NUXT_PUBLIC_WEB_APP_URL=https://your-domain` before building Android so
the static APK can reach the deployed OAuth endpoints. Without provider
credentials and this HTTPS URL, the OAuth buttons remain available but explain
that server login is not configured.
