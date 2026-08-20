# Portfolio Monorepo Architecture Plan

## 1. Project goals

Build a personal portfolio and publishing platform designed to:

- Present projects, professional experience, and verified testimonials to recruiters and prospective clients.
- Publish technically strong articles that can rank well in search engines.
- Keep all publishable content editable through Sanity without turning the CMS into a page builder.
- Maintain fast, primarily static public pages with secure previewing and prompt content revalidation.
- Use the supplied visual design without introducing a separate design direction.

The first release is English-only. Authentication, comments, newsletters, site search, lead persistence, multilingual routing, a services catalogue, and a configurable page builder are outside v1.

### Finalized product decisions

- Recreate the supplied HTML handoff at high fidelity; its typography, tokens, spacing, responsive wrapping, and interaction behavior are the visual source of truth.
- Use `/work` and `/work/[slug]` for the portfolio index and case studies. “Work” is the public label everywhere.
- Keep the implementation Tailwind-only. Do not introduce shadcn/ui or a shared UI workspace for these bespoke components.
- Use the three-field contact form from the design: name, email, and message. Security-only fields remain visually hidden.
- Display the public email, GitHub, LinkedIn, and Accra location from the profile. Keep the phone number hidden by default and publish it only after an explicit future content decision.
- Hide the testimonial section until verified quotes exist. Never launch with the prototype testimonials.
- Publish only genuine Sanity documents. Native Sanity drafts and prototype “Draft” labels never appear on the public site.
- Hide unavailable live-demo/GitHub actions instead of rendering placeholder or `#` links.
- Keep blog tag filters as shareable `?tag=` UI state, but canonicalize filtered URLs to `/blog`; do not create indexable query-parameter archives in v1.
- Extend the same design language to privacy, not-found, loading, error, validation, and success states that were not included in the handoff.

## 2. Repository architecture

Initialize `portfolio` as its own Git repository and Bun/Turborepo workspace:

```text
portfolio/
├── apps/
│   ├── web/                 # Next.js public website
│   └── studio/              # Sanity Studio
├── packages/
│   ├── sanity/              # Schemas, GROQ queries, and generated types
│   ├── eslint-config/       # Shared flat ESLint configuration
│   └── typescript-config/   # Strict shared TypeScript configurations
├── docs/
│   └── plan.md
├── package.json
├── turbo.json
├── bunfig.toml
└── bun.lock
```

### Runtime and dependency management

- Use Next.js 16 with the App Router, TypeScript, React Server Components, and Tailwind CSS.
- Use Sanity Studio 5 and `next-sanity` 13 or the latest mutually compatible stable releases when implementation begins.
- Pin `packageManager` to Bun 1.3.13 and commit the text `bun.lock` file.
- Configure Bun workspaces for `apps/*` and `packages/*` with the isolated linker.
- Use Bun for dependency installation and repository scripts. Allow Next.js, Sanity CLI, and deployed Vercel functions to use their supported runtimes rather than forcing every process to execute under Bun.
- Use a Bun catalog for versions consumed by multiple workspaces. Install all other dependencies in the workspace that imports them.
- Keep the root package limited to repository-wide tooling such as Turborepo and Prettier.
- Do not create a shared UI package. The portfolio is the only consumer of its design system, so components and Tailwind tokens belong in `apps/web`.

### Turborepo task graph

- Root scripts delegate to `turbo run`; task implementation stays in workspace package scripts.
- Configure `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `typegen`, and `deploy` tasks.
- `build` depends on `^build` and caches `.next/**` and `dist/**`, excluding development caches.
- `dev` is persistent and uncached. Deployment and TypeGen tasks are uncached because they have external or generated-file side effects.
- Use a transit node for linting, typechecking, and unit-test cache invalidation without forcing dependency tasks to run sequentially.
- Commit generated Sanity schema and types. CI regenerates them and fails if the working tree changes.

## 3. Application architecture

### Public routes

Implement these fixed routes in code:

- `/`
- `/about`
- `/work`
- `/work/[slug]`
- `/blog`
- `/blog/[slug]`
- `/contact`
- `/privacy`
- `/rss.xml`

Use Server Components by default. Client components are limited to genuine browser interactions, Visual Editing, analytics, Turnstile, and contact-form state.

### Design system and browser state

- Load Lato through `next/font/google` with weights 300, 400, and 700 plus the 400 italic style.
- Implement the handoff's light and dark colors as semantic CSS variables selected by `data-theme` on `<html>`.
- Use `next-themes` with `attribute="data-theme"`, `storageKey="kn-theme"`, `defaultTheme="dark"`, and `enableSystem={false}`. The pre-paint theme script must prevent a light-mode flash.
- Implement the supplied favicon as a static SVG asset and keep sun/moon icons as accessible inline SVG components.
- Keep the 680px content column, fluid `clamp()` sizing, wrapping navigation, pill controls, card styling, and purple underline motif from the handoff.
- Add visible keyboard focus styles and accessible names without changing the established visual direction.

### Shared Sanity package

`@portfolio/sanity` is a just-in-time internal package with explicit exports:

- `@portfolio/sanity/schema` for Studio schema definitions.
- `@portfolio/sanity/queries` for uniquely named `defineQuery` GROQ queries.
- `@portfolio/sanity/types` for generated schema and query-result types.

Studio consumes the schemas while the web app consumes the queries and types. App-specific Sanity clients, tokens, image helpers, caching, and Draft Mode integration remain in `apps/web`.

Configure `apps/studio/sanity.cli.ts` to extract its imported schema into `packages/sanity/schema.json`, scan the package's named GROQ queries, and generate `packages/sanity/src/generated/sanity.types.ts`. Enable automatic extraction and TypeGen during Studio development, while retaining an explicit `typegen` script for CI.

### Content models

Use singleton documents for:

- `siteSettings`: global publishing and SEO defaults only.
- `profile`: personal identity, biography, portrait, résumé, location, availability, and social profiles.
- `homePage`: hero and homepage-specific section copy, references, and ordering.
- `aboutPage`: about-page-specific copy and content references.
- `workPage`: work-index heading, introduction, and ordered project references.
- `blogPage`: blog heading, introduction, and featured-post reference.
- `contactPage`: public contact-page copy and response expectations.

Use collection documents for:

- `project`
- `post`
- `experience`
- `testimonial`
- `category`
- `tag`

Reusable object types include SEO overrides, Portable Text, accessible images, external/internal links, code blocks, callouts, and ordered skill groups. Require image alt text, meaningful slugs, publication dates, and essential titles/descriptions. Use warnings rather than hard failures for recommended SEO title and description lengths.

- `profile` stores the wordmark parts, public identity/contact information, availability status, portrait, biography, résumé, social profiles, and the six ordered skill groups reused by Home and About.
- `homePage` stores the hero, CTA labels, up to three ordered featured-project references, and up to two testimonial references. Empty testimonial references hide the section.
- `workPage` controls the exact project order shown by the design.
- `blogPage.featuredPost` must reference a published post; when absent, the featured card is omitted.
- `project` stores summary, role, date range, stack, optional live/repository links, and structured case-study content: problem, approach bullets, result, hero image, supporting images, and related posts.
- `post` stores a category, tags, standfirst, Portable Text body, publication date, cover/social image, and SEO overrides. Reading time is derived from the body rather than entered manually.
- Tags and categories use human labels plus URL-safe lowercase slugs. The UI shows “Company work” while the URL uses `company-work`.

### Site settings boundary

`siteSettings` contains only values that apply across the entire website:

- Site name and tagline.
- Default metadata title and description.
- Metadata title template, such as `%s | Name`.
- Default social-sharing image with alt text.
- Default author reference to the `profile` singleton.
- Optional site-wide footer call-to-action content, if it is repeated by the supplied design.
- The repeated “Work with me” CTA label and destination used by article and case-study footers.

Metadata resolves in this order:

```text
page or document SEO override
→ document title, excerpt, and cover image
→ siteSettings defaults
```

Do not store the canonical site URL, analytics verification values, contact recipient, tokens, or secrets in Sanity. Those belong in environment configuration. Navigation paths and route structure stay in code.

## 4. Content delivery, preview, and SEO

### Published content and previewing

- Use one Sanity dataset named `production`; Sanity drafts provide the preview environment.
- Configure Presentation Tool document-to-route resolvers for projects, posts, and page singletons.
- Use Draft Mode, Content Source Maps, stega encoding, and Visual Editing overlays for click-to-edit and real-time draft preview.
- Disable stega encoding for metadata, canonical URLs, JSON-LD, slugs, image URLs, and any other non-display value.
- Use `defineLive` for the editor preview experience while retaining explicit cache tags for deterministic production invalidation.
- Add a signed `POST /api/revalidate/sanity` Route Handler using `next-sanity/webhook`.
- The webhook validates its signature and payload before invalidating document-type and document-ID tags with `revalidateTag(tag, "max")`. Changes to global singletons also invalidate the root layout.
- Configure webhook events for create, update, and delete across all public document types.
- Public queries always use the published perspective. Missing documents, links, images, or references produce intentional hidden/empty states rather than exposing drafts or placeholder data.

### Blog filtering

- Fetch the published post list in a Server Component and hand the small list to a focused client filter component.
- Use `nuqs` with the App Router adapter for the `tag` search parameter, `history: "replace"`, `clearOnDefault: true`, and no scroll reset.
- Treat “All” as the default and remove it from the URL. Validate incoming slugs against the currently published tag set; invalid values fall back to “All.”
- Tag chips and filter pills update the same shared parser, remain keyboard-operable buttons, and preserve shareable deep links.
- All `?tag=` variants emit the base `/blog` canonical URL. If indexable tag landing pages are wanted later, add dedicated `/blog/tag/[slug]` routes instead of indexing query combinations.

### SEO foundation

- Generate route-specific metadata with canonical URLs, Open Graph data, Twitter cards, and author information.
- Generate `robots.txt`, XML sitemap, RSS, web manifest, icons, and social images through Next.js metadata conventions.
- Emit sanitized, typed JSON-LD for `Person`, `WebSite`, `BlogPosting`, projects, and breadcrumbs. Escape `<` in serialized CMS data before placing it in JSON-LD scripts.
- Exclude drafts, APIs, and Vercel preview deployments from indexing.
- Derive the canonical origin from `NEXT_PUBLIC_SITE_URL`, never from an incidental preview deployment URL.
- Render semantic HTML with correct headings, landmarks, descriptive links, keyboard support, and accessible form feedback.
- Optimize Sanity images through `next/image`, preserving crop/hotspot settings and providing explicit dimensions and responsive sizes.
- Add Vercel Web Analytics and Speed Insights. Verify the production domain and submit the sitemap in Google Search Console.

## 5. Contact and email architecture

Implement contact submission as a Server Action.

### Input contract

- `name`
- `email`
- `message`
- Cloudflare Turnstile token
- Hidden honeypot field

### Output contract

```ts
type ContactResult =
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };
```

### Processing rules

- Validate the complete payload and Turnstile token on the server.
- Present Turnstile without adding a persistent visual field to the final three-field layout; include a progressive fallback if a challenge is required.
- Send one transactional Resend email with both HTML and plain-text bodies.
- Send from a verified `send.<production-domain>` subdomain and set the visitor's address as `replyTo`.
- Explicitly inspect Resend's `{ data, error }` result; API errors are not assumed to throw.
- Retry only rate-limit and server errors, with no more than two bounded retries.
- Use a SHA-256 digest of the normalized submission as the Resend idempotency key to prevent duplicate delivery within its 24-hour window.
- Store no inquiry database and add no Resend webhook in v1.
- Never log message bodies, email addresses, API keys, or Turnstile tokens.
- Disable Resend click/open tracking for these transactional messages.
- Associate labels, descriptions, and errors with their inputs. Disable the submit action while pending, change its accessible label to indicate sending, render field errors inline, replace the form with a success message after delivery, and show a retryable form-level error when delivery fails.

## 6. Environment and deployment

Keep environment files within the app that consumes them; do not create a root `.env`.

### Web public variables

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `NEXT_PUBLIC_SANITY_STUDIO_URL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

### Web private variables

- `SANITY_API_READ_TOKEN`
- `SANITY_REVALIDATE_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

### Studio variables

- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`
- `SANITY_STUDIO_PREVIEW_URL`
- `SANITY_STUDIO_APP_ID`
- `SANITY_AUTH_TOKEN` in CI only

Validate variables at startup with separate public and server-only schemas. Provide safe `.env.example` files without real credentials.

Deploy `apps/web` as a Vercel monorepo project. Use Vercel Git integration for pull-request previews and production deployments from `main`. Deploy Studio to Sanity-managed hosting with a fixed app ID after the main-branch CI workflow succeeds.

Configure only trusted localhost and production/preview origins in Sanity CORS, enabling credentials only where Draft Mode requires them. Configure the signed revalidation webhook only against the production web endpoint.

## 7. Testing and continuous integration

### Automated tests

- Use `bun test` for environment parsing, schema helpers, GROQ projections, metadata fallbacks, JSON-LD sanitization, contact validation, Turnstile failures, Resend errors, and idempotency behavior.
- Use Playwright for navigation, responsive critical paths, theme persistence/no-flash behavior, blog tag URL state, empty/not-found states, Draft Mode authorization, contact validation, keyboard access, and essential SEO output.
- Use Lighthouse CI on representative home, work/case-study, and blog pages.
- Target at least 90 for performance and 95 for accessibility, best practices, and SEO before launch.

### GitHub Actions

On pull requests and pushes:

1. Install the pinned Bun version.
2. Run `bun install --frozen-lockfile`.
3. Regenerate Sanity schema/types and fail if `git diff --exit-code` detects drift.
4. Check formatting, linting, and TypeScript.
5. Run Bun unit tests.
6. Build all affected workspaces through Turborepo.
7. Run Playwright and Lighthouse checks where required secrets are available.

After all checks pass on `main`, deploy Sanity Studio using a scoped deploy token. Let Vercel Git integration deploy the web application. Configure Turborepo remote caching in CI with scoped `TURBO_TOKEN` and `TURBO_TEAM` secrets.

## 8. Implementation acceptance criteria

- A clean clone installs reproducibly with the pinned Bun version and frozen lockfile.
- `bun run dev` starts both the web app and Studio through Turborepo.
- All public routes render successfully with sensible empty and not-found states.
- The site defaults to dark mode without a flash, persists the explicit light/dark choice under `kn-theme`, and keeps the active navigation state correct on nested Work and Blog routes.
- Blog filtering reads and updates URL-safe `?tag=` state, falls back safely for invalid tags, and never changes the canonical away from `/blog`.
- Sanity schema or query changes regenerate deterministic committed types.
- Editors can preview drafts, navigate between matching Studio documents and public routes, and click content to edit it.
- Publishing, deleting, or updating Sanity documents triggers signed cache invalidation without a full web deployment.
- Every indexable page has a canonical URL, unique metadata, valid structured data, and appears in the correct sitemap/RSS output.
- Preview and draft pages cannot be indexed.
- Contact submissions reject invalid/spam requests, send exactly one email on success, and expose no private credentials or visitor content.
- Linting, formatting, typechecking, unit tests, production builds, Playwright, and Lighthouse checks pass in CI.

## 9. Required implementation inputs

The following will be supplied or created during implementation:

- The reviewed HTML design handoff remains the visual source of truth.
- Final production domain.
- Sanity project and production dataset.
- Sanity Viewer and deployment tokens.
- Resend account, verified sending subdomain, and destination email.
- Cloudflare Turnstile keys.
- Vercel and GitHub project connections.
- Profile photograph, two Mybitstore case-study screenshots, and a default Open Graph image.
- Initial profile, project, experience, and genuinely publishable blog content.
- Verified testimonials if the testimonial section is to be enabled after launch.
- Real shipping and banking demo/repository URLs if those actions are to be displayed.

Until those optional inputs exist, the launch defaults are: phone hidden, testimonials hidden, missing project actions hidden, and no placeholder blog posts published.
