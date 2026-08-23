# Process Scrollytelling Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat `ProcessTeaser` section on the landing page with a scrollytelling module — a pinned line diagram whose emphasis tracks whichever pipeline step the reader has scrolled to.

**Architecture:** The pin is pure CSS (`position: sticky`). A single inline `IntersectionObserver` (<1 KB, `is:inline`, no bundle) writes `data-active="1".."5"` on the module root; all visible change is CSS reacting to that attribute. `src/data/process.ts` is the single source of truth — both the steps column and the diagram's node-to-step mapping derive from it, so they cannot disagree. The module renders complete and readable with no JavaScript at all.

**Tech Stack:** Astro 7 (static, no integrations added), hand-authored inline SVG, plain CSS with `@supports (animation-timeline: view())`, Vitest for the data-integrity test. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-23-process-scrollytelling-design.md`

## Global Constraints

Copied verbatim from `CLAUDE.md` and the spec. Every task's requirements implicitly include this section.

- **Never set `base` in `astro.config.mjs`.** GitHub user site served at the domain root; a base path breaks every asset URL.
- **`public/.nojekyll` must exist.** Do not remove it.
- **Zod schemas live in `src/content/schemas.ts`**, not `src/content.config.ts` — `astro:content` is a virtual module Vitest cannot import. (This plan adds no schemas, but keeps the boundary: `src/data/process.ts` must import nothing from `astro:content`.)
- **Never fabricate** work history, client names, metrics or testimonials.
- **Avoid teal (#64ffda) on navy (#0a0e27), animated starfields and gradient blobs.** The house style is ink on paper.
- **No new npm dependencies.** Not one.
- **Node >= 22.12.0**, npm.
- **Breakpoint values must be literals inside `@media`** — custom properties are not valid in media conditions and fail silently. Add the explanatory comment, as three other files in this repo already do.
- **Quality gates, all must pass:** `npm test`, `npm run check`, lychee link integrity, Lighthouse performance **and** accessibility >= 95 on `/`, `/work/etp/`, `/how-i-build/`, `/resume/`.
- **This repo does not enforce the global 80% coverage gate.** Deliberate, recorded in the original spec section 9. Do not add a coverage threshold.
- **Work on branch `feat/process-scrollytelling`.** It already exists and already holds the spec commit. No direct commits to `main`.

---

### Task 1: Process step data and its integrity test

The five steps and the seven diagram node IDs. This is the single source of truth that Task 2 and Task 3 both read. Written test-first: the test encodes the failure mode the whole design turns on — a diagram node that no step claims can never light up, and one that two steps claim will flicker between tiers.

**Files:**
- Create: `src/data/process.ts`
- Test: `tests/process.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `PIPELINE_NODE_IDS: readonly ['spec','contract','api','web','mobile','tests','ci']`
  - `type PipelineNodeId = (typeof PIPELINE_NODE_IDS)[number]`
  - `interface ProcessStep { id: string; numeral: string; heading: string; body: string; nodes: readonly PipelineNodeId[] }`
  - `processSteps: readonly ProcessStep[]` — exactly 5 entries, in pipeline order

- [ ] **Step 1: Write the failing test**

Create `tests/process.test.ts`. Follows the import style of `tests/schemas.test.ts` (relative path into `src/`, named imports, `describe`/`it`/`expect` from `vitest`).

```ts
import { describe, expect, it } from 'vitest';
import {
  PIPELINE_NODE_IDS,
  processSteps,
  type PipelineNodeId,
} from '../src/data/process';

describe('processSteps', () => {
  it('has exactly five steps', () => {
    expect(processSteps).toHaveLength(5);
  });

  it('gives every step a unique id', () => {
    const ids = processSteps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every step non-empty copy', () => {
    for (const s of processSteps) {
      expect(s.heading.length).toBeGreaterThan(0);
      expect(s.body.length).toBeGreaterThan(0);
    }
  });

  it('numbers steps 01..05 in order', () => {
    expect(processSteps.map((s) => s.numeral)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
    ]);
  });

  it('references only known pipeline nodes', () => {
    const known = new Set<string>(PIPELINE_NODE_IDS);
    for (const s of processSteps) {
      for (const n of s.nodes) {
        expect(known.has(n)).toBe(true);
      }
    }
  });

  // The failure mode this whole design turns on. An unclaimed node can never
  // light up; a doubly-claimed node flickers between tiers as you scroll.
  it('claims every pipeline node exactly once across all steps', () => {
    const claims = new Map<PipelineNodeId, number>();
    for (const s of processSteps) {
      for (const n of s.nodes) {
        claims.set(n, (claims.get(n) ?? 0) + 1);
      }
    }
    for (const id of PIPELINE_NODE_IDS) {
      expect(claims.get(id) ?? 0).toBe(1);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`

Expected: FAIL — the suite cannot resolve `../src/data/process`. Vitest reports a module-resolution error, not an assertion failure. That is the correct starting state.

- [ ] **Step 3: Write the data module**

Create `src/data/process.ts`. Copy is a compression of `/how-i-build/`, deliberately not verbatim — the landing module is a trailer, and the full page remains the long form.

```ts
/**
 * The landing page's compressed pipeline story. The long form lives at
 * /how-i-build/; this is the trailer that links to it.
 *
 * Single source of truth: ProcessScrolly renders the steps column from this
 * array, and PipelineDiagram derives each node's step index from it. The two
 * therefore cannot disagree about how many steps exist or which node belongs
 * to which. tests/process.test.ts enforces that every node is claimed exactly
 * once — an unclaimed node can never light up, a doubly-claimed one flickers.
 */

export const PIPELINE_NODE_IDS = [
  'spec',
  'contract',
  'api',
  'web',
  'mobile',
  'tests',
  'ci',
] as const;

export type PipelineNodeId = (typeof PIPELINE_NODE_IDS)[number];

export interface ProcessStep {
  id: string;
  /** Display only — the steps are an ordered list, not numbered content. */
  numeral: string;
  heading: string;
  body: string;
  nodes: readonly PipelineNodeId[];
}

export const processSteps: readonly ProcessStep[] = [
  {
    id: 'spec',
    numeral: '01',
    heading: 'Every phase starts from a written spec',
    body: 'No phase begins from a chat message. The problem, the decisions taken and the reasons for them are committed to the repository before any implementation starts.',
    nodes: ['spec'],
  },
  {
    id: 'contract',
    numeral: '02',
    heading: 'The contract is generated, never hand-maintained',
    body: 'The OpenAPI specification is generated from the source and the typed client from that specification, so no surface ever writes a response shape down independently — and none can hold a stale one.',
    nodes: ['contract'],
  },
  {
    id: 'parallel',
    numeral: '03',
    heading: 'Surfaces are built in parallel, against that contract',
    body: 'Once a phase’s contract is settled, API, web and mobile are dispatched concurrently against the generated client rather than against each other’s assumptions. This is where the speed comes from.',
    nodes: ['api', 'web', 'mobile'],
  },
  {
    id: 'regression',
    numeral: '04',
    heading: 'Tests remember what broke before',
    body: 'Standing risks carry forward between phases: when a class of bug appears once, it becomes a permanent check that every later phase is tested against.',
    nodes: ['tests'],
  },
  {
    id: 'ci',
    numeral: '05',
    heading: 'CI is gated and cost-controlled',
    body: 'Every pull request runs the tests, regenerates the contract and verifies the build — and is kept cheap enough to run that nobody is tempted to skip it under deadline.',
    nodes: ['ci'],
  },
];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`

Expected: PASS — 6 tests in `tests/process.test.ts`, plus the pre-existing `tests/schemas.test.ts` suite still green.

- [ ] **Step 5: Type-check**

Run: `npm run check`

Expected: 0 errors, 0 warnings.

- [ ] **Step 6: Commit**

```bash
git add src/data/process.ts tests/process.test.ts
git commit -m "Add process step data with node-claim integrity test"
```

---

### Task 2: Pipeline diagram component

The hand-authored inline SVG. Renders complete and fully drawn at all times — geometry never animates. Only *emphasis* changes, driven entirely by the `data-active` attribute an ancestor carries.

**Files:**
- Create: `src/components/process/PipelineDiagram.astro`

**Interfaces:**
- Consumes: `processSteps`, `PipelineNodeId` from `src/data/process.ts` (Task 1).
- Produces: a component taking no props. Emits `<svg class="pipeline" aria-hidden="true" focusable="false">` whose styleable descendants each carry `data-step="1".."5"`. It styles nothing itself that depends on active state — `ProcessScrolly` (Task 3) owns the `[data-active]` rules, because the attribute lives on its root.

- [ ] **Step 1: Create the component**

Create `src/components/process/PipelineDiagram.astro`.

Node rectangles derive `data-step` from `processSteps` so the mapping is never written twice. Edges carry `data-step` literally — they are geometry, not content, and an edge takes the tier of its destination node.

```astro
---
import { processSteps, type PipelineNodeId } from '../../data/process';

/**
 * node id -> 1-based step index, derived from the data rather than restated.
 * tests/process.test.ts guarantees this map is total and unambiguous.
 */
const stepOf = Object.fromEntries(
  processSteps.flatMap((s, i) => s.nodes.map((n) => [n, i + 1])),
) as Record<PipelineNodeId, number>;

const nodes: { id: PipelineNodeId; x: number; y: number; w: number; label: string }[] = [
  { id: 'spec',     x: 85,  y: 20,  w: 110, label: 'spec' },
  { id: 'contract', x: 85,  y: 86,  w: 110, label: 'contract' },
  { id: 'api',      x: 5,   y: 170, w: 70,  label: 'API' },
  { id: 'web',      x: 105, y: 170, w: 70,  label: 'web' },
  { id: 'mobile',   x: 205, y: 170, w: 70,  label: 'mobile' },
  { id: 'tests',    x: 85,  y: 254, w: 110, label: 'tests' },
  { id: 'ci',       x: 85,  y: 320, w: 110, label: 'CI' },
];

const H = 34; // node height, uniform
---

<svg
  class="pipeline"
  viewBox="0 0 280 374"
  role="presentation"
  aria-hidden="true"
  focusable="false"
>
  <g class="edges" fill="none" stroke-linecap="square">
    <!-- spec -> contract -->
    <path data-step={stepOf.contract} d="M140 54 V86" />

    <!-- contract -> fork -> three surfaces -->
    <path data-step={stepOf.api} d="M140 120 V150 M40 150 H240 M40 150 V170" />
    <path data-step={stepOf.web} d="M140 150 V170" />
    <path data-step={stepOf.mobile} d="M240 150 V170" />

    <!-- three surfaces -> converge -> tests -->
    <path data-step={stepOf.tests} d="M40 204 V234 M140 204 V234 M240 204 V234 M40 234 H240 M140 234 V254" />

    <!-- tests -> CI -->
    <path data-step={stepOf.ci} d="M140 288 V320" />
  </g>

  <g class="nodes">
    {
      nodes.map((n) => (
        <g data-step={stepOf[n.id]}>
          <rect x={n.x} y={n.y} width={n.w} height={H} rx="3" />
          <text x={n.x + n.w / 2} y={n.y + H / 2} dominant-baseline="central" text-anchor="middle">
            {n.label}
          </text>
        </g>
      ))
    }
  </g>
</svg>

<style>
  .pipeline {
    inline-size: 100%;
    block-size: auto;
    max-inline-size: 20rem;
  }

  /* Base tier is "future": the faintest. ProcessScrolly promotes elements to
     past/active via [data-active] rules. Ink on paper — no fills, no
     gradients, no glow. */
  .edges path {
    stroke: var(--c-rule);
    stroke-width: 1;
    transition: stroke 200ms ease, stroke-width 200ms ease;
  }

  .nodes rect {
    fill: none;
    stroke: var(--c-rule);
    stroke-width: 1;
    transition: stroke 200ms ease, stroke-width 200ms ease;
  }

  .nodes text {
    fill: var(--c-rule);
    font-family: var(--f-mono);
    font-size: 11px;
    transition: fill 200ms ease;
  }

  /* Emphasis is a discrete state change, not vestibular motion, so it is
     kept under reduced motion — only the easing between states goes. */
  @media (prefers-reduced-motion: reduce) {
    .edges path,
    .nodes rect,
    .nodes text {
      transition: none;
    }
  }
</style>
```

- [ ] **Step 2: Type-check**

Run: `npm run check`

Expected: 0 errors. If `stepOf[n.id]` errors, the `as Record<PipelineNodeId, number>` assertion is missing — `Object.fromEntries` widens to `{ [k: string]: number }` under `astro/tsconfigs/strict`.

- [ ] **Step 3: Commit**

```bash
git add src/components/process/PipelineDiagram.astro
git commit -m "Add pipeline diagram SVG for process module"
```

---

### Task 3: Scrollytelling module shell — static, no JavaScript

The two-column layout, the sticky pane, the steps column, and every `[data-active]` emphasis rule. **No script in this task.** At the end of it the module is complete, readable and correct with JavaScript disabled — permanently stuck on step 1's emphasis. That is the fallback state the whole design promises, so it gets built and verified first, on its own.

This task also swaps it into the landing page and deletes the component it supersedes.

**Files:**
- Create: `src/components/process/ProcessScrolly.astro`
- Delete: `src/components/ProcessTeaser.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `processSteps` from `src/data/process.ts` (Task 1); `PipelineDiagram` (Task 2).
- Produces: `<section id="process-scrolly" data-active="1">` containing five `<article data-step-index="1".."5">` elements. Task 4's observer depends on exactly those two hooks — the id and `data-step-index`.

- [ ] **Step 1: Create the component**

Create `src/components/process/ProcessScrolly.astro`.

```astro
---
import PipelineDiagram from './PipelineDiagram.astro';
import { processSteps } from '../../data/process';
---

<section
  id="process-scrolly"
  class="page section"
  data-active="1"
  aria-labelledby="process-heading"
>
  <h2 id="process-heading" class="rule-head">How I build</h2>

  <div class="layout">
    <div class="pane">
      <PipelineDiagram />
    </div>

    <div class="steps">
      {
        processSteps.map((s, i) => (
          <article class="step" data-step-index={i + 1}>
            <p class="numeral">{s.numeral}</p>
            <h3>{s.heading}</h3>
            <p class="body">{s.body}</p>
          </article>
        ))
      }
      <p class="more"><a href="/how-i-build/">See the full process →</a></p>
    </div>
  </div>
</section>

<style>
  .section { padding-block-end: var(--s-16); }

  .layout {
    display: grid;
    gap: var(--s-8);
  }

  .pane {
    display: flex;
    justify-content: center;
  }

  /* 60rem breakpoint kept inline: custom properties are not valid inside
     @media conditions (`@media (min-width: var(--bp))` silently never
     matches), so this value cannot be tokenised. Below it the pin is
     dropped entirely — a sticky half-screen on a phone is cramped and the
     scroll story does not survive the reduced height. */
  @media (min-width: 60rem) {
    .layout {
      grid-template-columns: 20rem 1fr;
      gap: var(--s-16);
      align-items: start;
    }

    .pane {
      position: sticky;
      top: var(--s-16);
      /* Reserved height: the sticky pane must not be able to shift the steps
         column, or CLS drops the Lighthouse score below the 95 gate. */
      block-size: 26rem;
      align-items: center;
    }
  }

  .steps {
    display: grid;
    gap: var(--s-16);
  }

  .step { max-width: var(--w-prose); }

  .numeral {
    font-family: var(--f-mono);
    font-size: var(--t-sm);
    color: var(--c-muted);
    margin-block-end: var(--s-2);
  }

  .step h3 {
    font-size: var(--t-lg);
    margin-block-end: var(--s-3);
  }

  .body { color: var(--c-muted); }

  .more {
    font-family: var(--f-sans);
    font-weight: 600;
  }

  /* ---- Emphasis -------------------------------------------------------
     Three tiers. "future" is the components' own base styling, so only
     past and active are declared here. CSS cannot compare two numbers, so
     the past set is enumerated: for data-active=N, every step < N. Ten
     selectors, and that is the whole of it. */

  /* past — reached, now behind you */
  .section[data-active='2'] [data-step='1'],
  .section[data-active='3'] [data-step='1'],
  .section[data-active='3'] [data-step='2'],
  .section[data-active='4'] [data-step='1'],
  .section[data-active='4'] [data-step='2'],
  .section[data-active='4'] [data-step='3'],
  .section[data-active='5'] [data-step='1'],
  .section[data-active='5'] [data-step='2'],
  .section[data-active='5'] [data-step='3'],
  .section[data-active='5'] [data-step='4'] {
    --tier-stroke: var(--c-muted);
    --tier-width: 1;
    --tier-text: var(--c-muted);
  }

  /* active */
  .section[data-active='1'] [data-step='1'],
  .section[data-active='2'] [data-step='2'],
  .section[data-active='3'] [data-step='3'],
  .section[data-active='4'] [data-step='4'],
  .section[data-active='5'] [data-step='5'] {
    --tier-stroke: var(--c-fg);
    --tier-width: 2;
    --tier-text: var(--c-accent);
  }

  /* Apply whatever tier was set. :global is required — these elements are
     rendered by PipelineDiagram, so Astro's scoping attribute is not on
     them. */
  .section :global(.pipeline [data-step] path),
  .section :global(.pipeline path[data-step]),
  .section :global(.pipeline [data-step] rect) {
    stroke: var(--tier-stroke, var(--c-rule));
    stroke-width: var(--tier-width, 1);
  }

  .section :global(.pipeline [data-step] text) {
    fill: var(--tier-text, var(--c-rule));
  }

  /* Steps themselves dim when not active, so the reader's eye is where the
     diagram's emphasis is. */
  .step { transition: opacity 200ms ease; }

  @media (min-width: 60rem) {
    .section[data-active='1'] .step:not([data-step-index='1']),
    .section[data-active='2'] .step:not([data-step-index='2']),
    .section[data-active='3'] .step:not([data-step-index='3']),
    .section[data-active='4'] .step:not([data-step-index='4']),
    .section[data-active='5'] .step:not([data-step-index='5']) {
      opacity: 0.55;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .step { transition: none; }
  }
</style>
```

- [ ] **Step 2: Swap it into the landing page**

Modify `src/pages/index.astro`. Replace the `ProcessTeaser` import and usage:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import ServiceList from '../components/ServiceList.astro';
import FeaturedProject from '../components/FeaturedProject.astro';
import ProcessScrolly from '../components/process/ProcessScrolly.astro';
import About from '../components/About.astro';
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
  <ProcessScrolly />
  <About />
  <ClosingCta />
</BaseLayout>
```

Note the section order is unchanged — the scrollytelling module sits exactly where the teaser did.

- [ ] **Step 3: Delete the superseded component**

```bash
git rm src/components/ProcessTeaser.astro
```

It had exactly one consumer (`index.astro`), now migrated. Confirm nothing else references it:

Run: `grep -rn "ProcessTeaser" src/`

Expected: no output.

- [ ] **Step 4: Verify the no-JavaScript fallback by hand**

Run: `npm run dev`

In the browser at `http://localhost:4321/`, **with JavaScript disabled in devtools**:

- all five steps are present, readable, in order
- the diagram renders complete — all seven nodes and every edge drawn
- step 1 and the `spec` node are emphasised; everything else is faint
- the pane pins on a wide viewport and does not pin below 60rem
- nothing overlaps or clips at 375px, 768px and 1440px widths

This is the state the design promises when the script is absent. It gets verified before the script exists so a later failure cannot hide here.

- [ ] **Step 5: Type-check and test**

Run: `npm run check && npm test`

Expected: 0 errors; all tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A src/components src/pages/index.astro
git commit -m "Add static scrollytelling module, replacing process teaser"
```

---

### Task 4: The observer, and the constraint it amends

Adds the only JavaScript on the site. Because this spends a property the repo documents in two places, the documentation is amended in the same commit — leaving a now-false claim in the repo would be worse than the script itself.

**Files:**
- Modify: `src/components/process/ProcessScrolly.astro`
- Modify: `src/styles/tokens.css:63-65`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: the `#process-scrolly` id and `data-step-index` attributes from Task 3.
- Produces: no exports. Runtime behaviour only — sets `data-active` on the module root.

- [ ] **Step 1: Add the inline script**

Append to `src/components/process/ProcessScrolly.astro`, after the `<style>` block.

`is:inline` is required: it stops Astro bundling this into a separate module request. At ~450 bytes the request would cost more than the bytes.

```astro
<script is:inline>
  // Progressive enhancement only. Absent, failed or unsupported, the module
  // stays on the data-active="1" it ships with in the markup: complete and
  // readable, just without emphasis tracking. It never clears the active
  // step, only sets it — so a fast scroll that leaves no step inside the
  // band holds the last good value rather than blanking.
  (() => {
    const root = document.getElementById('process-scrolly');
    if (!root || !('IntersectionObserver' in window)) return;

    // Below 60rem the pane is not sticky (see the matching @media in this
    // component), so there is nothing for the emphasis to track.
    const wide = window.matchMedia('(min-width: 60rem)');

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) root.dataset.active = e.target.dataset.stepIndex;
        }
      },
      // Collapse the viewport to a narrow band across the middle: a step
      // becomes active as it crosses the reader's line of sight.
      { rootMargin: '-45% 0px -45% 0px' },
    );

    const steps = root.querySelectorAll('[data-step-index]');
    const sync = () => {
      if (wide.matches) {
        steps.forEach((s) => io.observe(s));
      } else {
        io.disconnect();
        root.dataset.active = '1';
      }
    };

    sync();
    wide.addEventListener('change', sync);
  })();
</script>
```

- [ ] **Step 2: Amend the tokens.css comment**

Modify `src/styles/tokens.css`. The dark-palette comment currently claims the site ships zero JavaScript. Replace that comment block with:

```css
/* Palette — dark. Driven by the OS preference alone: there is no theme
   toggle. The site ships one inline script (~450 bytes, no bundle) for the
   landing page's process module and nothing else, so adding a toggle later
   still means adding `:root[data-theme='dark']` overrides here plus a
   control. */
```

- [ ] **Step 3: Amend CLAUDE.md**

Two edits.

Under **Stack**, replace the `No server, no database, no analytics.` sentence with:

```markdown
Astro 7 · MDX · Vitest · GitHub Actions · GitHub Pages. No server, no database,
no analytics. One inline script (~450 bytes, no bundle) drives the landing
page's process module; every other page ships zero JavaScript. Node >= 22.12.0,
npm.
```

Under **Visual design**, append:

```markdown
The landing page's "How I build" section is a scrollytelling module
(`src/components/process/`): a CSS-sticky pipeline diagram whose emphasis is
tracked by an inline IntersectionObserver. It is progressive enhancement — with
the script absent the module renders complete and readable, stuck on step one.
Design: `docs/superpowers/specs/2026-08-23-process-scrollytelling-design.md`.
```

- [ ] **Step 4: Verify tracking by hand**

Run: `npm run dev`

At `http://localhost:4321/`, with JavaScript **enabled**:

- scrolling through the module advances emphasis 1 → 2 → 3 → 4 → 5, and back down again in reverse
- on step 3, all three of `API`, `web` and `mobile` are emphasised together, and the fork edges with them
- scrolling fast never leaves the diagram blank — emphasis holds on the last step reached
- resizing across 60rem re-syncs: below it the pane un-pins and emphasis resets to step 1; above it tracking resumes
- check both colour schemes (devtools → Rendering → emulate `prefers-color-scheme`)
- check `prefers-reduced-motion: reduce` — emphasis still tracks, but snaps instead of easing

- [ ] **Step 5: Type-check and test**

Run: `npm run check && npm test`

Expected: 0 errors; all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/process/ProcessScrolly.astro src/styles/tokens.css CLAUDE.md
git commit -m "Add step-tracking observer and amend the zero-JS constraint"
```

---

### Task 5: Reveal-on-scroll utility

The gentle motion for the landing page's five other sections. Zero JavaScript — CSS scroll-driven animation only.

**The single highest-consequence detail in this change lives here.** The `opacity: 0` start state must sit *inside* `@supports (animation-timeline: view())`. Outside it, any browser without scroll-driven animation support renders the entire landing page permanently blank.

**Files:**
- Create: `src/styles/motion.css`
- Modify: `src/styles/global.css:1`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: nothing.
- Produces: a `.reveal` class, available globally.

- [ ] **Step 1: Create the utility**

Create `src/styles/motion.css`.

The spec (section 8) described this as a `prefers-reduced-motion: reduce` reset. It is implemented instead as a `no-preference` gate, which delivers the same contract more safely: reduced-motion users never receive the `opacity: 0` start state at all, rather than receiving it and having it undone. Same guarantee, one fewer way to get it wrong.

```css
/* Reveal-on-scroll for landing-page sections.
 *
 * CRITICAL: the opacity:0 start state lives INSIDE @supports on purpose.
 * Moved outside, any browser lacking scroll-driven animation support would
 * render the whole landing page permanently blank. It must fail visible.
 *
 * The reduced-motion gate is `no-preference` rather than a `reduce` reset for
 * the same reason: those users never get the hidden start state at all.
 *
 * Note that global.css's blanket `animation-duration: 0.01ms !important`
 * under reduced motion does NOT cover this. That neutralises time-based
 * animation; a scroll-linked animation has no meaningful duration.
 */

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      opacity: 0;
      transform: translateY(0.75rem);
      animation: reveal-in linear both;
      animation-timeline: view();
      animation-range: entry 10% cover 22%;
    }
  }
}

/* Transform and opacity only — never a layout-affecting property, or CLS
   drops the Lighthouse score below the 95 gate. */
@keyframes reveal-in {
  to {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 2: Import it**

Modify `src/styles/global.css`. The file currently opens with `@import './tokens.css';`. Make the first two lines:

```css
@import './tokens.css';
@import './motion.css';
```

CSS `@import` rules must precede all other rules, so both stay at the top.

- [ ] **Step 3: Apply to the landing page's other sections**

Modify `src/pages/index.astro`. Add `class="reveal"` to the five sections other than the process module. `Hero` is deliberately excluded — it is above the fold, and revealing it would animate the first thing a visitor sees.

```astro
  <Hero />
  <ServiceList class="reveal" />
  <FeaturedProject class="reveal" />
  <ProcessScrolly class="reveal" />
  <About class="reveal" />
  <ClosingCta class="reveal" />
```

This differs from the spec's literal wording, which said "the five other sections" — read strictly, that would include `Hero` and exclude `ProcessScrolly`. Revealing the hero is wrong: it is the first thing a visitor sees and would animate on load. The set below is five sections either way.

Each of those five components must forward the class to its root `<section>`. For each of `ServiceList.astro`, `FeaturedProject.astro`, `About.astro`, `ClosingCta.astro` and `ProcessScrolly.astro`, add to the frontmatter:

```astro
const { class: className } = Astro.props;
```

and add `class:list={['page', 'section', className]}` to the root `<section>`, replacing its existing `class="page section"`. `ProcessScrolly`'s root already has `id` and `data-active` — keep both and change only its class attribute.

- [ ] **Step 4: Verify it fails visible**

Run: `npm run dev`

In Chrome devtools, this is verified two ways and **both must pass**:

1. Normal load — sections rise and fade as they enter the viewport, once each, and stay visible after.
2. Emulate no support: in the Console, run
   `document.querySelectorAll('.reveal').forEach(e => e.style.animation = 'none')`
   then reload-free scroll. Every section must be **visible**, not blank. If anything is invisible, the `opacity: 0` has escaped the `@supports` block — stop and fix before continuing.

Also check `prefers-reduced-motion: reduce` (devtools → Rendering): all sections visible immediately, no movement.

- [ ] **Step 5: Type-check and test**

Run: `npm run check && npm test`

Expected: 0 errors; all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/styles/motion.css src/styles/global.css src/pages/index.astro src/components
git commit -m "Add reveal-on-scroll utility for landing sections"
```

---

### Task 6: Centralise the section-heading composite

A refactor, not a restyle. `CLAUDE.md` records this rule as copy-pasted across four files; the new module needs the same treatment and would otherwise become a fifth copy.

**Rendered output must be unchanged on all four affected pages.** Any visual diff is a bug in the migration.

The trap: `ProseLayout.astro` is **not** a fourth identical copy. It deliberately omits `margin-block-end`, because prose vertical rhythm comes from `.prose > * + *`, and it targets MDX-rendered output via `.body :global(h2)` — so it cannot consume a utility class, since MDX headings carry no class of ours. Flattening the four into one rule would silently add `margin-block-end: var(--s-8)` to every heading on `/how-i-build/` and `/work/etp/`.

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/ExperienceTimeline.astro`
- Modify: `src/components/SkillsMatrix.astro`
- Modify: `src/pages/resume.astro`
- Modify: `src/layouts/ProseLayout.astro`

**Interfaces:**
- Consumes: nothing.
- Produces: a `.rule-head` class and a `.prose-body h2` rule, both global. `ProcessScrolly` (Task 3) already applies `class="rule-head"` to its `h2` and depends on this task landing.

- [ ] **Step 1: Capture the before state**

```bash
npm run build
cp -r dist ../portfolio-dist-before
```

This is the baseline the migration is checked against in Step 7. `../portfolio-dist-before` sits outside the repo, so it cannot be committed by accident.

- [ ] **Step 2: Add the shared rule to global.css**

Modify `src/styles/global.css`. Add after the existing `.prose > * + *` rule:

```css
/* Section-heading composite. Shared by four call sites; was copy-pasted
   across all of them before. `.rule-head` is opted into by class;
   `.prose-body h2` is a descendant selector because ProseLayout renders
   MDX output, whose headings carry no class of ours. */
.rule-head,
.prose-body h2 {
  font-size: var(--t-xl);
  margin-block: var(--s-16) var(--s-8);
  padding-block-start: var(--s-6);
  border-block-start: 1px solid var(--c-rule);
}

/* Prose supplies its own trailing rhythm via `.prose > * + *`, so the
   composite's bottom margin is deliberately dropped here. Preserving this
   is what keeps /how-i-build/ and /work/etp/ pixel-identical. */
.prose-body h2 {
  margin-block-end: 0;
}
```

- [ ] **Step 3: Migrate ExperienceTimeline**

Modify `src/components/ExperienceTimeline.astro`. Add `class="rule-head"` to its `<h2>`, and **delete** this rule from its `<style>` block:

```css
  h2 {
    font-size: var(--t-xl);
    margin-block: var(--s-16) var(--s-8);
    padding-block-start: var(--s-6);
    border-block-start: 1px solid var(--c-rule);
  }
```

Leave the rest of the style block untouched — `h3 { font-size: var(--t-lg); }` and everything else stays.

- [ ] **Step 4: Migrate SkillsMatrix**

Modify `src/components/SkillsMatrix.astro`. Add `class="rule-head"` to its `<h2>`, and delete the identical four-property `h2` rule from its `<style>` block. Everything else stays.

- [ ] **Step 5: Migrate resume.astro**

Modify `src/pages/resume.astro`. Add `class="rule-head"` to **every** `<h2>` on the page, and delete the identical four-property `h2` rule from its `<style>` block.

Leave the `h3` rule, the `@media not print` block and its explanatory comment exactly as they are — that comment documents a specificity trap that is still live.

- [ ] **Step 6: Migrate ProseLayout**

Modify `src/layouts/ProseLayout.astro`. Add `prose-body` to the `.body` element's class — it becomes `class="body prose-body"` — and delete this rule from its `<style>` block:

```css
  .body :global(h2) {
    font-size: var(--t-xl);
    margin-block-start: var(--s-16);
    padding-block-start: var(--s-6);
    border-block-start: 1px solid var(--c-rule);
  }
```

Leave `.body :global(h3)`, `blockquote`, `.note` and the list rules untouched.

- [ ] **Step 7: Verify output is unchanged**

```bash
npm run build
diff -r ../portfolio-dist-before/ dist/ | head -40
```

Expected: differences confined to `/index.html` and hashed `_astro/` asset filenames — those are Tasks 1–5 landing, not this one.

**`resume/index.html`, `how-i-build/index.html` and `work/etp/index.html` must show no meaningful diff beyond the class attributes added in Steps 3–6 and the stylesheet hash.** If computed spacing changed on any of them, this migration has a bug — most likely the `.prose-body h2 { margin-block-end: 0 }` rule is missing or is being outranked.

Then confirm visually. Run `npm run dev` and compare `/resume/`, `/how-i-build/` and `/work/etp/` against the pre-migration build. Heading spacing, the top rule above each heading, and the gap below it must all look identical.

- [ ] **Step 8: Clean up the baseline**

```bash
rm -rf ../portfolio-dist-before
```

- [ ] **Step 9: Update the CLAUDE.md note**

Modify `CLAUDE.md`. Under **Visual design**, the paragraph describing duplicated composites is now partly stale. Replace the section-heading sentence so it reads:

```markdown
Token *values* (palette, type scale, spacing) live in `src/styles/tokens.css`
— changing a colour, size or spacing step touches that file only. The
section-heading composite is centralised in `src/styles/global.css` as
`.rule-head` (opt in by class) and `.prose-body h2` (descendant selector,
because MDX output carries no class of ours; it deliberately drops the
composite's bottom margin, since prose rhythm comes from `.prose > * + *`).
The `.btn` rule is still duplicated between `Hero.astro` and
`ClosingCta.astro` — a redesign of the button, not just its tokens, has to
touch both.
```

- [ ] **Step 10: Type-check and test**

Run: `npm run check && npm test`

Expected: 0 errors; all tests pass.

- [ ] **Step 11: Commit**

```bash
git add -A src CLAUDE.md
git commit -m "Centralise section-heading composite in global.css"
```

---

### Task 7: Full gate verification

Everything is built. This runs the gates CI will run, plus the manual matrix that no gate covers, before opening the PR.

**Files:** none modified unless a gate fails.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: a merge-ready branch.

- [ ] **Step 1: Run the automated gates**

```bash
npm test && npm run check && npm run build
```

Expected: all tests pass, 0 type errors, build succeeds.

- [ ] **Step 2: Confirm the .nojekyll guard survived**

```bash
ls dist/.nojekyll && ls dist/_astro/ | head
```

Expected: `.nojekyll` present in `dist/`. The landing page now carries enough CSS that `_astro/` should exist rather than being inlined — but per `CLAUDE.md`, its absence on any one page is not itself a fault. `.nojekyll` being missing **is**.

- [ ] **Step 3: Run Lighthouse locally**

```bash
npx --yes @lhci/cli autorun
```

Expected: performance and accessibility >= 95 on all four URLs.

**If performance fails, the cause is almost certainly CLS**, and the two mitigations are the first things to check: the sticky pane's reserved `block-size: 26rem`, and that `.reveal` animates only `opacity` and `transform`. Do not fix a CLS failure by removing the reveal — fix the property that shifts layout.

- [ ] **Step 4: Manual verification matrix**

Run `npm run dev` and confirm every cell. None of this is covered by an automated gate, which is why it is enumerated.

| Condition | Expectation |
|---|---|
| Wide (>= 60rem), JS on | Pane pins; emphasis tracks 1→5 and back |
| Wide, JS off | Diagram complete, step 1 emphasised, all copy readable |
| Narrow (< 60rem) | No pin; diagram once above the steps; steps read as a list |
| Resize across 60rem | Re-syncs cleanly, no stuck or blank state |
| Light scheme | Ink-on-paper; three tiers clearly distinguishable |
| Dark scheme | Same, via `currentColor`/tokens — no washed-out or invisible tier |
| `prefers-reduced-motion: reduce` | No reveal movement; emphasis snaps rather than eases; nothing hidden |
| Scroll-driven animation unsupported (Step 4 of Task 5) | Every section **visible** |
| Keyboard tab through the page | Focus never enters or is trapped by the sticky pane |
| Step 3 active | `API`, `web` and `mobile` emphasised together with their fork edges |

- [ ] **Step 5: Open the pull request**

```bash
git push -u origin feat/process-scrollytelling
gh pr create --title "Add process scrollytelling module to landing page" --body "$(cat <<'EOF'
Replaces the flat `ProcessTeaser` section with a scrollytelling module: a
CSS-sticky pipeline diagram whose emphasis tracks the reader's scroll position
through five pipeline steps.

Design: `docs/superpowers/specs/2026-08-23-process-scrollytelling-design.md`
Plan: `docs/superpowers/plans/2026-08-23-process-scrollytelling.md`

## Notable

- **Spends the zero-JavaScript property**, deliberately, for this one section.
  ~450 bytes inline, no bundle. `tokens.css` and `CLAUDE.md` amended in the
  same change rather than left claiming something untrue.
- **Progressive enhancement is the contract.** Script absent, failed or
  unsupported all land on the same result: the module renders complete and
  readable, stuck on step one. Verified with JS disabled.
- **Section-heading composite centralised** into `global.css`. `ProseLayout`
  was a near-copy, not an identical one — it drops the composite's bottom
  margin because prose rhythm supplies it. Preserved explicitly so
  `/how-i-build/` and `/work/etp/` render unchanged.
- The `.btn` duplication between `Hero` and `ClosingCta` is untouched — out of
  scope for this change.

## Verification

`npm test`, `npm run check`, `npm run build`, Lighthouse >= 95 on all four
URLs, plus the manual matrix in Task 7 of the plan: both breakpoints, both
colour schemes, reduced motion, JS disabled, and scroll-driven animation
unsupported.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Notes for the executor

- **Task 3 before Task 4, always.** The static fallback is the design's core promise; building and verifying it before the script exists means a later regression cannot hide behind working JavaScript.
- **Expect one temporary cosmetic gap, between Tasks 3 and 6.** Task 3 puts `class="rule-head"` on the new module's `h2`, but Task 6 is what defines that class. In between, that one heading renders without its top rule and margins. This is expected and is not grounds to reject Task 3. It closes in Task 6 Step 2. Do not "fix" it by adding a local copy of the composite — creating a fifth copy is the exact thing Task 6 exists to prevent.
- **Task 6 is a refactor.** If any of `/resume/`, `/how-i-build/` or `/work/etp/` renders differently afterwards, that is a bug, not an improvement.
- **The `@supports` placement in Task 5 is not stylistic.** Getting it wrong blanks the landing page in any browser lacking scroll-driven animation support.
- **Add no npm dependencies.** If a task seems to need one, the task is being read wrong.
