# Personal Portfolio Site — Design

**Date**: 2026-08-01
**Owner**: Althen Lim Zi Xuan
**Repo**: [althenlimzixuan.github.io](https://github.com/althenlimzixuan/althenlimzixuan.github.io)
**Status**: Approved — ready for implementation planning

---

## 1. Purpose

A personal site that serves three audiences from one content base, with **freelance client
acquisition leading**. Employment and founder framing are secondary and must remain re-orderable
without a rewrite.

**The site's one job**: get a technical stranger who lands on `/` to book a call.

Secondary jobs, in order: convince a hiring manager the owner ships production systems; hold a
current, presentable resume.

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | **Freelancer-first** positioning | Owner wants inbound client work now. Founder/resume framing survives as sections, not headlines. |
| D2 | **Two exhibits**: ETP case study + delivery-pipeline page | Only one showable project exists. The AI-assisted delivery pipeline is real, differentiating, and needs no new build work. |
| D3 | **Astro**, static, → GitHub Pages | Site is ~90% content. Content collections + MDX fit it; near-zero JS ships a credibility-grade Lighthouse score. |
| D4 | Proof via **depth of writing + annotated walkthrough** | ETP repos stay private. Architecture reasoning is the verification signal. |
| D5 | **Replace** existing template, not revamp it | Existing `index.html` is an unedited AI template with placeholder content. Nothing salvageable. |
| D6 | **Cal.com booking** primary CTA, `mailto:` fallback | Static host has no form backend; booking converts better than a form with no confirmation. |
| D7 | Substitute quality gates for the **80% coverage** standard | Deliberate, scoped deviation — see §9. |
| D8 | Ship a **holding page** before the real build | Live site currently serves placeholder content under the owner's real name. |

### Non-goals (v1)

No CMS. No analytics. No i18n. No custom domain. No blog. No `/work` index page. No `/services`
page. No public ETP repos.

## 3. Content inventory (ground truth)

| Source | Disposition |
|---|---|
| **ETP** — Essential Traveller Planner | Flagship case study. Go/Gin/Wire/GORM/Redis API on Cloud Run, Next.js web on Vercel, React Native/Expo mobile, shared TS API client, generated OpenAPI contract, ADRs, 23 shipped phases. |
| **AI delivery pipeline** | Second exhibit (`/how-i-build`). Spec-driven phases, multi-agent surface fan-out, contract discipline, CI cost controls, tester regression memory. |
| **FS — FoodShaker** | Excluded as an entry; folds into ETP as a feature story. |
| **XTB — Xezio Trader Bot** | Excluded — personal. |
| **BT-2026-IP001** | Excluded — dormant XTB predecessor. |

## 4. Project shape and repo

**Shape B — Single Service** per workspace conventions.

- Working copy: `d:\AI Workshop\PF-Personal Portfolio\`
- GitHub: `althenlimzixuan/althenlimzixuan.github.io` — a **user site**, served at the domain root.
  No Astro `base` path is required, which avoids the asset-rewriting fragility of project-site
  Pages deploys.
- Register in the workspace `CLAUDE.md` Active Projects table.
- Add a single-service `CLAUDE.md` from `~/.claude/templates/single_service_CLAUDE.md`.

### Files to delete

`index.html`, `index_2.html`, `_config.yml` (Jekyll config, carries `twitter_username: jekyll`,
`github_username: jekyll`, and a typo'd `url` ending `.github.com`). `README.MD` is rewritten.

### Git workflow

Feature branch → PR → squash merge. `main` always deployable, no direct commits to `main`.
Branch prefixes `feat/`, `fix/`, `chore/`, `docs/`. Imperative commit messages.

## 5. Site architecture

Conversion landing page with deep sub-pages hanging off it.

| Route | Purpose |
|---|---|
| `/` | The full sales argument in one scroll |
| `/work/etp` | ETP case study — long-form |
| `/how-i-build` | Delivery-pipeline exhibit |
| `/resume` | Experience timeline + skills, print-styled |
| `/404` | Custom, routes back to `/` |

**Why a landing page rather than a multi-page portfolio**: freelancer-first means `/` has exactly
one job, and a landing page does it in one scroll with no navigation decisions imposed on a visitor
who has not yet been sold. It also solves the single-project problem structurally — a landing page
never advertises how many cards are in a grid, whereas a `/work` index with one tile announces the
gap.

### Landing page section order

1. **Hero** — name, one-line positioning, primary CTA "Book a call", secondary "See the work"
2. **What I do** — 3–4 service areas
3. **Proof strip** — stack and "live in production" signals
4. **Featured project** — one, large, deliberately not a grid
5. **How I build** — teaser linking to `/how-i-build`
6. **About** — short
7. **Closing CTA**

## 6. Content model

Four Astro content collections, all Zod-schema-validated so a typo fails the build rather than
shipping.

| Collection | Format | Contents |
|---|---|---|
| `projects` | MDX | One entry (`etp`). Frontmatter: title, tagline, role, period, stack[], liveUrl, status, metrics[], featured |
| `experience` | YAML | Employment history → `/resume` |
| `services` | YAML | Service areas → landing section |
| `writing` | MDX | Empty. Exists so adding `/writing` later is a route file, not a refactor |

Everything is a file in git. Adding a project later is one MDX file and no code changes.

## 7. Exhibit structure

### `/work/etp` — case study

Structured as an engineering argument, not a feature tour:

1. **Problem** — sequencing a group's wishlist into a feasible day-by-day plan is a logistics
   problem, not note-keeping
2. **What was built** — surfaces, stack, scope
3. **Decisions with reasoning** — the section that carries the whole page:
   - Integer minor-units for money, never floats
   - Publish gate with exactly one blocking rule (`out_of_range`); everything else advisory
   - Contract as source of truth, with a generated OpenAPI spec
   - CI cost controls
4. **Annotated walkthrough** — screen recording plus annotated screenshots
5. **Honest limitations**

### `/how-i-build` — pipeline exhibit

Framed commercially — *what this means for a client*: a solo builder delivering multi-surface
systems at a pace that normally requires a team. Covers spec-driven phases, multi-agent fan-out
across surfaces, contract discipline preventing cross-surface drift, and regression memory in the
tester system.

## 8. Demo and proof strategy

**Verified 2026-08-01**: `https://etp-web.vercel.app/` returns `307` to
`https://etp-web-althenlimzixuans-projects.vercel.app/sign-in?callbackUrl=%2F`. Every route bounces
an anonymous visitor to a sign-in wall — email field, password field, Sign in button, "Create one"
link. No marketing content, no guest path, no demo trip.

**Consequence**: the case study must not present a "try it live" CTA that lands on a login form.

**v1 approach**: annotated screen recording plus screenshots of real flows. Ships immediately, needs
zero ETP development, and keeps this project off ETP's critical path.

**Upgrade path** (ETP backlog, not this project): a public landing page, guest/demo access, or
read-only itinerary sharing. When any lands, the case study gains a live CTA — a single MDX edit.

**Separate flag**: the redirect resolves to `etp-web-althenlimzixuans-projects.vercel.app`, Vercel's
personal-scope hostname. If ETP is ever linked to clients it wants a clean domain.

## 9. Quality gates

**Deliberate deviation, scoped to this project only.** The global standard mandates 80% test
coverage enforced in CI. This site has effectively no branching logic; enforcing 80% would produce
hollow tests written to satisfy a number. This deviation is **not** a precedent for API, web, or
mobile work.

Substituted gates, all CI-enforced:

- Build fails on broken internal links
- Build fails on invalid content-collection frontmatter (Zod)
- Lighthouse CI: performance ≥ 95, accessibility ≥ 95
- External link check covering the ETP URL, so it cannot rot silently
- Unit tests on content-collection schemas, where real logic exists

## 10. Build and deploy

Astro static build → GitHub Actions → GitHub Pages.

- Push to `main` builds and deploys
- PRs build without deploying, so a broken build never reaches the live site
- No secrets — nothing here talks to an API

**Critical gotcha**: GitHub Pages runs Jekyll by default, and Jekyll strips directories beginning
with an underscore. Astro emits assets into `_astro/`. Deploying via the GitHub Actions Pages
artifact bypasses Jekyll entirely; a `.nojekyll` file is added as belt-and-braces. This failure mode
is silent — the build succeeds and the site loads unstyled.

## 11. Visual design

The Claude Design output is an **input to implementation, not to this spec**. This spec defines
structure, content and behaviour; the design supplies the visual layer.

- Design tokens (palette, type scale, spacing) live in one CSS custom-properties file, so the visual
  direction can be swapped in one place
- Light and dark themes both required
- If the design lands late, implementation proceeds against a neutral typographic baseline and the
  tokens are replaced — no rework

**Handoff**: a publicly-fetchable URL, or an exported HTML/CSS file at
`d:\AI Workshop\portfolio-design.html`. Required content is the rendered layout plus underlying
markup and styles, so real values can be extracted rather than eyeballed from a screenshot.

**Avoid**: teal (`#64ffda`) on navy (`#0a0e27`), animated starfields, gradient-blob decoration,
stock hero illustrations. The existing template uses this palette; it is the most-cloned developer
portfolio look in circulation and reads as *template* on sight.

## 12. Holding page (ships first)

A single clean page replacing the template, before the real build starts. Name, real positioning
line, ETP mention, email, booking link. Discarded at launch.

Rationale: the live site currently serves "Project One", "Your Name", and
`your.email@example.com` to anyone who searches the owner's name.

## 13. Inputs required from owner

Collected per-section during implementation, not upfront:

- [ ] Work history for `/resume`
- [ ] Service areas and positioning line
- [ ] Cal.com booking link
- [x] Contact email — `althenlim@gmail.com`
- [ ] LinkedIn and GitHub profile URLs
- [ ] ETP walkthrough recording and screenshots
- [ ] Claude Design output (URL or exported file)
- [ ] Headshot / OG image (optional)

## 14. Sequencing

1. Holding page → PR → merge (unblocks the live-site problem immediately)
2. Astro scaffold, tokens, deploy pipeline, quality gates
3. Content collections and schemas
4. Landing page
5. `/work/etp`
6. `/how-i-build`
7. `/resume`
8. Visual design applied from Claude Design output
9. Launch

Steps 4–7 each depend only on the scaffold, so they can proceed as content arrives rather than in
strict order.
