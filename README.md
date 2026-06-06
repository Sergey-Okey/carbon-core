# Core of Life

Core of Life is a Vue 3 and Nuxt application for managing tasks, habits, goals,
focus sessions, rewards, and progress analytics.

## Stack

- Nuxt 3 and Vue 3
- Pinia with persisted client state
- Vue Flow for the goal board
- Chart.js for analytics
- SCSS design tokens and reusable glass surfaces
- Prisma and Neon for server-side persistence

## Local Development

```bash
npm install
npm run dev:local
```

The local application is available at `http://127.0.0.1:3005`.

## Quality Checks

```bash
npm run typecheck
npm run build
npm run check
```

`npm run check` is the required pre-commit verification command. It runs the
strict TypeScript check followed by a production build.

## Project Structure

- `components/base`: global navigation, notifications, cursor, and shared shell
- `components/ui`: reusable form controls and modal primitives
- `components/task`: task creation, filtering, sections, and cards
- `components/branch`: Vue Flow board and branch/milestone editing
- `components/analytics`: progress charts and analytics views
- `stores`: domain state and persistence boundaries
- `composables`: reusable actions and algorithms
- `pages`: route-level composition and route metadata
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

Runtime secrets belong in `.env` and must never be committed. See
`prisma/schema.prisma` and the server API configuration for required database
variables.
