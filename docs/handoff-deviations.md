# Handoff deviations

`docs/handoff/` is the visual source of truth. This file records every place the implementation
intentionally departs from it, and why. Anything not listed here should match the handoff exactly.

## Resolved by `docs/plan.md` (plan wins)

| Handoff                                                           | Implementation                                                                               | Authority   |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------- |
| Handoff README recommends shadcn/ui                               | Tailwind-only, no shadcn/ui, no shared UI package                                            | plan §1, §2 |
| `?tag=Company%20work` — raw labels in the URL                     | `?tag=company-work` — lowercase slugs, human labels in UI                                    | plan §3     |
| `href="#"` on "Live demo ↗" for the shipping and banking projects | Action hidden entirely until a real URL exists                                               | plan §1     |
| `href="#"` on the featured blog card and 3 of 4 post links        | Featured card omitted when `blogPage.featuredPost` is absent; no placeholder posts published | plan §1, §3 |
| Testimonials rendered with placeholder quotes                     | Section hidden until verified quotes exist                                                   | plan §1     |
| Phone `+233 24 920 3351` shown (`showPhone` defaults true)        | Hidden by default, pending an explicit content decision                                      | plan §1     |
| "Draft" labels on every blog post                                 | Never rendered; only published Sanity documents reach the public site                        | plan §1     |
| Contact submits via `mailto:` from a `<div>` grid                 | Real `<form>` posting to a Server Action, Turnstile + honeypot, Resend delivery              | plan §5     |
| Blog filter state via `history.replaceState`                      | `nuqs` with `history: "replace"`, `clearOnDefault: true`, canonical always `/blog`           | plan §3, §4 |

## Internal inconsistencies in the handoff (normalized)

The seven screens disagree with each other in three places. Each is normalized to the majority
form, since the plan treats nav and footer as global chrome.

1. **Three different footers.** Home, Work, About, Blog, and Blog Post use the four-item link
   footer (email · github.com/gitdela · LinkedIn · Accra, Ghana). Contact instead uses a single
   line, "Kenneth Dela Nartey — Accra, Ghana". The Mybitstore case study has **no footer at all**.
   → The four-item link footer renders on every page.

2. **Contact placeholder color is a hardcoded hex.** `input::placeholder` is set to `#8a8a94`,
   which is the _light_ theme's `--soft`. It does not re-resolve in dark mode.
   → Uses `var(--soft)`.

3. **The case study's `main` has no bottom padding** while every other page sets `64px`.
   → Uses the same `64px` bottom padding.

## Values the handoff README under-specifies

Taken from the markup, which the README names as authoritative.

- **Accent bar spacing is not one value.** The 30×3px bar's `margin-bottom` varies by context:
  24px (Home Skills, Home Featured Work, About Experience), 20px (About Skills, Contact
  Elsewhere), 14px (case-study sections, blog-post `h2`s), 8px (Home testimonials, where an
  italic note follows). Implemented as a spacing variant, not a constant.
- **`main` padding-top varies by page.** Home `clamp(48px,10vw,88px)`; Work, About, Blog, and Blog
  Post `clamp(44px,9vw,72px)`; case study `clamp(40px,8vw,64px)`.
- **Skills group gap differs.** Home `20px`, About `18px`.
- **Blog list articles carry a divider** — `border-bottom:1px solid var(--line)` with
  `padding-bottom:28px` — which the README omits.
- **Body type is set on the page wrapper**, not `body`: 16px / line-height 1.65.

## Content derived from the prototype

The prototype's static arrays seed the initial Sanity content model:

- **Categories**: React, SEO, Career, Build log.
- **Tags**: Frontend, Mybitstore, Company work, Career, Backend, Fullstack, Personal project.
- **Prototype toggles map to CMS state** rather than props: `showAvailability` →
  `profile.availability`, `showTestimonials` → whether `homePage` has testimonial references,
  `showPhone` → hidden pending a content decision.
