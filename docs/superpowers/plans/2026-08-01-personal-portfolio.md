# Personal Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a freelancer-first personal portfolio site in Astro, deployed to GitHub Pages at `althenlimzixuan.github.io`, replacing the existing placeholder template.

**Architecture:** Static Astro site, no server. Content lives in git as MDX and YAML, validated by Zod schemas at build time. One conversion landing page (`/`) plus three deep pages (`/work/etp`, `/how-i-build`, `/resume`). Design tokens are isolated in a single CSS custom-properties file so the visual direction can be swapped without touching components. GitHub Actions builds and deploys; the same workflow gates on link integrity and Lighthouse scores.

**Tech Stack:** Astro 7.1.6, @astrojs/mdx 7.0.5, @astrojs/sitemap 3.7.3, Vitest 4.1.10, npm, GitHub Actions, GitHub Pages.

## Global Constraints

- **Node** `>=22.12.0` (Astro 7 engine requirement). Local verified: v24.14.0.
- **Package manager**: npm. `package-lock.json` MUST be committed — `withastro/action` detects the package manager from the lockfile.
- **Astro config**: `site: 'https://althenlimzixuan.github.io'`. **Do NOT set `base`** — this is a GitHub *user site* served at the domain root. Setting `base` breaks every asset path.
- **`.nojekyll`** MUST exist at `public/.nojekyll`. GitHub Pages runs Jekyll by default and Jekyll strips directories starting with `_`; Astro emits assets into `_astro/`. This failure is silent — build succeeds, site loads unstyled.
- **Content collections config** lives at `src/content.config.ts` (Astro 5+ Content Layer API). Use `glob`/`file` loaders from `astro/loaders` and `z` from `astro/zod`. `astro:content` exports `getCollection`, `getEntry`, `render`.
- **Zod schemas** MUST be defined in `src/content/schemas.ts` (importing `z` from `astro/zod`) and imported by `src/content.config.ts`. Reason: `astro:content` is a virtual module unavailable to Vitest; schemas in a plain module are directly unit-testable.
- **Git**: feature branch → PR → squash merge. Never commit directly to `main`. Branch prefixes `feat/`, `fix/`, `chore/`, `docs/`. Imperative commit messages.
- **Contact email**: `althenlim@gmail.com`. **GitHub**: `althenlimzixuan`.
- **Owner's name**: Althen Lim Zi Xuan.
- **Never fabricate** work history, client names, metrics, or testimonials. Where owner input is missing, the data file ships empty and the page renders gracefully without that section.
- **No coverage percentage gate** on this project (scoped deviation, spec §9). Gates are: link integrity, schema validity, Lighthouse ≥ 95 performance and accessibility.
- **Visual direction to avoid**: teal `#64ffda` on navy `#0a0e27`, animated starfields, gradient blobs, stock hero illustrations.

---

## File Structure

| File | Responsibility |
|---|---|
| `astro.config.mjs` | Site URL, integrations (mdx, sitemap) |
| `package.json` | Deps, scripts |
| `public/.nojekyll` | Prevent Jekyll from stripping `_astro/` |
| `src/data/site.ts` | Single source for owner identity, contact, social, CTA config |
| `src/data/services.yaml` | Service areas → landing section |
| `src/data/experience.yaml` | Employment history → `/resume` |
| `src/content/schemas.ts` | Zod schemas, framework-free and unit-testable |
| `src/content.config.ts` | Collection definitions wiring loaders to schemas |
| `src/content/projects/etp.mdx` | ETP case study body |
| `src/styles/tokens.css` | Design tokens — the one file a visual redesign touches |
| `src/styles/global.css` | Reset, base element styles, print styles |
| `src/layouts/BaseLayout.astro` | HTML shell, meta, theme script, header, footer |
| `src/layouts/ProseLayout.astro` | Long-form reading layout for case study / how-i-build |
| `src/components/*.astro` | Section components — one responsibility each |
| `src/pages/*.astro` | Routes |
| `tests/schemas.test.ts` | Schema unit tests |
| `.github/workflows/deploy.yml` | Build + deploy to Pages |
| `.github/workflows/quality.yml` | Link check + Lighthouse on PRs |
| `.lighthouserc.json` | Lighthouse assertions |

---

## Task 1: Holding page replaces the template

Ships first and independently. The live site currently serves "Project One", "Your Name", and `your.email@example.com` to anyone searching the owner's name. This removes that today, without waiting for the full build.

**Files:**
- Create: `index.html` (replaces existing)
- Delete: `index_2.html`, `_config.yml`
- Modify: `README.MD`

**Interfaces:**
- Consumes: nothing
- Produces: nothing consumed by later tasks. Task 2 deletes `index.html` when Astro takes over.

- [ ] **Step 1: Create the branch**

```bash
cd "d:/AI Workshop/PF-Personal Portfolio"
git checkout main
git checkout -b feat/holding-page
```

- [ ] **Step 2: Delete the Jekyll config and stray file**

```bash
git rm _config.yml index_2.html
```

- [ ] **Step 3: Replace `index.html`**

Overwrite `index.html` entirely with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Althen Lim Zi Xuan — Product Engineer</title>
    <meta
      name="description"
      content="Full-stack product engineer. Go APIs, Next.js web, React Native mobile — shipped end-to-end."
    />
    <style>
      :root {
        color-scheme: light dark;
        --bg: #fbfaf8;
        --fg: #14140f;
        --muted: #5c5c52;
        --rule: #dedad2;
        --accent: #7a2e1e;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #14140f;
          --fg: #f2efe8;
          --muted: #a3a094;
          --rule: #2e2e26;
          --accent: #e8a48a;
        }
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--fg);
        font: 400 clamp(1rem, 0.95rem + 0.3vw, 1.125rem) / 1.65
          ui-serif, Georgia, "Times New Roman", serif;
        display: grid;
        place-items: center;
        min-height: 100svh;
        padding: 2rem;
      }
      main { max-width: 34rem; }
      h1 {
        font-size: clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem);
        line-height: 1.15;
        margin: 0 0 0.75rem;
        letter-spacing: -0.02em;
      }
      p.lede { margin: 0 0 2rem; color: var(--muted); }
      hr { border: 0; border-top: 1px solid var(--rule); margin: 2rem 0; }
      ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
      a { color: var(--accent); text-underline-offset: 0.2em; }
      footer { margin-top: 2rem; color: var(--muted); font-size: 0.875rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>Althen Lim Zi Xuan</h1>
      <p class="lede">
        Product engineer. I build and ship products end-to-end — Go APIs,
        Next.js web apps, React Native mobile.
      </p>
      <hr />
      <p>
        Currently building <strong>ETP</strong>, a group-trip itinerary planner
        running in production: a Go API on Cloud Run, a Next.js web app, and a
        React Native client, all sharing one generated API contract.
      </p>
      <p>A fuller site is in progress. Until then, the quickest way to reach me:</p>
      <ul>
        <li><a href="mailto:althenlim@gmail.com">althenlim@gmail.com</a></li>
        <li>
          <a href="https://github.com/althenlimzixuan">github.com/althenlimzixuan</a>
        </li>
      </ul>
      <footer>Available for freelance and contract work.</footer>
    </main>
  </body>
</html>
```

- [ ] **Step 4: Replace `README.MD`**

```markdown
# althenlimzixuan.github.io

Personal portfolio site for Althen Lim Zi Xuan — product engineer.

Currently serving a holding page. Full Astro build in progress; see
`docs/superpowers/specs/2026-08-01-personal-portfolio-design.md`.

## Contact

althenlim@gmail.com
```

- [ ] **Step 5: Verify no placeholder text survives**

Run:

```bash
grep -riE "your\.email|Project One|Your Name|Portfolio Template|lorem|jekyll" . \
  --exclude-dir=.git --exclude-dir=docs
```

Expected: **no output**. Any hit means template content is still present — fix before committing.

- [ ] **Step 6: Verify it renders**

```bash
npx --yes serve@latest . -l 4321
```

Open `http://localhost:4321`. Confirm: name renders, both colour schemes work (toggle OS dark mode), both links work. Stop the server with Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Replace template with holding page

Removes placeholder content (Project One, Your Name, your.email@example.com)
and the unused Jekyll config from the live site."
```

- [ ] **Step 8: Open and merge the PR**

```bash
git push -u origin feat/holding-page
gh pr create --title "Replace template with holding page" \
  --body "Removes placeholder template content from the live site. Interim page until the Astro build lands."
gh pr merge --squash --delete-branch
```

- [ ] **Step 9: Confirm the deploy**

Wait ~60s, then:

```bash
curl -s https://althenlimzixuan.github.io/ | grep -c "Althen Lim Zi Xuan"
```

Expected: `1` or greater. If `0`, check Pages settings — Settings → Pages → Source must be "Deploy from a branch: main / (root)" at this stage.

---

## Task 2: Astro scaffold and deploy pipeline

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `public/.nojekyll`, `src/pages/index.astro`, `.github/workflows/deploy.yml`
- Delete: `index.html`

**Interfaces:**
- Consumes: nothing
- Produces: a working `npm run build` emitting `dist/`; `npm run dev`; `npm test` (Vitest, used from Task 4)

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull
git checkout -b feat/astro-scaffold
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "althenlimzixuan-portfolio",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "7.1.6",
    "@astrojs/mdx": "7.0.5",
    "@astrojs/sitemap": "3.7.3"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.10",
    "typescript": "6.0.3",
    "vitest": "4.1.10"
  }
}
```

`astro check` is not built in — it requires `@astrojs/check` and `typescript` as
peers, and `npm run check` fails with an install prompt without them. TypeScript
is pinned to `6.0.3` because `@astrojs/check@0.9.10` declares a peer range of
`^5.0.0 || ^6.0.0`; installing TypeScript 7 makes `npm ci` fail on peer
resolution in CI.

- [ ] **Step 3: Create `astro.config.mjs`**

`site` is required for sitemap and canonical URLs. `base` is deliberately absent — see Global Constraints.

```js
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://althenlimzixuan.github.io',
  integrations: [mdx(), sitemap()],
  build: { format: 'directory' },
});
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*.ts", "**/*.tsx", "**/*.astro"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: Create `.gitignore`**

```gitignore
dist/
node_modules/
.astro/
.DS_Store
*.log
.env
.env.production
.lighthouseci/
```

- [ ] **Step 6: Create `public/.nojekyll`**

Create the file empty:

```bash
mkdir -p public && : > public/.nojekyll
```

This file must be committed. Confirm git will track it (it is not matched by `.gitignore`):

```bash
git check-ignore -v public/.nojekyll || echo "NOT IGNORED - good"
```

Expected: `NOT IGNORED - good`

- [ ] **Step 7: Delete the holding page and add a temporary Astro index**

```bash
git rm index.html
mkdir -p src/pages
```

Create `src/pages/index.astro` — replaced entirely in Task 5, present now only so the build has a route:

```astro
---
const name = 'Althen Lim Zi Xuan';
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{name} — Product Engineer</title>
  </head>
  <body>
    <h1>{name}</h1>
    <p>Product engineer. Site in progress.</p>
  </body>
</html>
```

- [ ] **Step 8: Install and build**

```bash
npm install
npm run build
```

Expected: build completes, `dist/index.html` exists.

- [ ] **Step 9: Verify the Jekyll guard survived the build**

```bash
ls -a dist/ | grep nojekyll && ls -d dist/_astro 2>/dev/null || echo "no _astro yet (expected - no assets on this page)"
```

Expected: `.nojekyll` is listed in `dist/`. Files in `public/` are copied verbatim into `dist/`. If `.nojekyll` is missing, the deploy will break silently later — stop and fix.

- [ ] **Step 10: Create `.github/workflows/deploy.yml`**

Action versions verified against latest releases on 2026-08-01.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Build with Astro
        uses: withastro/action@v6
        with:
          node-version: 22

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "Scaffold Astro site and GitHub Pages deploy workflow

Replaces the static holding page with an Astro build. Adds .nojekyll so
Pages does not strip Astro's _astro/ asset directory."
```

- [ ] **Step 12: Switch Pages to GitHub Actions and merge**

```bash
git push -u origin feat/astro-scaffold
gh pr create --title "Scaffold Astro site and deploy workflow" \
  --body "Astro 7 scaffold, Pages deploy via GitHub Actions, .nojekyll guard."
```

**Manual step before merging:** in the repo, go to **Settings → Pages → Build and deployment → Source** and set it to **GitHub Actions**. Leaving it on "Deploy from a branch" means the Action runs but the site never updates.

```bash
gh pr merge --squash --delete-branch
```

- [ ] **Step 13: Verify the live deploy**

```bash
sleep 90
curl -s https://althenlimzixuan.github.io/ | grep -q "Site in progress" \
  && echo "DEPLOYED" || echo "NOT YET - check: gh run list --limit 3"
```

Expected: `DEPLOYED`

---

## Task 3: Design tokens and base layout

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/data/site.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `src/data/site.ts` exports `site` object: `{ name: string; role: string; tagline: string; email: string; github: string; linkedin: string | null; calBookingUrl: string | null; location: string }`
  - `BaseLayout.astro` accepts props `{ title: string; description: string; ogType?: string }` and a default `<slot />`

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull && git checkout -b feat/design-system
```

- [ ] **Step 2: Create `src/data/site.ts`**

`calBookingUrl` and `linkedin` are `null` until the owner supplies them. Components branch on null rather than rendering a dead link — this is real behaviour, not a placeholder.

```ts
export interface SiteConfig {
  name: string;
  role: string;
  tagline: string;
  email: string;
  github: string;
  linkedin: string | null;
  /** Cal.com booking URL. When null, CTAs fall back to email. */
  calBookingUrl: string | null;
  location: string;
}

export const site: SiteConfig = {
  name: 'Althen Lim Zi Xuan',
  role: 'Product Engineer',
  tagline:
    'I build and ship products end-to-end — Go APIs, Next.js web apps, React Native mobile.',
  email: 'althenlim@gmail.com',
  github: 'https://github.com/althenlimzixuan',
  linkedin: null,
  calBookingUrl: null,
  location: 'Singapore',
};

/** Primary CTA target: booking link when configured, email otherwise. */
export function primaryCtaHref(config: SiteConfig = site): string {
  return config.calBookingUrl ?? `mailto:${config.email}`;
}

/** Primary CTA label, matched to whichever target is active. */
export function primaryCtaLabel(config: SiteConfig = site): string {
  return config.calBookingUrl ? 'Book a call' : 'Get in touch';
}
```

- [ ] **Step 3: Create `src/styles/tokens.css`**

This is the single file a visual redesign touches. Neutral typographic baseline — warm off-white and near-black, one restrained accent. Explicitly avoids teal-on-navy.

```css
:root {
  color-scheme: light dark;

  /* Palette — light */
  --c-bg: #fbfaf8;
  --c-surface: #f4f2ed;
  --c-fg: #14140f;
  --c-muted: #5c5c52;
  --c-rule: #dedad2;
  --c-accent: #7a2e1e;
  --c-accent-fg: #fbfaf8;

  /* Type */
  --f-serif: ui-serif, Georgia, "Iowan Old Style", "Times New Roman", serif;
  --f-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --f-mono: ui-monospace, "SFMono-Regular", "Cascadia Mono", Menlo, monospace;

  /* Type scale — fluid, 1.25 ratio */
  --t-xs: 0.79rem;
  --t-sm: 0.889rem;
  --t-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --t-lg: clamp(1.2rem, 1.1rem + 0.5vw, 1.4rem);
  --t-xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
  --t-2xl: clamp(2rem, 1.6rem + 2vw, 3rem);
  --t-3xl: clamp(2.5rem, 1.9rem + 3vw, 4rem);

  /* Spacing — 4px base */
  --s-1: 0.25rem;
  --s-2: 0.5rem;
  --s-3: 0.75rem;
  --s-4: 1rem;
  --s-6: 1.5rem;
  --s-8: 2rem;
  --s-12: 3rem;
  --s-16: 4rem;
  --s-24: 6rem;

  /* Layout */
  --w-prose: 38rem;
  --w-page: 68rem;
  --radius: 4px;
}

/* Palette — dark. Driven by the OS preference alone: there is no theme
   toggle, so the site ships with zero JavaScript. Adding a toggle later
   means adding `:root[data-theme='dark']` overrides here plus a control. */
@media (prefers-color-scheme: dark) {
  :root {
    --c-bg: #14140f;
    --c-surface: #1c1c16;
    --c-fg: #f2efe8;
    --c-muted: #a3a094;
    --c-rule: #2e2e26;
    --c-accent: #e8a48a;
    --c-accent-fg: #14140f;
  }
}
```

- [ ] **Step 4: Create `src/styles/global.css`**

```css
@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  min-height: 100svh;
  background: var(--c-bg);
  color: var(--c-fg);
  font-family: var(--f-serif);
  font-size: var(--t-base);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--f-sans);
  line-height: 1.15;
  letter-spacing: -0.02em;
  text-wrap: balance;
  font-weight: 600;
}

h1 { font-size: var(--t-3xl); }
h2 { font-size: var(--t-2xl); }
h3 { font-size: var(--t-xl); }

p { text-wrap: pretty; }

a {
  color: var(--c-accent);
  text-underline-offset: 0.2em;
  text-decoration-thickness: 1px;
}

a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
  height: auto;
}

code, pre, kbd {
  font-family: var(--f-mono);
  font-size: 0.9em;
}

pre {
  background: var(--c-surface);
  border: 1px solid var(--c-rule);
  border-radius: var(--radius);
  padding: var(--s-4);
  overflow-x: auto;
}

hr {
  border: 0;
  border-top: 1px solid var(--c-rule);
}

.page {
  max-width: var(--w-page);
  margin-inline: auto;
  padding-inline: var(--s-6);
}

.prose {
  max-width: var(--w-prose);
}

.prose > * + * {
  margin-block-start: var(--s-6);
}

.skip-link {
  position: absolute;
  left: -9999px;
}

.skip-link:focus {
  left: var(--s-4);
  top: var(--s-4);
  z-index: 100;
  background: var(--c-bg);
  padding: var(--s-2) var(--s-4);
  border: 1px solid var(--c-rule);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@media print {
  body {
    background: #fff;
    color: #000;
    font-size: 11pt;
  }

  .no-print,
  nav,
  footer.site-footer {
    display: none !important;
  }

  a[href^='http']::after {
    content: ' (' attr(href) ')';
    font-size: 9pt;
    color: #444;
  }

  .page {
    max-width: none;
    padding: 0;
  }
}
```

- [ ] **Step 5: Create `src/components/SiteHeader.astro`**

```astro
---
import { site } from '../data/site';

const { pathname } = Astro.url;
const links = [
  { href: '/work/etp/', label: 'Work' },
  { href: '/how-i-build/', label: 'How I build' },
  { href: '/resume/', label: 'Resume' },
];
const isActive = (href: string) => pathname === href;
---

<header class="site-header no-print">
  <div class="page bar">
    <a href="/" class="wordmark">{site.name}</a>
    <nav aria-label="Main">
      <ul>
        {
          links.map((l) => (
            <li>
              <a href={l.href} aria-current={isActive(l.href) ? 'page' : undefined}>
                {l.label}
              </a>
            </li>
          ))
        }
      </ul>
    </nav>
  </div>
</header>

<style>
  .site-header {
    border-block-end: 1px solid var(--c-rule);
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-4);
    align-items: baseline;
    justify-content: space-between;
    padding-block: var(--s-4);
  }

  .wordmark {
    font-family: var(--f-sans);
    font-weight: 600;
    color: var(--c-fg);
    text-decoration: none;
    letter-spacing: -0.01em;
  }

  nav ul {
    display: flex;
    gap: var(--s-6);
    list-style: none;
    padding: 0;
    font-family: var(--f-sans);
    font-size: var(--t-sm);
  }

  nav a {
    color: var(--c-muted);
    text-decoration: none;
  }

  nav a:hover,
  nav a[aria-current='page'] {
    color: var(--c-fg);
    text-decoration: underline;
  }
</style>
```

- [ ] **Step 6: Create `src/components/SiteFooter.astro`**

```astro
---
import { site } from '../data/site';
const year = new Date().getFullYear();
---

<footer class="site-footer">
  <div class="page inner">
    <p>&copy; {year} {site.name}</p>
    <ul>
      <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
      <li><a href={site.github}>GitHub</a></li>
      {site.linkedin && (
        <li><a href={site.linkedin}>LinkedIn</a></li>
      )}
    </ul>
  </div>
</footer>

<style>
  .site-footer {
    border-block-start: 1px solid var(--c-rule);
    margin-block-start: var(--s-24);
    padding-block: var(--s-8);
    font-family: var(--f-sans);
    font-size: var(--t-sm);
    color: var(--c-muted);
  }

  .inner {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-4);
    justify-content: space-between;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-6);
    list-style: none;
    padding: 0;
  }
</style>
```

- [ ] **Step 7: Create `src/layouts/BaseLayout.astro`**

The inline theme script runs before paint to prevent a flash of the wrong theme. It is the only JavaScript on the site.

```astro
---
import '../styles/global.css';
import SiteHeader from '../components/SiteHeader.astro';
import SiteFooter from '../components/SiteFooter.astro';
import { site } from '../data/site';

interface Props {
  title: string;
  description: string;
  ogType?: string;
}

const { title, description, ogType = 'website' } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={ogType} />
    <meta property="og:url" content={canonical} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="author" content={site.name} />
    <link rel="sitemap" href="/sitemap-index.xml" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main">
      <slot />
    </main>
    <SiteFooter />
  </body>
</html>
```

- [ ] **Step 8: Wire the temporary index to the layout**

Replace `src/pages/index.astro` entirely:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { site } from '../data/site';
---

<BaseLayout title={`${site.name} — ${site.role}`} description={site.tagline}>
  <div class="page">
    <h1>{site.name}</h1>
    <p>{site.tagline}</p>
  </div>
</BaseLayout>
```

- [ ] **Step 9: Build and verify**

```bash
npm run build
```

Expected: build succeeds. Then confirm tokens actually shipped and assets landed where expected:

```bash
ls dist/_astro/ | head
grep -l "c-accent" dist/_astro/*.css
```

Expected: `dist/_astro/` exists and at least one CSS file contains `c-accent`. If `dist/_astro/` is absent, styles are not being emitted — stop and fix.

- [ ] **Step 10: Visual check**

```bash
npm run preview
```

Open `http://localhost:4321`. Confirm: header, name, tagline, footer with email and GitHub (no LinkedIn — it is null), and no console errors. Toggle OS dark mode and confirm colours invert. Ctrl+C.

- [ ] **Step 11: Commit and merge**

```bash
git add -A
git commit -m "Add design tokens, base layout, header and footer

Tokens isolated in src/styles/tokens.css so the visual direction can be
swapped without touching components."
git push -u origin feat/design-system
gh pr create --title "Add design system and base layout" --body "Tokens, global styles, BaseLayout, header, footer. Light and dark themes."
gh pr merge --squash --delete-branch
```

---

## Task 4: Content collections, schemas, and tests

**Files:**
- Create: `src/content/schemas.ts`, `src/content.config.ts`, `src/data/services.yaml`, `src/data/experience.yaml`, `src/content/projects/etp.mdx`, `tests/schemas.test.ts`, `vitest.config.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `schemas.ts` exports `projectSchema`, `serviceSchema`, `experienceSchema`, `writingSchema` (all `z.ZodObject`)
  - Collections named `projects`, `services`, `experience`, `writing`, queryable via `getCollection('projects')` etc.
  - `projects` entry id `etp`

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull && git checkout -b feat/content-collections
```

- [ ] **Step 2: Create `src/content/schemas.ts`**

Framework-free so Vitest can import it directly — `astro:content` is a virtual module and is not resolvable in a plain test runner.

```ts
import { z } from 'astro/zod';

export const projectSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  stack: z.array(z.string()).min(1),
  liveUrl: z.string().url().nullable(),
  /** Whether liveUrl is explorable without signing in. Drives CTA copy. */
  livePubliclyBrowsable: z.boolean(),
  status: z.enum(['active', 'shipped', 'paused', 'archived']),
  metrics: z
    .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
    .default([]),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
});

export const serviceSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  detail: z.array(z.string().min(1)).min(1),
  order: z.number().int(),
});

export const experienceSchema = z.object({
  organisation: z.string().min(1),
  title: z.string().min(1),
  start: z.string().regex(/^\d{4}-\d{2}$/, 'Expected YYYY-MM'),
  /** null means current role. */
  end: z.string().regex(/^\d{4}-\d{2}$/, 'Expected YYYY-MM').nullable(),
  summary: z.string().min(1),
  highlights: z.array(z.string().min(1)).default([]),
  stack: z.array(z.string()).default([]),
});

export const writingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pubDate: z.coerce.date(),
  draft: z.boolean().default(false),
});

export type Project = z.infer<typeof projectSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Experience = z.infer<typeof experienceSchema>;
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 4: Write the failing tests**

Create `tests/schemas.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  experienceSchema,
  projectSchema,
  serviceSchema,
} from '../src/content/schemas';

const validProject = {
  title: 'ETP',
  tagline: 'Group-trip itinerary planner',
  role: 'Solo — product, API, web, mobile',
  period: '2026',
  stack: ['Go', 'Next.js'],
  liveUrl: 'https://etp-web.vercel.app/',
  livePubliclyBrowsable: false,
  status: 'active',
};

describe('projectSchema', () => {
  it('accepts a valid project and applies defaults', () => {
    const parsed = projectSchema.parse(validProject);
    expect(parsed.metrics).toEqual([]);
    expect(parsed.featured).toBe(false);
    expect(parsed.order).toBe(0);
  });

  it('rejects an empty stack', () => {
    expect(() => projectSchema.parse({ ...validProject, stack: [] })).toThrow();
  });

  it('rejects a non-URL liveUrl', () => {
    expect(() =>
      projectSchema.parse({ ...validProject, liveUrl: 'etp-web.vercel.app' }),
    ).toThrow();
  });

  it('allows a null liveUrl for projects with nothing deployed', () => {
    expect(projectSchema.parse({ ...validProject, liveUrl: null }).liveUrl).toBeNull();
  });

  it('rejects an unknown status', () => {
    expect(() =>
      projectSchema.parse({ ...validProject, status: 'in-progress' }),
    ).toThrow();
  });
});

describe('experienceSchema', () => {
  const valid = {
    organisation: 'Example Pte Ltd',
    title: 'Engineer',
    start: '2024-01',
    end: null,
    summary: 'Did the work.',
  };

  it('accepts a current role with a null end date', () => {
    expect(experienceSchema.parse(valid).end).toBeNull();
  });

  it('rejects a malformed start date', () => {
    expect(() => experienceSchema.parse({ ...valid, start: '2024' })).toThrow();
  });

  it('defaults highlights and stack to empty arrays', () => {
    const parsed = experienceSchema.parse(valid);
    expect(parsed.highlights).toEqual([]);
    expect(parsed.stack).toEqual([]);
  });
});

describe('serviceSchema', () => {
  it('requires at least one detail line', () => {
    expect(() =>
      serviceSchema.parse({
        title: 'API design',
        summary: 'Contract-first APIs.',
        detail: [],
        order: 1,
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 5: Run the tests to verify they fail**

Vitest is already in `devDependencies` from Task 2, so no install is needed.

```bash
npm test
```

Expected: 9 tests reported, all passing. The schemas are the implementation and
these tests pin their behaviour, so a pass here is the correct outcome.

To confirm the tests genuinely bite rather than passing vacuously, break one
assumption temporarily:

```bash
sed -i "s/status: z.enum(\['active', 'shipped', 'paused', 'archived'\])/status: z.string()/" src/content/schemas.ts
npm test
```

Expected: **1 failure** — `rejects an unknown status`. Restore it:

```bash
git checkout src/content/schemas.ts 2>/dev/null || sed -i "s/status: z.string()/status: z.enum(['active', 'shipped', 'paused', 'archived'])/" src/content/schemas.ts
npm test
```

Expected: 9 passing.

- [ ] **Step 6: Create `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import {
  experienceSchema,
  projectSchema,
  serviceSchema,
  writingSchema,
} from './content/schemas';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.mdx' }),
  schema: projectSchema,
});

const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.mdx' }),
  schema: writingSchema,
});

const services = defineCollection({
  loader: file('./src/data/services.yaml'),
  schema: serviceSchema,
});

const experience = defineCollection({
  loader: file('./src/data/experience.yaml'),
  schema: experienceSchema,
});

export const collections = { projects, writing, services, experience };
```

- [ ] **Step 7: Create `src/data/services.yaml`**

The `file()` loader requires an `id` on each entry when loading an array.

```yaml
- id: api
  title: Backend APIs in Go
  summary: Contract-first REST APIs that other teams can build against without asking you questions.
  order: 1
  detail:
    - Gin, GORM and Wire, structured the way a team can extend without a rewrite
    - OpenAPI spec generated from the source, so the contract cannot drift from the code
    - RFC 7807 problem responses, URL-versioned routes, explicit handling of 401/403/422/429/503
    - Postgres schema and migrations, Redis where it earns its place

- id: web
  title: Web apps in Next.js
  summary: App Router front ends wired to a real API, deployed and observable.
  order: 2
  detail:
    - Server Components by default, client JavaScript only where interaction demands it
    - Typed API clients generated from the OpenAPI spec — no hand-written fetch wrappers
    - Auth in httpOnly cookies, never localStorage
    - Deployed on Vercel with preview environments per pull request

- id: mobile
  title: Mobile apps in React Native
  summary: Expo apps sharing one API contract with the web surface.
  order: 3
  detail:
    - Expo managed workflow, EAS Build and EAS Submit
    - The same generated API client the web app uses, so the surfaces cannot disagree
    - Offline-tolerant data handling where the product needs it

- id: delivery
  title: Delivery you can audit
  summary: Specs, contracts and CI that make progress visible instead of asserted.
  order: 4
  detail:
    - Written spec and plan before implementation, both committed alongside the code
    - CI gates on tests, contract regeneration and cost controls
    - Architecture decisions recorded as ADRs, so the reasoning survives the decision
```

- [ ] **Step 8: Create `src/data/experience.yaml`**

Ships **empty**. The owner has professional history to add but has not supplied it; fabricating entries is prohibited by Global Constraints. `/resume` renders the section only when entries exist (Task 9).

```yaml
# Employment history. Each entry:
#
# - id: unique-slug
#   organisation: Company Pte Ltd
#   title: Senior Engineer
#   start: "2024-01"        # YYYY-MM
#   end: null               # null = current role, else "YYYY-MM"
#   summary: One or two sentences on scope and ownership.
#   highlights:
#     - Concrete outcome, ideally with a number
#   stack: [Go, PostgreSQL]
#
# Empty until the owner supplies real history — do not invent entries.
[]
```

- [ ] **Step 9: Create `src/content/projects/etp.mdx`**

Frontmatter only for now; the body is written in Task 7.

```mdx
---
title: ETP — Essential Traveller Planner
tagline: Turn a group's scattered wishlist into a day-by-day plan that actually works.
role: Solo — product, API, web, mobile, infrastructure
period: 2026 — present
stack:
  - Go
  - Gin
  - Wire
  - GORM
  - PostgreSQL
  - Redis
  - Next.js
  - React Native
  - Expo
  - TypeScript
  - Cloud Run
  - Vercel
liveUrl: https://etp-web.vercel.app/
livePubliclyBrowsable: false
status: active
featured: true
order: 1
metrics:
  - label: Surfaces shipped
    value: API, web, mobile
  - label: Delivery phases
    value: "23"
  - label: Contract
    value: Generated OpenAPI
  - label: State
    value: Live in production
---

Case study body is written in Task 7.
```

- [ ] **Step 10: Create the empty writing directory**

The collection must resolve even with no entries.

```bash
mkdir -p src/content/writing
: > src/content/writing/.gitkeep
```

- [ ] **Step 11: Verify schemas are enforced at build time**

```bash
npm run build
```

Expected: build succeeds. Now prove the gate actually bites — temporarily break the project frontmatter:

```bash
sed -i 's/^status: active$/status: bogus/' src/content/projects/etp.mdx
npm run build
```

Expected: **build FAILS** with a content-collection validation error naming `status`. Restore it:

```bash
sed -i 's/^status: bogus$/status: active/' src/content/projects/etp.mdx
npm run build
```

Expected: build succeeds. If the broken build passed, schemas are not wired — stop and fix `src/content.config.ts`.

- [ ] **Step 12: Run tests and commit**

```bash
npm test
```

Expected: 9 passed.

```bash
git add -A
git commit -m "Add content collections, schemas and schema tests

Schemas live in a framework-free module so Vitest can exercise them
directly. Experience data ships empty pending real history."
git push -u origin feat/content-collections
gh pr create --title "Add content collections and schemas" --body "projects, services, experience, writing collections with Zod validation and unit tests."
gh pr merge --squash --delete-branch
```

---

## Task 5: Landing page

**Files:**
- Create: `src/components/Hero.astro`, `src/components/ServiceList.astro`, `src/components/FeaturedProject.astro`, `src/components/ProcessTeaser.astro`, `src/components/ClosingCta.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site`, `primaryCtaHref`, `primaryCtaLabel` from `src/data/site.ts`; `getCollection('services')`, `getCollection('projects')`
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull && git checkout -b feat/landing-page
```

- [ ] **Step 2: Create `src/components/Hero.astro`**

```astro
---
import { primaryCtaHref, primaryCtaLabel, site } from '../data/site';
---

<section class="hero page">
  <p class="eyebrow">{site.role} · {site.location}</p>
  <h1>{site.tagline}</h1>
  <p class="lede">
    Most teams can find someone to write code. Fewer can find one person who
    will take a product from an empty repository to something running in
    production — API, web, mobile and the pipeline that ships them.
  </p>
  <div class="actions">
    <a class="btn btn-primary" href={primaryCtaHref()}>{primaryCtaLabel()}</a>
    <a class="btn" href="/work/etp/">See the work</a>
  </div>
</section>

<style>
  .hero {
    padding-block: var(--s-24) var(--s-16);
    max-width: 46rem;
    margin-inline: 0;
    padding-inline: var(--s-6);
  }

  @media (min-width: 72rem) {
    .hero { margin-inline: auto; }
  }

  .eyebrow {
    font-family: var(--f-sans);
    font-size: var(--t-sm);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--c-muted);
    margin-block-end: var(--s-4);
  }

  h1 { margin-block-end: var(--s-6); }

  .lede {
    font-size: var(--t-lg);
    color: var(--c-muted);
    max-width: var(--w-prose);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-4);
    margin-block-start: var(--s-8);
  }

  .btn {
    font-family: var(--f-sans);
    font-size: var(--t-sm);
    font-weight: 600;
    padding: var(--s-3) var(--s-6);
    border: 1px solid var(--c-rule);
    border-radius: var(--radius);
    text-decoration: none;
    color: var(--c-fg);
  }

  .btn:hover { border-color: var(--c-accent); }

  .btn-primary {
    background: var(--c-accent);
    border-color: var(--c-accent);
    color: var(--c-accent-fg);
  }
</style>
```

- [ ] **Step 3: Create `src/components/ServiceList.astro`**

```astro
---
import { getCollection } from 'astro:content';

const services = (await getCollection('services')).sort(
  (a, b) => a.data.order - b.data.order,
);
---

<section class="page section" aria-labelledby="services-heading">
  <h2 id="services-heading">What I do</h2>
  <ul class="grid">
    {
      services.map((s) => (
        <li>
          <h3>{s.data.title}</h3>
          <p class="summary">{s.data.summary}</p>
          <ul class="detail">
            {s.data.detail.map((d) => <li>{d}</li>)}
          </ul>
        </li>
      ))
    }
  </ul>
</section>

<style>
  .section { padding-block: var(--s-16); }
  h2 { margin-block-end: var(--s-12); }

  .grid {
    display: grid;
    gap: var(--s-12);
    grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
    list-style: none;
    padding: 0;
  }

  .grid > li {
    border-block-start: 2px solid var(--c-fg);
    padding-block-start: var(--s-4);
  }

  h3 {
    font-size: var(--t-lg);
    margin-block-end: var(--s-3);
  }

  .summary {
    color: var(--c-muted);
    margin-block-end: var(--s-4);
  }

  .detail {
    list-style: none;
    padding: 0;
    font-size: var(--t-sm);
    font-family: var(--f-sans);
    display: grid;
    gap: var(--s-2);
  }

  .detail li {
    padding-inline-start: var(--s-4);
    position: relative;
    color: var(--c-muted);
  }

  .detail li::before {
    content: '—';
    position: absolute;
    left: 0;
  }
</style>
```

- [ ] **Step 4: Create `src/components/FeaturedProject.astro`**

One project, presented large and deliberately — not a grid with empty slots.

```astro
---
import { getCollection } from 'astro:content';

const featured = (await getCollection('projects'))
  .filter((p) => p.data.featured)
  .sort((a, b) => a.data.order - b.data.order)[0];

if (!featured) {
  throw new Error(
    'No featured project found. At least one entry in src/content/projects must set featured: true.',
  );
}

const { data, id } = featured;
---

<section class="page section" aria-labelledby="work-heading">
  <h2 id="work-heading">Selected work</h2>

  <article class="feature">
    <header>
      <h3><a href={`/work/${id}/`}>{data.title}</a></h3>
      <p class="tagline">{data.tagline}</p>
    </header>

    <dl class="metrics">
      {
        data.metrics.map((m) => (
          <div>
            <dt>{m.label}</dt>
            <dd>{m.value}</dd>
          </div>
        ))
      }
    </dl>

    <p class="role">{data.role} · {data.period}</p>

    <ul class="stack">
      {data.stack.map((s) => <li>{s}</li>)}
    </ul>

    <p class="more">
      <a href={`/work/${id}/`}>Read the case study →</a>
    </p>
  </article>
</section>

<style>
  .section { padding-block: var(--s-16); }
  h2 { margin-block-end: var(--s-12); }

  .feature {
    border: 1px solid var(--c-rule);
    border-radius: var(--radius);
    padding: var(--s-8);
    background: var(--c-surface);
  }

  h3 { font-size: var(--t-2xl); }
  h3 a { color: var(--c-fg); text-decoration: none; }
  h3 a:hover { text-decoration: underline; }

  .tagline {
    font-size: var(--t-lg);
    color: var(--c-muted);
    margin-block-start: var(--s-3);
    max-width: var(--w-prose);
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: var(--s-6);
    margin-block: var(--s-8);
    padding-block: var(--s-6);
    border-block: 1px solid var(--c-rule);
  }

  dt {
    font-family: var(--f-sans);
    font-size: var(--t-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--c-muted);
  }

  dd {
    font-family: var(--f-sans);
    font-size: var(--t-lg);
    font-weight: 600;
    margin: var(--s-1) 0 0;
  }

  .role {
    font-family: var(--f-sans);
    font-size: var(--t-sm);
    color: var(--c-muted);
  }

  .stack {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2);
    list-style: none;
    padding: 0;
    margin-block-start: var(--s-4);
  }

  .stack li {
    font-family: var(--f-mono);
    font-size: var(--t-xs);
    border: 1px solid var(--c-rule);
    border-radius: var(--radius);
    padding: var(--s-1) var(--s-2);
    color: var(--c-muted);
  }

  .more {
    margin-block-start: var(--s-8);
    font-family: var(--f-sans);
    font-weight: 600;
  }
</style>
```

- [ ] **Step 5: Create `src/components/ProcessTeaser.astro`**

```astro
---
---

<section class="page section" aria-labelledby="process-heading">
  <h2 id="process-heading">How I build</h2>
  <div class="prose">
    <p>
      One person shipping an API, a web app and a mobile client should be slower
      than a team. The reason it isn't is the pipeline: every phase starts from a
      written spec, the API contract is generated from the source rather than
      maintained by hand, and each surface is implemented against that contract
      by a separate agent working in parallel.
    </p>
    <p>
      The effect a client cares about is narrow and specific — surfaces do not
      drift apart, regressions are caught by tests that remember what broke last
      time, and the reasoning behind each decision is committed next to the code
      that implements it.
    </p>
    <p class="more"><a href="/how-i-build/">See the full process →</a></p>
  </div>
</section>

<style>
  .section {
    padding-block: var(--s-16);
    border-block-start: 1px solid var(--c-rule);
  }

  h2 { margin-block-end: var(--s-8); }

  .more {
    font-family: var(--f-sans);
    font-weight: 600;
  }
</style>
```

- [ ] **Step 6: Create `src/components/ClosingCta.astro`**

```astro
---
import { primaryCtaHref, primaryCtaLabel, site } from '../data/site';

const hasBooking = site.calBookingUrl !== null;
---

<section class="page section" aria-labelledby="cta-heading">
  <div class="inner">
    <h2 id="cta-heading">Have something to build?</h2>
    <p>
      I take on a small number of engagements at a time — usually a product that
      needs to get from nothing to production, or an existing system that needs a
      surface added without the contract falling apart.
    </p>
    <p class="actions">
      <a class="btn btn-primary" href={primaryCtaHref()}>{primaryCtaLabel()}</a>
      {hasBooking && <a class="btn" href={`mailto:${site.email}`}>Email instead</a>}
    </p>
  </div>
</section>

<style>
  .section {
    padding-block: var(--s-24);
    border-block-start: 1px solid var(--c-rule);
  }

  .inner { max-width: var(--w-prose); }
  h2 { margin-block-end: var(--s-6); }
  p { color: var(--c-muted); }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-4);
    margin-block-start: var(--s-8);
  }

  .btn {
    font-family: var(--f-sans);
    font-size: var(--t-sm);
    font-weight: 600;
    padding: var(--s-3) var(--s-6);
    border: 1px solid var(--c-rule);
    border-radius: var(--radius);
    text-decoration: none;
    color: var(--c-fg);
  }

  .btn-primary {
    background: var(--c-accent);
    border-color: var(--c-accent);
    color: var(--c-accent-fg);
  }
</style>
```

- [ ] **Step 7: Replace `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import ServiceList from '../components/ServiceList.astro';
import FeaturedProject from '../components/FeaturedProject.astro';
import ProcessTeaser from '../components/ProcessTeaser.astro';
import ClosingCta from '../components/ClosingCta.astro';
import { site } from '../data/site';
---

<BaseLayout
  title={`${site.name} — ${site.role}`}
  description="Freelance product engineer. Go APIs, Next.js web apps, React Native mobile — built and shipped end-to-end."
>
  <Hero />
  <ServiceList />
  <FeaturedProject />
  <ProcessTeaser />
  <ClosingCta />
</BaseLayout>
```

- [ ] **Step 8: Build and verify section order**

```bash
npm run build
```

Expected: success. Then confirm every section rendered in the intended order:

```bash
grep -o 'id="[a-z-]*heading"' dist/index.html
```

Expected, in this exact order:

```
id="services-heading"
id="work-heading"
id="process-heading"
id="cta-heading"
```

- [ ] **Step 9: Verify the CTA falls back to email**

`calBookingUrl` is still `null`, so the primary CTA must be a mailto link:

```bash
grep -c 'href="mailto:althenlim@gmail.com"' dist/index.html
```

Expected: `2` or more (hero CTA, closing CTA, footer). If `0`, `primaryCtaHref()` is not wired.

- [ ] **Step 10: Visual check**

```bash
npm run preview
```

Open `http://localhost:4321`. Confirm: no horizontal scrollbar at 360px width (use browser device toolbar), all four service cards render, the featured project shows four metrics, and both themes look right. Ctrl+C.

- [ ] **Step 11: Commit and merge**

```bash
git add -A
git commit -m "Build conversion landing page

Hero, services, featured project, process teaser and closing CTA.
CTAs fall back to email until a booking URL is configured."
git push -u origin feat/landing-page
gh pr create --title "Build landing page" --body "Conversion-first landing page assembled from section components."
gh pr merge --squash --delete-branch
```

---

## Task 6: Quality gates in CI

Added now that there is a real page to measure. Applies to every task after this one.

**Files:**
- Create: `.github/workflows/quality.yml`, `.lighthouserc.json`, `.lycheeignore`

**Interfaces:**
- Consumes: `npm run build` producing `dist/`
- Produces: PR-blocking gates on link integrity, schema tests and Lighthouse scores

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull && git checkout -b chore/quality-gates
```

- [ ] **Step 2: Create `.lighthouserc.json`**

Thresholds match spec §9: performance and accessibility ≥ 95.

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 1
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

- [ ] **Step 3: Create `.lycheeignore`**

```
# Cal.com booking URL is not configured yet; nothing to check.
# Add exclusions here only with a stated reason.
```

- [ ] **Step 4: Create `.github/workflows/quality.yml`**

Action versions verified against latest releases on 2026-08-01.

```yaml
name: Quality

on:
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Set up Node
        uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run schema tests
        run: npm test

      - name: Type and content check
        run: npm run check

      - name: Build
        run: npm run build

      - name: Check links
        uses: lycheeverse/lychee-action@v2.9.0
        with:
          args: >-
            --no-progress
            --include-fragments
            --accept 200,206,301,302,307,308
            --max-retries 2
            --exclude-path dist/sitemap-index.xml
            --exclude-path dist/sitemap-0.xml
            'dist/**/*.html'
          fail: true

      - name: Lighthouse
        uses: treosh/lighthouse-ci-action@12.6.2
        with:
          configPath: ./.lighthouserc.json
          uploadArtifacts: true
          temporaryPublicStorage: true
```

- [ ] **Step 5: Verify the link checker locally before trusting CI**

```bash
npm run build
npx --yes lychee --no-progress --include-fragments 'dist/**/*.html'
```

Expected: all links OK. The ETP URL returns a 307 redirect to a sign-in page — that is a live, valid response and passes with the `--accept` list above. If it reports errors on internal links, fix them now; that is exactly what this gate exists to catch.

- [ ] **Step 6: Commit and open the PR**

```bash
git add -A
git commit -m "Add CI quality gates

Schema tests, astro check, link integrity and Lighthouse thresholds
(performance and accessibility >= 95) run on every pull request."
git push -u origin chore/quality-gates
gh pr create --title "Add CI quality gates" --body "Replaces the 80% coverage gate with link, schema and Lighthouse checks. See spec section 9."
```

- [ ] **Step 7: Watch the gate actually run, then merge**

```bash
gh pr checks --watch
```

Expected: all checks pass. If Lighthouse fails on accessibility, fix the reported issue rather than lowering the threshold. Then:

```bash
gh pr merge --squash --delete-branch
```

---

## Task 7: ETP case study

**Files:**
- Create: `src/layouts/ProseLayout.astro`, `src/pages/work/[...slug].astro`
- Modify: `src/content/projects/etp.mdx` (body)

**Interfaces:**
- Consumes: `getCollection('projects')`, `render(entry)` from `astro:content`; `BaseLayout`
- Produces: route `/work/etp/`

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull && git checkout -b feat/etp-case-study
```

- [ ] **Step 2: Create `src/layouts/ProseLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  description: string;
  eyebrow?: string;
  lede?: string;
}

const { title, description, eyebrow, lede } = Astro.props;
---

<BaseLayout title={title} description={description} ogType="article">
  <article class="page">
    <header class="head">
      {eyebrow && <p class="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {lede && <p class="lede">{lede}</p>}
    </header>
    <div class="prose body">
      <slot />
    </div>
  </article>
</BaseLayout>

<style>
  .head {
    padding-block: var(--s-16) var(--s-8);
    max-width: 46rem;
  }

  .eyebrow {
    font-family: var(--f-sans);
    font-size: var(--t-sm);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--c-muted);
    margin-block-end: var(--s-4);
  }

  .lede {
    font-size: var(--t-lg);
    color: var(--c-muted);
    margin-block-start: var(--s-6);
  }

  .body {
    padding-block-end: var(--s-16);
  }

  .body :global(h2) {
    font-size: var(--t-xl);
    margin-block-start: var(--s-16);
    padding-block-start: var(--s-6);
    border-block-start: 1px solid var(--c-rule);
  }

  .body :global(h3) {
    font-size: var(--t-lg);
    margin-block-start: var(--s-8);
  }

  .body :global(blockquote) {
    border-inline-start: 3px solid var(--c-accent);
    padding-inline-start: var(--s-6);
    color: var(--c-muted);
    font-style: italic;
  }

  .body :global(ul),
  .body :global(ol) {
    padding-inline-start: var(--s-6);
    display: grid;
    gap: var(--s-2);
  }
</style>
```

- [ ] **Step 3: Create `src/pages/work/[...slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import ProseLayout from '../../layouts/ProseLayout.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { data } = entry;
---

<ProseLayout
  title={data.title}
  description={data.tagline}
  eyebrow={`${data.role} · ${data.period}`}
  lede={data.tagline}
>
  <Content />
</ProseLayout>
```

- [ ] **Step 4: Write the case study body**

Replace everything below the frontmatter in `src/content/projects/etp.mdx`. Keep the frontmatter exactly as it is.

````mdx
## The problem

Group trips fail at sequencing, not at note-keeping. Everyone can list the
places they want to visit; the hard part is turning that pile into a day-by-day
plan that respects opening hours, travel time between stops, the trip's date
range, and what the group actually agreed to.

Most trip apps are shared notes with a nicer font. ETP treats the itinerary as a
constraint problem and does the logistics work — which is the only part that was
ever difficult.

## What I built

A production system across four surfaces, built solo:

- **API** — Go with Gin, Wire for dependency injection, GORM over PostgreSQL,
  Redis where it earns its place. Deployed to Cloud Run.
- **Web** — Next.js App Router, deployed on Vercel.
- **Mobile** — React Native on Expo.
- **Shared API client** — TypeScript, generated from the OpenAPI spec and
  published to GitHub Packages, consumed identically by web and mobile.

Twenty-three delivery phases shipped. The interesting part is not the stack —
it is four decisions that shaped everything after them.

## Decision 1 — money is never a float

Every monetary amount in the system is an integer in minor units plus an ISO
4217 currency code. There is no floating-point money anywhere, at any layer.

This sounds pedantic until you split a S$100 dinner three ways. In floats you
get three shares that do not sum back to the total, and the discrepancy compounds
every time someone edits an expense. In minor units, splits are exact integers
that are *required* to sum to the total — the invariant is enforceable rather
than aspirational.

The same rule extends to currency conversion. A missing exchange rate is `null`,
never an assumed parity of 1.0. An expense that cannot be converted into the
trip's settlement currency is listed as **excluded, with a reason** — it is never
silently dropped and never counted as zero. A budget that quietly under-reports
because one expense could not be converted is worse than one that admits it is
incomplete.

## Decision 2 — one blocking rule, everything else advisory

The itinerary validator produces conflicts across five rules: date-range
violations, overlapping activities, opening-hours mismatches, tight travel time,
and member-availability clashes.

Exactly one of them blocks publishing: scheduling an activity outside the trip's
date range. Every other rule is a warning.

That ratio was the decision. The obvious design makes all five blocking — the
system is "correct", and unusable. Splitting a group into two parallel activities
for an afternoon is a legitimate plan, not a scheduling error. An organiser who
knows a museum stays open late should not be overruled by a stale opening-hours
record. The validator's job is to surface what the organiser might have missed,
not to substitute its judgement for theirs.

Severity is declared in exactly one place in the codebase. There is no second
list to drift out of sync.

## Decision 3 — the contract is generated, not maintained

Three surfaces consume the same API. The failure mode that kills that setup is
contract drift: the Go handler changes, the spec does not, and the mobile client
is wrong for two weeks before anyone notices.

So the OpenAPI spec is generated from annotations on the Go source, the
TypeScript client is generated from the spec, and both regenerate in the same
pull request as the change. Consumers cannot be wrong about the shape of a
response, because they did not write it down independently.

The precedence chain is explicit and documented:

> Go source → generated `openapi.yaml` → hand-written `API.md` → summary docs

Drift grows with distance from the source, and naming that ordering is what makes
disagreements resolvable rather than a matter of opinion.

This has a limit worth stating. The generated spec is silent on anything the
annotations never declared — conflict-rule severity and trip-member roles are
real, load-bearing concepts that exist only in Go types. Two of those gaps reached
production understanding before being caught, which is why the precedence chain is
written down at all.

## Decision 4 — derive on read, store nothing

There is no balance table. Settlement figures and budget totals are computed
fresh on every read.

The tempting alternative is a cached balances table updated on write. It is
faster and it is a permanent source of bugs: every edit path has to remember to
update it, and the day one path forgets, the numbers are wrong in a way nobody
notices until someone disputes a payment.

Deriving on read costs a query. It buys an invariant — editing a two-week-old
expense changes the very next balance read, with no invalidation logic to get
wrong.

## What it looks like

<p class="note">
  ETP currently requires an account to use, so there is no public demo link. The
  walkthrough below shows the real product.
</p>

Walkthrough and screenshots to be embedded once recorded.

## Honest limitations

- **Travel time is a heuristic**, computed from place coordinates. There is no
  routing provider behind it yet, so it is a heads-up rather than a promise —
  which is exactly why it warns instead of blocking.
- **Assisted scheduling is not shipped.** Activities are placed by hand today;
  preference-aware automatic ordering is designed but not built. That is the core
  differentiator and it is still ahead.
- **No public demo.** Everything is behind authentication, which is a real
  barrier to showing the work and is on the backlog.
- **Bookings do not exist.** Flights, hotels and restaurant reservations are a
  named placeholder in the domain model, not a shipped feature.
````

- [ ] **Step 5: Add the `.note` style to `ProseLayout.astro`**

Insert inside the existing `<style>` block, after the `blockquote` rule:

```css
  .body :global(.note) {
    background: var(--c-surface);
    border: 1px solid var(--c-rule);
    border-radius: var(--radius);
    padding: var(--s-4);
    font-size: var(--t-sm);
    color: var(--c-muted);
  }
```

- [ ] **Step 6: Build and verify the route**

```bash
npm run build
test -f dist/work/etp/index.html && echo "ROUTE OK" || echo "ROUTE MISSING"
```

Expected: `ROUTE OK`

- [ ] **Step 7: Verify no dishonest live-demo CTA slipped in**

`livePubliclyBrowsable` is `false`, so the page must not invite a click through to a login wall:

```bash
grep -iE "try it live|launch the app|view live demo" dist/work/etp/index.html && echo "FAIL - remove misleading CTA" || echo "OK"
```

Expected: `OK`

- [ ] **Step 8: Run the local gates**

```bash
npm test && npm run check
npx --yes lychee --no-progress --include-fragments 'dist/**/*.html'
```

Expected: tests pass, check passes, links OK.

- [ ] **Step 9: Commit and merge**

```bash
git add -A
git commit -m "Add ETP case study

Long-form case study structured around four architecture decisions, with
stated limitations. No live-demo CTA, since the product is behind auth."
git push -u origin feat/etp-case-study
gh pr create --title "Add ETP case study" --body "Prose layout, /work/[...slug] route, and the ETP case study body."
gh pr checks --watch
gh pr merge --squash --delete-branch
```

---

## Task 8: How I build

**Files:**
- Create: `src/pages/how-i-build.astro`

**Interfaces:**
- Consumes: `ProseLayout`, `primaryCtaHref`, `primaryCtaLabel` from `src/data/site.ts`
- Produces: route `/how-i-build/`

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull && git checkout -b feat/how-i-build
```

- [ ] **Step 2: Create `src/pages/how-i-build.astro`**

```astro
---
import ProseLayout from '../layouts/ProseLayout.astro';
import { primaryCtaHref, primaryCtaLabel } from '../data/site';
---

<ProseLayout
  title="How I build"
  description="The delivery pipeline behind shipping an API, a web app and a mobile client solo — specs, generated contracts, parallel implementation and regression memory."
  eyebrow="Process"
  lede="One person shipping three surfaces should be slower than a team. Here is the machinery that makes it not so."
>
  <h2>Every phase starts from a written spec</h2>

  <p>
    No work begins from a chat message. A phase starts with a design document
    that states the problem, the decisions taken and the reasons for them, and it
    is committed to the repository before implementation starts. The
    implementation plan comes next, as a separate document broken into tasks
    small enough to test and review individually.
  </p>

  <p>
    The payoff is not process theatre. It is that six months later the reasoning
    behind a decision is still readable, sitting next to the code that implements
    it — so a change can be evaluated against what was actually intended rather
    than reverse-engineered from the diff.
  </p>

  <h2>The contract is generated, never hand-maintained</h2>

  <p>
    When three surfaces consume one API, the thing that eventually breaks is the
    contract drifting away from the implementation. The defence is to make it
    structurally impossible: the OpenAPI specification is generated from the
    source, the typed client is generated from the specification, and both
    regenerate inside the same pull request as the change that caused them.
  </p>

  <p>
    A surface cannot hold a stale idea of a response shape, because no surface
    ever wrote that shape down independently.
  </p>

  <h2>Surfaces are implemented in parallel, against that contract</h2>

  <p>
    Once the contract for a phase is settled, the API, web and mobile work is
    dispatched concurrently rather than sequentially. Each surface is implemented
    against the generated client, so they are working from the same definition
    rather than from each other's assumptions.
  </p>

  <p>
    This is where most of the speed comes from, and it only works because of the
    previous step. Parallel implementation against a hand-maintained contract just
    produces three surfaces that disagree in three different ways.
  </p>

  <h2>Tests remember what broke before</h2>

  <p>
    Every phase produces a test plan and a test report, and standing risks carry
    forward between phases. When a class of bug appears once — money scale and
    overflow, in one real case — it becomes a permanent item that later phases are
    explicitly checked against.
  </p>

  <p>
    Regression suites usually decay because nobody remembers why a given test
    exists. Attaching each one to the incident that caused it keeps that context
    attached to the test.
  </p>

  <h2>CI is gated and cost-controlled</h2>

  <p>
    Continuous integration runs tests, regenerates the contract and verifies the
    build on every pull request. It is also deliberately cheap to run: a pipeline
    that costs too much per push gets skipped under deadline pressure, and a gate
    that gets skipped is not a gate.
  </p>

  <h2>What this means if you are hiring me</h2>

  <ul>
    <li>
      <strong>You get surfaces that agree with each other.</strong> The API, web
      and mobile clients share one generated contract, so a change lands
      everywhere or fails loudly.
    </li>
    <li>
      <strong>You get the reasoning, not just the code.</strong> Specs and
      decision records are committed alongside the implementation, so the next
      engineer — including a future me — is not archaeology-hunting.
    </li>
    <li>
      <strong>You get a pipeline you can audit.</strong> Progress is visible in
      committed plans and test reports rather than asserted in a status update.
    </li>
    <li>
      <strong>You get one person's judgement applied consistently</strong> across
      backend, frontend, mobile and infrastructure — which is usually where
      handoffs between specialists lose things.
    </li>
  </ul>

  <p class="cta">
    <a href={primaryCtaHref()}>{primaryCtaLabel()} →</a>
  </p>
</ProseLayout>

<style>
  .cta {
    margin-block-start: var(--s-16);
    font-family: var(--f-sans);
    font-weight: 600;
    font-size: var(--t-lg);
  }
</style>
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
test -f dist/how-i-build/index.html && echo "ROUTE OK" || echo "ROUTE MISSING"
```

Expected: `ROUTE OK`

- [ ] **Step 4: Run local gates**

```bash
npm test && npm run check
npx --yes lychee --no-progress --include-fragments 'dist/**/*.html'
```

Expected: all pass.

- [ ] **Step 5: Commit and merge**

```bash
git add -A
git commit -m "Add how-i-build process page

Frames the delivery pipeline as a client-facing argument rather than a
process description."
git push -u origin feat/how-i-build
gh pr create --title "Add how-i-build page" --body "Second exhibit: the delivery pipeline, framed commercially."
gh pr checks --watch
gh pr merge --squash --delete-branch
```

---

## Task 9: Resume

**Files:**
- Create: `src/pages/resume.astro`, `src/components/ExperienceTimeline.astro`, `src/components/SkillsMatrix.astro`

**Interfaces:**
- Consumes: `getCollection('experience')`, `site` from `src/data/site.ts`, `BaseLayout`
- Produces: route `/resume/`

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull && git checkout -b feat/resume
```

- [ ] **Step 2: Create `src/components/ExperienceTimeline.astro`**

Renders nothing when the collection is empty. `experience.yaml` ships empty by design — this component must degrade silently rather than render an empty heading.

```astro
---
import { getCollection } from 'astro:content';

const entries = (await getCollection('experience')).sort((a, b) =>
  b.data.start.localeCompare(a.data.start),
);

const formatMonth = (value: string): string => {
  const [year, month] = value.split('-');
  const names = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${names[Number(month) - 1]} ${year}`;
};

const range = (start: string, end: string | null): string =>
  `${formatMonth(start)} — ${end ? formatMonth(end) : 'Present'}`;
---

{
  entries.length > 0 && (
    <section aria-labelledby="experience-heading">
      <h2 id="experience-heading">Experience</h2>
      <ol class="timeline">
        {entries.map((e) => (
          <li>
            <p class="period">{range(e.data.start, e.data.end)}</p>
            <div>
              <h3>{e.data.title}</h3>
              <p class="org">{e.data.organisation}</p>
              <p class="summary">{e.data.summary}</p>
              {e.data.highlights.length > 0 && (
                <ul class="highlights">
                  {e.data.highlights.map((h) => (
                    <li>{h}</li>
                  ))}
                </ul>
              )}
              {e.data.stack.length > 0 && (
                <p class="stack">{e.data.stack.join(' · ')}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

<style>
  h2 {
    font-size: var(--t-xl);
    margin-block: var(--s-16) var(--s-8);
    padding-block-start: var(--s-6);
    border-block-start: 1px solid var(--c-rule);
  }

  .timeline {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--s-12);
  }

  .timeline > li {
    display: grid;
    gap: var(--s-2) var(--s-8);
    grid-template-columns: 1fr;
  }

  @media (min-width: 48rem) {
    .timeline > li {
      grid-template-columns: 12rem 1fr;
    }
  }

  .period {
    font-family: var(--f-sans);
    font-size: var(--t-sm);
    color: var(--c-muted);
  }

  h3 { font-size: var(--t-lg); }

  .org {
    font-family: var(--f-sans);
    color: var(--c-muted);
    margin-block-end: var(--s-3);
  }

  .highlights {
    margin-block-start: var(--s-3);
    padding-inline-start: var(--s-6);
    display: grid;
    gap: var(--s-2);
  }

  .stack {
    font-family: var(--f-mono);
    font-size: var(--t-xs);
    color: var(--c-muted);
    margin-block-start: var(--s-3);
  }
</style>
```

- [ ] **Step 3: Create `src/components/SkillsMatrix.astro`**

```astro
---
const groups = [
  {
    label: 'Backend',
    items: ['Go', 'Gin', 'Wire', 'GORM', 'PostgreSQL', 'Redis', 'REST', 'OpenAPI'],
  },
  {
    label: 'Web',
    items: ['TypeScript', 'Next.js App Router', 'React', 'Server Components'],
  },
  { label: 'Mobile', items: ['React Native', 'Expo', 'EAS Build'] },
  {
    label: 'Infrastructure',
    items: ['Cloud Run', 'Vercel', 'Docker', 'GitHub Actions', 'CI/CD'],
  },
  {
    label: 'Practice',
    items: [
      'Contract-first APIs',
      'Test-driven development',
      'Architecture decision records',
      'Product ownership',
    ],
  },
];
---

<section aria-labelledby="skills-heading">
  <h2 id="skills-heading">Skills</h2>
  <dl class="matrix">
    {
      groups.map((g) => (
        <div>
          <dt>{g.label}</dt>
          <dd>{g.items.join(' · ')}</dd>
        </div>
      ))
    }
  </dl>
</section>

<style>
  h2 {
    font-size: var(--t-xl);
    margin-block: var(--s-16) var(--s-8);
    padding-block-start: var(--s-6);
    border-block-start: 1px solid var(--c-rule);
  }

  .matrix {
    display: grid;
    gap: var(--s-6);
  }

  .matrix > div {
    display: grid;
    gap: var(--s-1) var(--s-8);
    grid-template-columns: 1fr;
  }

  @media (min-width: 48rem) {
    .matrix > div {
      grid-template-columns: 12rem 1fr;
    }
  }

  dt {
    font-family: var(--f-sans);
    font-size: var(--t-sm);
    font-weight: 600;
    color: var(--c-muted);
  }

  dd { margin: 0; }
</style>
```

- [ ] **Step 4: Create `src/pages/resume.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ExperienceTimeline from '../components/ExperienceTimeline.astro';
import SkillsMatrix from '../components/SkillsMatrix.astro';
import { site } from '../data/site';
---

<BaseLayout
  title={`Resume — ${site.name}`}
  description={`Resume for ${site.name}, ${site.role}. Go, Next.js, React Native, cloud infrastructure.`}
>
  <div class="page resume">
    <header>
      <h1>{site.name}</h1>
      <p class="role">{site.role} · {site.location}</p>
      <ul class="contact">
        <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
        <li><a href={site.github}>github.com/althenlimzixuan</a></li>
        {site.linkedin && <li><a href={site.linkedin}>LinkedIn</a></li>}
      </ul>
      <p class="print-hint no-print">Print or save as PDF with Ctrl/Cmd + P.</p>
    </header>

    <section aria-labelledby="profile-heading">
      <h2 id="profile-heading">Profile</h2>
      <p class="prose">
        Product engineer who takes systems from an empty repository to
        production. Most recently built ETP end-to-end — a Go API on Cloud Run, a
        Next.js web app, and a React Native client, all consuming one generated
        API contract. Comfortable owning the product decision as well as the
        implementation.
      </p>
    </section>

    <section aria-labelledby="selected-heading">
      <h2 id="selected-heading">Selected work</h2>
      <h3>ETP — Essential Traveller Planner</h3>
      <p class="prose">
        Group-trip itinerary planner. Sole engineer across API, web, mobile and
        infrastructure. Integer minor-unit money handling with multi-currency
        settlement, an itinerary validator with a deliberately narrow blocking
        rule, and a generated OpenAPI contract shared by three surfaces.
        23 delivery phases shipped; live in production.
      </p>
      <p><a href="/work/etp/">Read the case study →</a></p>
    </section>

    <ExperienceTimeline />
    <SkillsMatrix />
  </div>
</BaseLayout>

<style>
  .resume {
    max-width: 48rem;
    padding-block: var(--s-16);
  }

  h1 { font-size: var(--t-2xl); }

  .role {
    font-family: var(--f-sans);
    color: var(--c-muted);
    margin-block-start: var(--s-2);
  }

  .contact {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-4) var(--s-6);
    list-style: none;
    padding: 0;
    margin-block-start: var(--s-4);
    font-family: var(--f-sans);
    font-size: var(--t-sm);
  }

  .print-hint {
    font-family: var(--f-sans);
    font-size: var(--t-sm);
    color: var(--c-muted);
    margin-block-start: var(--s-6);
  }

  h2 {
    font-size: var(--t-xl);
    margin-block: var(--s-16) var(--s-8);
    padding-block-start: var(--s-6);
    border-block-start: 1px solid var(--c-rule);
  }

  h3 {
    font-size: var(--t-lg);
    margin-block-end: var(--s-3);
  }

  section p + p { margin-block-start: var(--s-4); }
</style>
```

- [ ] **Step 5: Build and verify the empty-experience path**

```bash
npm run build
test -f dist/resume/index.html && echo "ROUTE OK" || echo "ROUTE MISSING"
grep -c 'id="experience-heading"' dist/resume/index.html
```

Expected: `ROUTE OK`, then `0` — the experience section must be absent while `experience.yaml` is empty. A rendered but empty "Experience" heading is a bug.

- [ ] **Step 6: Verify the populated path before trusting it**

Temporarily add one entry to `src/data/experience.yaml`:

```yaml
- id: temp-check
  organisation: Test Org
  title: Test Role
  start: "2024-01"
  end: null
  summary: Temporary entry to verify rendering.
  highlights:
    - Verified the timeline renders
  stack: [Go]
```

```bash
npm run build
grep -c 'id="experience-heading"' dist/resume/index.html
grep -c "Present" dist/resume/index.html
```

Expected: `1` and `1` — the section appears and a null end date renders as "Present". Then **revert the file to empty**:

```bash
git checkout src/data/experience.yaml
npm run build
grep -c 'id="experience-heading"' dist/resume/index.html
```

Expected: `0`. Do not commit the temporary entry.

- [ ] **Step 7: Verify print styles**

```bash
npm run preview
```

Open `http://localhost:4321/resume/` and press Ctrl/Cmd + P. Confirm in the preview: header nav and site footer are hidden, the "Print or save as PDF" hint is hidden, text is black on white, and external URLs are expanded after their link text. Ctrl+C.

- [ ] **Step 8: Run local gates, commit and merge**

```bash
npm test && npm run check
npx --yes lychee --no-progress --include-fragments 'dist/**/*.html'
git add -A
git commit -m "Add resume page with print styles

Experience timeline renders only when entries exist; experience.yaml
ships empty pending real history."
git push -u origin feat/resume
gh pr create --title "Add resume page" --body "Profile, selected work, experience timeline (empty until supplied) and skills matrix. Print-styled for PDF export."
gh pr checks --watch
gh pr merge --squash --delete-branch
```

---

## Task 10: 404, project registration and documentation

**Files:**
- Create: `src/pages/404.astro`, `CLAUDE.md`
- Modify: `README.MD`, `d:\AI Workshop\CLAUDE.md`

**Interfaces:**
- Consumes: `BaseLayout`, `site`
- Produces: route `/404.html`; workspace registration

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull && git checkout -b chore/404-and-docs
```

- [ ] **Step 2: Create `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { site } from '../data/site';
---

<BaseLayout title="Page not found" description="That page does not exist.">
  <div class="page notfound">
    <p class="code">404</p>
    <h1>That page doesn't exist</h1>
    <p class="lede">
      The link may be out of date, or the page may have moved.
    </p>
    <ul>
      <li><a href="/">Start from the homepage</a></li>
      <li><a href="/work/etp/">Read the ETP case study</a></li>
      <li><a href="/how-i-build/">See how I build</a></li>
      <li><a href={`mailto:${site.email}`}>Email me instead</a></li>
    </ul>
  </div>
</BaseLayout>

<style>
  .notfound {
    padding-block: var(--s-24);
    max-width: var(--w-prose);
  }

  .code {
    font-family: var(--f-mono);
    color: var(--c-muted);
    margin-block-end: var(--s-4);
  }

  .lede {
    color: var(--c-muted);
    margin-block-start: var(--s-4);
  }

  ul {
    list-style: none;
    padding: 0;
    margin-block-start: var(--s-8);
    display: grid;
    gap: var(--s-3);
    font-family: var(--f-sans);
  }
</style>
```

- [ ] **Step 3: Create the project `CLAUDE.md`**

```markdown
# Personal Portfolio — althenlimzixuan.github.io

@C:\Users\zixua\.claude\practices\workflow.md
@C:\Users\zixua\.claude\practices\nextjs_web.md
@C:\Users\zixua\.claude\practices\devops_cicd.md

<!-- Shape B — Single Service. This file is the git root, so it must import
     everything the session needs; nothing above it loads. -->

## What this is

A freelancer-first personal portfolio site. Serves three audiences from one
content base: freelance clients (leading), employers, and anyone wanting a
resume. Static Astro site on GitHub Pages.

Design spec: `docs/superpowers/specs/2026-08-01-personal-portfolio-design.md`
Implementation plan: `docs/superpowers/plans/2026-08-01-personal-portfolio.md`

## Stack

Astro 7 · MDX · Vitest · GitHub Actions · GitHub Pages. No server, no database,
no analytics. Node >= 22.12.0, npm.

## Hard constraints

- **Never set `base` in `astro.config.mjs`.** This is a GitHub user site served
  at the domain root; a base path breaks every asset URL.
- **`public/.nojekyll` must exist.** GitHub Pages runs Jekyll by default, which
  strips `_`-prefixed directories — including Astro's `_astro/`. The failure is
  silent: the build succeeds and the site loads unstyled.
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

All tokens in `src/styles/tokens.css` — a redesign touches that file only.
Avoid teal (#64ffda) on navy (#0a0e27), animated starfields and gradient blobs;
the previous template used that look and it reads as generic on sight.
```

- [ ] **Step 4: Replace `README.MD`**

```markdown
# althenlimzixuan.github.io

Personal portfolio site for Althen Lim Zi Xuan — product engineer.
Freelance-first: case studies, delivery process, and resume.

**Live:** https://althenlimzixuan.github.io

## Stack

Astro 7, MDX content collections, deployed to GitHub Pages via GitHub Actions.
No server, no database, no tracking.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # -> dist/
npm run preview  # serve the built site
npm test         # schema unit tests
npm run check    # astro check
```

Requires Node >= 22.12.0.

## Deploy

Push to `main`. The `Deploy to GitHub Pages` workflow builds and publishes.
Pull requests run the `Quality` workflow (tests, `astro check`, link check,
Lighthouse) but do not deploy.

## Editing content

| To change | Edit |
|---|---|
| Name, contact, booking link, socials | `src/data/site.ts` |
| Service areas | `src/data/services.yaml` |
| Employment history | `src/data/experience.yaml` |
| Case studies | `src/content/projects/*.mdx` |
| Colours, type, spacing | `src/styles/tokens.css` |

Adding a project is one new `.mdx` file — no code changes.

## Contact

althenlim@gmail.com
```

- [ ] **Step 5: Register the project in the workspace registry**

In `d:\AI Workshop\CLAUDE.md`, add this row to the **Active Projects** table, immediately after the `ETP-Essential Traveller Planner` row:

```markdown
| `PF-Personal Portfolio\` | Single Service | Freelance portfolio / resume site (Astro → GitHub Pages) | Active |
```

- [ ] **Step 6: Build and verify everything**

```bash
npm run build
test -f dist/404.html && echo "404 OK" || echo "404 MISSING"
npm test && npm run check
npx --yes lychee --no-progress --include-fragments 'dist/**/*.html'
```

Expected: `404 OK`, tests pass, check passes, links OK.

- [ ] **Step 7: Final sweep for template residue and fabricated content**

```bash
grep -riE "your\.email|Project One|Your Name|Portfolio Template|lorem ipsum|64ffda|0a0e27|temp-check|Test Org" \
  src/ public/ *.md *.MD 2>/dev/null && echo "FAIL - residue found" || echo "CLEAN"
```

Expected: `CLEAN`

- [ ] **Step 8: Commit and merge**

```bash
git add -A
git commit -m "Add 404 page, project CLAUDE.md and README

Registers the project in the workspace registry and documents the
Pages/Jekyll and schema-location constraints."
git push -u origin chore/404-and-docs
gh pr create --title "Add 404, project docs and registry entry" --body "Custom 404, project CLAUDE.md, rewritten README, workspace registration."
gh pr checks --watch
gh pr merge --squash --delete-branch
```

- [ ] **Step 9: Verify the live site end-to-end**

```bash
sleep 90
for p in "" "work/etp/" "how-i-build/" "resume/"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://althenlimzixuan.github.io/$p")
  echo "$code  /$p"
done
curl -s https://althenlimzixuan.github.io/ | grep -q "_astro" \
  && echo "ASSETS OK" || echo "ASSETS MISSING - check .nojekyll"
```

Expected: `200` for all four routes, and `ASSETS OK`. If assets are missing, the Jekyll guard failed — confirm `public/.nojekyll` is committed and Pages source is set to GitHub Actions.

---

## Owner inputs still outstanding

These are the values that turn a working site into a finished one. Each is a
one-line edit; none blocks the build.

| Input | Where it goes | Effect while missing |
|---|---|---|
| Cal.com booking URL | `src/data/site.ts` → `calBookingUrl` | All CTAs fall back to email |
| LinkedIn URL | `src/data/site.ts` → `linkedin` | Link omitted from footer and resume |
| Employment history | `src/data/experience.yaml` | Experience section hidden on `/resume` |
| ETP walkthrough recording | `src/content/projects/etp.mdx`, "What it looks like" | Section reads as pending |
| Claude Design output | `src/styles/tokens.css` | Neutral typographic baseline stands |
| Headshot / OG image | `public/`, referenced in `BaseLayout.astro` | No social preview image |
