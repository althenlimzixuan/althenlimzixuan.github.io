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

## Typography

Three faces, three jobs, and deliberately **no sans**:

| Role | Face | Where |
|---|---|---|
| Display | Fraunces (self-hosted, variable) | `h1`–`h4` only |
| Text | Source Serif 4 (self-hosted, variable) | all prose |
| Utility | system mono stack | every label, eyebrow, metric, control, nav |

`@font-face` blocks live in `src/styles/fonts.css`; `tokens.css` still owns the
*values* (`--f-display`, `--f-serif`, `--f-mono`). There is no `--f-sans` — mono
carries the utility role instead, because the artifacts of this work are specs,
generated contracts and CI logs, and that is their vernacular. It is also what
keeps the site off the warm-paper-plus-serif look that every portfolio in this
palette lands on.

Hard-won details, all measured rather than assumed:

- **No font `<link rel="preload">`, on reasoning rather than proof.** A
  preload competes with the render-blocking stylesheet and buys little once
  metric-matched fallbacks let text paint correctly-sized immediately. A local
  A/B seemed to confirm it, but **local Lighthouse timing on this machine is
  not trustworthy** — the same build measured LCP 0.9s and 2.1s on consecutive
  runs. Treat performance numbers from `npx lighthouse` here as unusable and
  read CI instead: it runs three passes per URL on a clean runner. CLS and the
  category scores are stable locally; LCP/FCP are not.
- **The metric-matched fallbacks in `fonts.css` are load-bearing.** Their
  `size-adjust` / `ascent-override` numbers were extracted from the upstream
  TTFs' `head`/`hhea`/`OS/2` tables, not guessed. They are what keeps CLS at 0
  through the `font-display: swap`. Do not round or "tidy" them.
- **Fraunces ships with `SOFT` and `WONK` baked at 0 and 1** — sharp terminals,
  wonky letterforms. That is the intended voice, not the family default, and
  pinning the axes also cut the file from 121 KB to 67 KB.
- **No italic face ships.** A Source Serif italic costs 130 KB to style one
  blockquote that is mostly inline code; `ProseLayout` marks blockquotes with
  the accent rule instead. Do not add `font-style: italic` anywhere without
  shipping the face.
- Fonts are latin-only subsets. The `→` in CTAs is not in them — every arrow on
  the site sits in a mono context, where the system mono supplies it.

## Landing page structure

The landing page is one continuous document, not a stack of sections. Two
devices carry that, and they share one motif — a vertical line with nodes on
it:

- **The thread** (`.thread` in `global.css`): a hairline down the left margin,
  ticked where each section begins. It **replaced** the full-width horizontal
  rules that used to separate `ProcessScrolly`, `About` and `ClosingCta` — a
  horizontal rule cuts a page into stacked boxes, a vertical one connects them.
  Do not reintroduce `border-block-start` on a landing section; add `.thread`
  instead. Prose pages and `/resume/` keep their horizontal rules, because they
  are documents rather than a narrative.
- **The hero motif** (`HeroPipeline.astro`): the same fork drawn unlabelled,
  animating once on load. It is the only load-time animation on the site. It is
  allowed where a hero fade-in is not, because it is additive — the hero text is
  readable from first paint and the line draws beside it, withholding nothing.
  Strokes use `pathLength="1"` so one dasharray pair draws every path
  regardless of its real length.

The thread is deliberately **not** a scroll-progress indicator: a bar that
fills as you scroll duplicates the scrollbar and encodes nothing new. Nothing
in it animates, so it needs no JavaScript and has no failure mode.

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
