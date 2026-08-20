# Handoff: KENNARTEY Portfolio Website

## Overview
A personal portfolio site for Kenneth Dela Nartey (software engineer, Accra, Ghana): Home, Work, a Mybitstore case study, About, Blog (with tag filtering and a featured post), a blog post template, and Contact. Bold-minimalist, single-column, dark-mode-first.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate these designs in the target codebase's environment** (the owner's stack is React/Next.js or Vite + React Router, TypeScript, Tailwind CSS, shadcn/ui — prefer that) using its established patterns. The `.dc.html` files use a custom component runtime (`support.js`); ignore the runtime, treat the markup and inline styles as the spec. `image-slot.js` renders image placeholders — replace with real `<img>` slots.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interactions are final. Recreate pixel-perfectly. All copy is final unless marked "placeholder" (testimonials, blog posts are placeholder drafts).

## Design Tokens
Implement as CSS variables toggled by `data-theme` on `<html>`:

Light: `--bg:#faf9fc; --ink:#26262b; --muted:#63636b; --soft:#8a8a94; --line:#e6e3ef; --accent:#4a3b8f; --card:#ffffff; --chip:#f1eff7`
Dark (DEFAULT): `--bg:#15141a; --ink:#ecebf2; --muted:#a8a6b4; --soft:#7c7a8a; --line:#2b2936; --accent:#a89aec; --card:#1d1b25; --chip:#242231`

- Font: **Lato** (Google Fonts; weights 300/400/700, italic 400). Body 16px, line-height 1.65, color `--ink` on `--bg`.
- Content column: `max-width:680px; margin:0 auto`, horizontal padding `clamp(18px,5vw,28px)`.
- Page titles: `clamp(28px,6vw,36px)` w700, letter-spacing -0.01em. Home hero: `clamp(30px,7vw,42px)`.
- Section headings: 13px w700 uppercase, letter-spacing 0.08em, followed by a 30×3px `--accent` bar (margin-bottom ~14–24px). This purple underline is the signature motif.
- Chips: `background:var(--chip); border-radius:999px; padding:5px 14px; font-size:13.5px; font-weight:600`.
- Cards: `background:var(--card); border:1px solid var(--line); border-radius:12px; padding:20px 22px`; hover: `border-color:var(--accent)`.
- Buttons/pills: border-radius 999px. Primary: `background:var(--accent); color:var(--bg); padding:10px 20px; font-weight:700`. Secondary: `border:1.5px solid var(--line)`.
- Links: `color:var(--accent)`, no underline, underline on hover.
- Body background transition: `background 0.25s`.

## Global Chrome (every page)
**Nav** (flex, space-between, wraps; top padding 20px):
- Logo lockup, links to Home: "KEN" (w700) + "NARTEY" (w300), 16px, letter-spacing 0.13em, `--ink`; below it a 20×2.5px `--accent` bar (margin-top 3px).
- Right group (flex, gap 10px 18px, 14.5px): Home / Work / About / Blog / Contact — current page is `--ink` w700, others `--accent`. Then the theme toggle: 34px circle, `border:1px solid var(--line)`, `background:var(--card)`; shows a **sun** outline icon in dark mode, **moon** filled icon in light mode; hover: border+icon `--accent`.
- Theme: default **dark**; persisted in `localStorage` key `kn-theme`; applied as `data-theme` on `<html>`.

**Favicon**: 64×64 rounded square (radius 14), `#4a3b8f` fill, white w700 "K" centered (inline SVG data URI in the files).

**Footer** (all pages): top border `--line`, padding-top 20px, margin-top 96px; flex wrap, gap 12px 24px, 13.5px `--soft`: email, github.com/gitdela, LinkedIn, "Accra, Ghana".

## Screens

### 1. Home (`Portfolio Home.dc.html`)
Main padding: `clamp(48px,10vw,88px)` top.
- **Availability badge** (toggleable): dot 8px `--accent` + "AVAILABLE FOR WORK", 12.5px w700 uppercase `--accent`, letter-spacing 0.06em, margin-bottom 20px.
- **Hero**: h1 "I build web products that are fast, polished, and easy to find." Sub (18px `--muted`): "I'm Kenneth Dela Nartey — a software engineer in Accra shipping production apps with React, Next.js, and Node.js. Frontend craft, backend logic, and SEO that actually ranks."
- **CTAs** (flex wrap, gap 12px 16px, margin-top 26px): primary "See my work →" (to Work), secondary "Get in touch" (to Contact).
- **Skills** (margin-top 80px; groups in a grid, gap 20px). Each group: label 12.5px w700 uppercase `--soft` (margin-bottom 10px) + chip row (flex wrap, gap 8px):
  - Frontend: JavaScript, TypeScript, React, Next.js, Vite, React Router, Tailwind CSS, shadcn/ui, TanStack Query, TanStack Form, Recharts
  - Backend & Data: Node.js, Express, Hono, REST APIs, OpenAPI, PostgreSQL, Neon, Drizzle ORM, Appwrite, Sanity CMS, Better Auth, Webhooks, Background Workers
  - Infrastructure & Tooling: Bun, Turborepo, Git, Docker, DigitalOcean, Cloudflare, Vercel, Caddy, Nginx, Bash, Linux
  - Testing & Observability: Bun Test, Bruno, Pino, Grafana, Prometheus, Loki, Monitoring & Alerting
  - Blockchain & Fintech: Bitcoin Core, Electrs, bitcoinjs-lib, PSBT, Bitcoin Wallet Infrastructure, Double-Entry Ledgers, Paystack
  - SEO & Web Quality: Technical SEO, Web Performance, Accessibility, SEMrush
- **Featured Work** (margin-top 80px): 3 stacked link-cards (grid gap 14px). Card row: title 18px w700 + right-aligned 13px `--accent` w700 tag ("Case study →" / "2025"); below, 15px `--muted` blurb. Cards: Mybitstore → case study page; Shipping logistics platform and Banking web application → Work page.
- **What people say** (toggleable, margin-top 80px): note in italic 13px `--soft` that quotes are placeholders; 2 blockquotes, `border-left:3px solid var(--accent)`, padding-left 18px, 16.5px; attribution 13.5px `--soft`.

### 2. Work (`Portfolio Work.dc.html`)
- Title "Selected work." + sub linking to GitHub.
- 3 articles (grid gap 44px). Each: flex row — h2 22px w700 + right 13px `--accent` w700 date; blurb `--muted`; stack line 13.5px italic `--soft` (" · "-separated); link row (flex wrap, gap 8px 20px, w700 15px):
  - **Mybitstore — web platform** (2023 – now): "Live site ↗" → https://www.mybitstore.com (new tab) + "Read the case study →" → case study page.
  - **Shipping logistics platform** (2025): "Live demo ↗" (URL TBD) + "View on GitHub →" → https://github.com/gitdela
  - **Banking web application** (2025): "Live demo ↗" (URL TBD) + "View on GitHub →" → https://github.com/gitdela

### 3. Case Study — Mybitstore (`Portfolio Case Study - Mybitstore.dc.html`)
- "← All work" back link; h1 "Mybitstore: rebuilding a crypto marketplace's entire web presence".
- Meta row (flex wrap, gap 10px 28px, 14px `--soft`, labels `--ink` w700): Role — Front-end Developer; Timeline — 07/2023 – Present; Stack — Next.js, TypeScript, Tailwind, Shadcn/UI, Sanity.
- Hero image slot (rounded 14, `height:clamp(200px,48vw,340px)`, full width) — screenshot of web app.
- Sections (each with heading + accent bar): **The problem** (paragraph), **The approach** (5 bullets, grid gap 8px), a second image slot (admin dashboard), **The result** (paragraph), **Related writing** (link to the SEO blog post + smaller link "All Mybitstore posts" → Blog filtered by tag Mybitstore).
- Footer actions row: "← All work" + primary pill "Work with me →" → Contact.

### 4. About (`Portfolio About.dc.html`)
- Header: circular photo slot 120px + title "About me." with sub "Engineer by training, builder by habit. I turn ambitious product ideas into fast, well-crafted web apps."
- Bio paragraph (`--muted`).
- **Experience** (grid gap 22px). Rows are flex (label column 110px, 13.5px w700 `--accent`; body min-width 240px): 2023 – now / Front-end Developer — Mybitstore Technologies; 2025 / Independent full-stack projects. (No education section.)
- **Skills**: identical six groups as Home (grid gap 18px).

### 5. Blog (`Portfolio Blog.dc.html`)
- Title "Writing." + sub (placeholder note in italic `--soft`).
- **Featured card** (margin-top 36px): solid `--accent` background, radius 16px, padding `clamp(22px,4vw,32px)`, text `--bg`. Top row: "Featured" pill (bg `--bg`, text `--accent`) + "Opinion · Draft" at 75% opacity. Title `clamp(22px,4.5vw,28px)` w700: "What I think about using AI in development". Teaser 16px 85% opacity, max-width 52ch. "Read the post →" 14.5px w700. Post page not yet built.
- **Tag filter bar** (flex wrap, gap 8px): pill buttons. Active: bg `--accent`, text `--bg`. Inactive: bg `--card`, border 1.5px `--line`, text `--muted`. Tags derived from posts + "All". Selected tag syncs to `?tag=` URL param (shareable/deep-linkable).
- **Post list** (grid gap 32px): each article has 13px w700 uppercase `--accent` "{Category} · Draft", 22px w700 title link (`--ink`), 15px `--muted` blurb, and small tag chips (12px, bg `--chip`, `--muted`, clickable → sets filter). Posts (placeholders): Server Components (React; tags Frontend, Mybitstore), Technical SEO (SEO; tags Frontend, Mybitstore, Company work) → links to post page, Career post (tags Career), Appwrite build log (tags Backend, Fullstack, Personal project).
- Empty state: italic `--soft` "No posts with that tag yet."

### 6. Blog Post (`Portfolio Blog Post.dc.html`) — article template
- "← All posts"; meta "SEO | Aug 20, 2026 · 7 min read"; tag chips linking to filtered Blog; h1; 18px `--muted` standfirst.
- Body 17px `--muted`: h2s 22px w700 `--ink` with accent bar; pull-quote blockquote (left 3px `--accent` bar, 18px italic `--ink`); bullet list. Content is placeholder.
- Bottom row: "← All posts" + primary "Work with me →". Same footer.

### 7. Contact (`Portfolio Contact.dc.html`)
- Title "Let's build something." + sub "Hiring, or have a project in mind? Tell me about it — I reply fast."
- Form (grid gap 16px, max-width 520px): Name, Email, Message (textarea rows 5). Inputs: 1.5px `--line` border, bg `--card`, radius 10px, padding 11px 14px, 15px. Labels 13.5px w700.
- Submit: primary pill "Send message →". Prototype behavior opens `mailto:kendelanartey@gmail.com` with subject/body prefilled — in production wire to a real form backend (e.g. API route + email service).
- **Elsewhere**: email, GitHub, LinkedIn links + phone +233 24 920 3351 (phone display is toggleable).

## Interactions & Behavior
- Theme toggle on every page (see Global Chrome). No flash: set `data-theme` before paint.
- Blog tag filtering: client-side; clicking any tag chip or filter pill filters the list and updates `?tag=` via `history.replaceState`; read the param on load.
- Card/link hovers: border → `--accent` on cards; link underline; toggle button border/icon → `--accent`.
- Responsive: fluid, no breakpoints — clamp() for type/padding, flex-wrap everywhere (nav, CTAs, meta rows, link rows, chips), grids single-column. Experience rows wrap (label column 110px fixed, body flexes at min-width 240px).

## State Management
- `theme` ('dark' | 'light'), persisted to localStorage `kn-theme`, default 'dark'.
- Blog: `activeTag` (default 'All' or from URL); posts are static data (category, title, blurb, href, tags[]).
- Optional flags seen in prototype: show availability badge, show testimonials, show phone.

## Assets
- Google Fonts: Lato (300/400/700 + italics).
- Favicon: inline SVG (purple rounded square + white "K") — embedded in the HTML files.
- Images: none final. The case study has two screenshot placeholders; About has a photo placeholder. Owner to supply.
- Icons: two inline SVGs (sun/moon) in the nav, stroke/fill `currentColor`.

## Files
- `Portfolio Home.dc.html`, `Portfolio Work.dc.html`, `Portfolio Case Study - Mybitstore.dc.html`, `Portfolio About.dc.html`, `Portfolio Blog.dc.html`, `Portfolio Blog Post.dc.html`, `Portfolio Contact.dc.html` — the seven screens (view in a browser; inline styles are the source of truth; logic lives in the `<script data-dc-script>` block at the bottom of each file).
- `support.js` — prototype runtime (ignore for implementation).
- `image-slot.js` — placeholder image component (replace with real images).
