# Personal Portfolio — althenlimzixuan.github.io

@C:\Users\zixua\.claude\practices\workflow.md
@C:\Users\zixua\.claude\practices\testing.md
@C:\Users\zixua\.claude\practices\devops_cicd.md

<!-- Shape B — Single Service. This file is the git root, so it must import
     everything the session needs; nothing above it loads. -->

<!-- testing.md's "80% minimum, enforced in CI" coverage gate does not apply
     here — see "Quality gates" below for what this repo actually enforces. -->

## What this is

A freelancer-first personal portfolio site. Serves three audiences from one
content base: freelance clients (leading), employers, and anyone wanting a
resume. Static Astro site on GitHub Pages.

Design spec: `docs/superpowers/specs/2026-08-01-personal-portfolio-design.md`
Implementation plan: `docs/superpowers/plans/2026-08-01-personal-portfolio.md`

## Stack

Astro 7 · MDX · Vitest · GitHub Actions · GitHub Pages. No server, no database,
no analytics. One inline script (~1.4 KB, unminified, no bundle) drives the landing
page's process module; every other page ships zero JavaScript. Node >= 22.12.0,
npm.

## Hard constraints

- **Never set `base` in `astro.config.mjs`.** This is a GitHub user site served
  at the domain root; a base path breaks every asset URL.
- **`public/.nojekyll` must exist.** GitHub Pages runs Jekyll by default, which
  strips `_`-prefixed directories — including Astro's `_astro/` when it is
  emitted. The failure is silent: the build succeeds and the site loads
  unstyled. Note that a small page may carry no `_astro/` asset at all —
  Astro's default `inlineStylesheets: 'auto'` inlines small pages' CSS
  directly into a `<style>` block rather than linking a file — so absence of
  `_astro/` on any one page is not itself a problem; the guard still matters
  once a page's assets grow past the inlining threshold.
- **Zod schemas live in `src/content/schemas.ts`**, not in `src/content.config.ts`.
  `astro:content` is a virtual module and cannot be imported by Vitest.
- **Never fabricate** work history, client names, metrics or testimonials. Data
  files ship empty and pages degrade gracefully when content is missing.
- **No live-demo CTA for projects with `livePubliclyBrowsable: false`.** ETP sits
  behind a sign-in wall; sending a prospect there is worse than sending them
  nowhere.

## Quality gates

This project does **not** enforce the global 80% coverage standard — a scoped,
deliberate deviation recorded in spec section 9. It is not a precedent for API,
web or mobile work. Enforced instead, on every PR:

- Schema unit tests (`npm test`)
- `astro check`
- Link integrity across built HTML (lychee)
- Lighthouse performance and accessibility >= 95

## Content model

| Collection | Source | Feeds |
|---|---|---|
| `projects` | `src/content/projects/*.mdx` | `/work/[slug]`, landing feature |
| `services` | `src/data/services.yaml` | Landing services section |
| `experience` | `src/data/experience.yaml` | `/resume` timeline (empty = section hidden) |
| `writing` | `src/content/writing/*.mdx` | Nothing yet; route added when wanted |

Owner identity, contact and CTA config: `src/data/site.ts`. When
`calBookingUrl` is null, every primary CTA falls back to email automatically.

## Visual design

Token *values* (palette, type scale, spacing) live in `src/styles/tokens.css`
— changing a colour, size or spacing step touches that file only. The
section-heading composite is centralised in `src/styles/global.css` as
`.rule-head` (opt in by class) and `.prose-body h2` (descendant selector,
because MDX output carries no class of ours; it deliberately drops the
composite's bottom margin, since prose rhythm comes from `.prose > * + *`).
The `.btn` rule is still duplicated between `Hero.astro` and
`ClosingCta.astro` — a redesign of the button, not just its tokens, has to
touch both.
Avoid teal (#64ffda) on navy (#0a0e27), animated starfields and gradient blobs;
the previous template used that look and it reads as generic on sight.

The landing page's "How I build" section is a scrollytelling module
(`src/components/process/`): a CSS-sticky pipeline diagram whose emphasis is
tracked by an inline IntersectionObserver. It is progressive enhancement — with
the script absent the module renders complete and readable, stuck on step one.
Design: `docs/superpowers/specs/2026-08-23-process-scrollytelling-design.md`.
Gentle reveal-on-scroll is a separate utility, `src/styles/motion.css`'s
`.reveal`, applied to four landing sections (`ServiceList`, `FeaturedProject`,
`About`, `ClosingCta`); its `opacity: 0` start state lives inside
`@supports (animation-timeline: view())` so that browsers without
scroll-driven animation support render the page visible rather than blank.
