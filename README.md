# Portfolio

Personal portfolio and publishing platform. Architecture and product decisions live in
[`docs/plan.md`](docs/plan.md), which is the source of truth for scope.

## Requirements

- Bun 1.3.13 (pinned via `packageManager`)

## Getting started

### Without a Sanity project

The site runs with no backend at all. From `apps/web`:

```bash
bun install
cd apps/web && bun run dev:offline
```

That starts a local stand-in for the Sanity query API and points the app at it. The
stand-in evaluates the app's real GROQ with `groq-js` — the same evaluator Sanity uses —
against an empty document set, which is exactly the state a brand-new project is in. Every
route renders its empty state, and no `.env.local` is required.

To see the site fully populated, pass the bundled fixture:

```bash
bun run dev:offline -- ./scripts/fixtures/seed.ts
```

That fixture is development-only and is never uploaded to a dataset. Its blog posts and
testimonials are the handoff's placeholders, present so the blog index, tag filter, article
template, and testimonial section can be exercised — see
[`docs/handoff-deviations.md`](docs/handoff-deviations.md). Any JSON array of Sanity
documents works too.

### With a real Sanity project

```bash
bun install
cp apps/web/.env.example apps/web/.env.local      # then fill in
cp apps/studio/.env.example apps/studio/.env.local
bun run dev
```

`bun run dev` starts the web app on :3000 and Studio on :3333. Both fail fast with a list
of missing variables rather than starting half-configured.

## Repository scripts

Every root script delegates to `turbo run`; the real work lives in workspace package scripts.

| Script              | Purpose                                     |
| ------------------- | ------------------------------------------- |
| `bun run dev`       | Persistent dev servers for every workspace  |
| `bun run build`     | Production builds, cached                   |
| `bun run lint`      | ESLint across workspaces                    |
| `bun run typecheck` | TypeScript, no emit                         |
| `bun run test`      | Bun unit tests                              |
| `bun run typegen`   | Regenerate Sanity schema + types (uncached) |
| `bun run deploy`    | Deployment tasks (uncached)                 |
| `bun run format`    | Prettier write; `format:check` verifies     |

## Layout

```text
apps/
  web/                 Next.js public website
  studio/              Sanity Studio
packages/
  sanity/              Schemas, GROQ queries, generated types
  eslint-config/       Shared flat ESLint configuration
  typescript-config/   Strict shared TypeScript configurations
```

## Workspace conventions

- **Isolated linker.** `bunfig.toml` sets `linker = "isolated"`, so a workspace can only import
  what it declares. Undeclared imports fail at install time instead of resolving through a hoisted
  root `node_modules`.
- **Catalog.** Versions consumed by more than one workspace are pinned once in the root
  `workspaces.catalog` and referenced as `"catalog:"`. Everything else is installed in the
  workspace that imports it.
- **Root stays thin.** Only repository-wide tooling (Turborepo, Prettier) belongs in the root
  package.
- **Transit node.** `lint`, `typecheck`, and `test` depend on a no-op `topo` task rather than on
  `^lint`/`^typecheck`. That propagates cache invalidation through the package graph without
  serializing the tasks behind their dependencies.
- **Strict env.** `turbo.json` uses `envMode: "strict"`, and `eslint-plugin-turbo` fails the lint
  when code reads an environment variable that `turbo.json` does not declare.

## Decisions that depart from the plan

- **No Playwright.** `docs/plan.md` §7 calls for end-to-end tests; that was dropped by
  explicit decision. The unit and Lighthouse layers of §7 still stand. Re-adding it later is
  `bun add -d @playwright/test` plus a `test:e2e` task.

## Version decisions

Three pins deliberately trail the newest published release:

- **TypeScript 6.0.3, not 7.0.2.** `typescript-eslint@8` declares
  `typescript >=4.8.4 <6.1.0`. Taking TypeScript 7 would mean dropping type-aware linting, which
  is a worse trade than trailing one major. Revisit when typescript-eslint ships TypeScript 7
  support.
- **`@sanity/client` 7.x, not 8.x.** Both `sanity@6` and `next-sanity@13` depend on
  `@sanity/client@^7.26.2`. Installing 8.x would load two client copies.
- **Sanity 6, not the plan's Studio 5.** `next-sanity@13` accepts `sanity@^5.29.0 || ^6.0.0`, and
  `docs/plan.md` §2 calls for "the latest mutually compatible stable releases", so 6 is the
  correct read of that instruction.

`eslint-plugin-jsx-a11y` declares a peer range that stops at ESLint 9. Its rules were verified to
execute correctly under ESLint 10; the range is stale, not a real incompatibility.
`eslint-plugin-react` is intentionally absent — React 19's transform plus strict TypeScript makes
its remaining rules redundant, and `jsx-a11y` covers accessibility.
