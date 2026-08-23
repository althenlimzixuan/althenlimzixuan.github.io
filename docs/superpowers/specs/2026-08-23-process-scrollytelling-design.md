# Process scrollytelling module — design

Date: 2026-08-23
Status: approved for planning
Supersedes: the "How I build" landing-page teaser described in
`2026-08-01-personal-portfolio-design.md`. Everything else in that document
still stands.

## 1. Problem

The landing page is a flat stack of six sections. The one genuinely
differentiating claim on it — one person ships an API, a web app and a mobile
client, in parallel, without the surfaces drifting apart — is currently made in
two paragraphs of prose that a skimming prospect will not read.

That claim has a shape: one spec forks into three concurrent surfaces and
converges on one gate. A shape is better drawn than described.

## 2. Goal and non-goals

**Goal.** Replace the `ProcessTeaser` section with a scrollytelling module: a
pinned line diagram that emphasises the pipeline stage matching whichever step
the reader has scrolled to.

**Non-goals.**

- Restructuring the landing page into a full narrative. The six-section skim
  order is deliberate and stays. A freelance prospect must still be able to
  reach the CTA quickly.
- Scroll-jacking, snap points, or any interference with native scroll speed.
- Motion on `/work/[slug]`, `/resume` or `/how-i-build`. Those pages are
  unchanged apart from the heading-composite migration in section 7.
- Adding a browser or E2E test harness. See section 10.

## 3. Scope decisions taken

Three decisions were settled before this document and are recorded here as
fixed input, not open questions:

1. **Pinned module on one section**, not a full narrative landing page and not
   the case-study page. Gentle reveal-on-scroll everywhere else.
2. **The sticky pane is a fine-line SVG pipeline diagram**, not artifact cards
   and not pure typography.
3. **The zero-JavaScript property is spent here, deliberately, for this one
   section.** See section 5.

## 4. Content model

Five steps, compressed from the existing `/how-i-build/` page, which remains
the long form and the link target.

`src/data/process.ts` exports a typed, ordered array. Each step declares which
diagram nodes it emphasises. This is the single source: the steps column and
the diagram both read it, so the two can never disagree about how many steps
exist.

| # | id | Heading | Emphasises nodes |
|---|---|---|---|
| 1 | `spec` | Every phase starts from a written spec | `spec` |
| 2 | `contract` | The contract is generated, never hand-maintained | `contract` |
| 3 | `parallel` | Surfaces are built in parallel, against that contract | `api`, `web`, `mobile` |
| 4 | `regression` | Tests remember what broke before | `tests` |
| 5 | `ci` | CI is gated and cost-controlled | `ci` |

Body copy is one tight sentence per step, rewritten from the `/how-i-build/`
prose rather than copied verbatim — the landing module is a trailer, not a
duplicate. The module closes with the existing `See the full process →` link
to `/how-i-build/`.

Data shape:

```ts
export interface ProcessStep {
  id: string;
  numeral: string;           // '01'..'05', display only
  heading: string;
  body: string;
  nodes: readonly PipelineNodeId[];
}
```

## 5. Mechanism

**The pin is CSS.** `position: sticky` on the diagram column. Universal
support, no script.

**The emphasis is JavaScript.** One inline `IntersectionObserver`, budgeted at
under 1 KB, no bundle, no framework, no hydration. It observes the five step
blocks with `rootMargin` collapsing the viewport to a narrow middle band, and
writes `data-active="<n>"` on the module root. All visible change is CSS
reacting to that attribute.

**Progressive enhancement is the contract.** The module renders as complete,
readable HTML with the diagram fully drawn and all five steps present. Script
absent, script failed, or `IntersectionObserver` missing all land on the same
result: the section loses emphasis, never meaning. The observer is guarded and
the module ships with `data-active="1"` in the markup.

The script is `is:inline` so Astro emits it in the document rather than
bundling it into a separate module request. At this size a request costs more
than the bytes.

### Alternative rejected

Driving the whole thing with CSS scroll-driven animations
(`animation-timeline: view()`) would preserve zero JavaScript. It was rejected:
five discrete step states need five view-timelines with hand-tuned
`animation-range` values, which is more fragile, harder to unit-test, and
silently no-ops on older Safari and Firefox — degrading to a *dead* module
rather than a static one.

### Property being amended

`src/styles/tokens.css` and `CLAUDE.md` both currently state the site ships
zero JavaScript. Both must be amended in the same pull request to state: one
inline progressive-enhancement script on the landing page, ~1 KB, no bundle.
Leaving a now-false claim in the repo is worse than the script.

## 6. Diagram

Inline SVG, authored by hand, `aria-hidden="true"`. It carries no information
that the step text does not already carry, so it is decorative reinforcement
and screen readers skip it.

Topology:

```
         spec
          |
       contract
          |
     +----+----+
     |    |    |
    api  web  mobile
     |    |    |
     +----+----+
          |
        tests
          |
         ci
```

Seven named nodes: `spec`, `contract`, `api`, `web`, `mobile`, `tests`, `ci`.
The fork and converge junctions are edge geometry, not nodes.

**Geometry never animates.** All nodes and edges are present and drawn at all
times. Only *emphasis* changes, in three tiers:

| Tier | Condition | Treatment |
|---|---|---|
| past | node's step index < active | `--c-muted` stroke, base weight |
| active | node's step index == active | `--c-fg` stroke, heavier weight, label in `--c-accent` |
| future | node's step index > active | `--c-rule` stroke, base weight |

An edge takes the tier of its destination node.

Strokes use `currentColor` where possible so both palettes are covered without
a dark-mode branch. No fills, no gradients, no glow — the house style is ink on
paper, and `CLAUDE.md` explicitly rules out the gradient-blob look.

Emphasis transitions over ~200ms. That transition is the only motion in the
diagram.

## 7. Files

| File | Change |
|---|---|
| `src/data/process.ts` | New. The five steps. |
| `src/components/process/ProcessScrolly.astro` | New. Two-column grid, sticky pane, steps column, inline observer. |
| `src/components/process/PipelineDiagram.astro` | New. The SVG. |
| `src/styles/motion.css` | New. Reveal utility + reduced-motion resets. |
| `src/components/ProcessTeaser.astro` | Deleted. Superseded; used only by `index.astro`. |
| `src/pages/index.astro` | Swap import; add `reveal` to the five other sections. |
| `src/styles/global.css` | Import `motion.css`; own the heading composite. |
| `src/components/ExperienceTimeline.astro` | Drop local `h2` composite; use shared. |
| `src/components/SkillsMatrix.astro` | Drop local `h2` composite; use shared. |
| `src/pages/resume.astro` | Drop local `h2` composite; use shared. |
| `src/layouts/ProseLayout.astro` | Drop local `:global(h2)` composite; opt into shared via class. |
| `src/styles/tokens.css` | Amend the zero-JS comment. |
| `CLAUDE.md` | Amend zero-JS claim; note the new module and `motion.css`. |
| `tests/process.test.ts` | New. See section 10. |

### 7.1 Heading composite

Three files carry this rule byte-identically — `ExperienceTimeline.astro`,
`SkillsMatrix.astro`, `resume.astro`:

```css
font-size: var(--t-xl);
margin-block: var(--s-16) var(--s-8);
padding-block-start: var(--s-6);
border-block-start: 1px solid var(--c-rule);
```

`ProseLayout.astro` carries a deliberate **near**-copy: same rule but no
`margin-block-end`, because prose vertical rhythm comes from
`.prose > * + *`. It also targets MDX-rendered output through
`.body :global(h2)`, so it cannot consume a utility class — MDX headings carry
no class of ours.

Naively merging the two would add `margin-block-end: var(--s-8)` to every
heading on `/how-i-build/` and `/work/etp/`, changing spacing on two shipped
pages. That is not acceptable as a side effect of a landing-page change.

Resolution — `global.css` owns both forms in one place:

```css
.rule-head,
.prose-body h2 {
  font-size: var(--t-xl);
  margin-block: var(--s-16) var(--s-8);
  padding-block-start: var(--s-6);
  border-block-start: 1px solid var(--c-rule);
}

/* Prose rhythm supplies the trailing gap; see .prose > * + * */
.prose-body h2 { margin-block-end: 0; }
```

`ProseLayout` adds `prose-body` to its `.body` element and deletes the local
rule. The other three add `class="rule-head"` to their `h2` and delete theirs.

**Rendered output must be unchanged on all four affected pages.** This is a
refactor, not a restyle. Any visual diff is a bug in the migration.

The duplicated `.btn` rule between `Hero.astro` and `ClosingCta.astro` is
**out of scope** — the new module has no button, so touching it would be
unrelated refactoring.

## 8. Accessibility and motion

- **Steps are real content.** Each is an `h3` plus a `p` in document order,
  read linearly and correctly with no script. The numeral is presentational.
- **The diagram is `aria-hidden`.** It repeats the text; announcing it twice is
  worse than skipping it.
- **No scroll-jacking**, no snap, no scroll-speed manipulation. Ever.
- **Focus is never trapped** by the sticky pane; it contains no focusable
  elements.
- **Reduced motion.** `global.css` already blankets
  `animation-duration: 0.01ms !important` — but that neutralises *time*-based
  animation only. A scroll-linked animation has no meaningful duration, so the
  existing guard does **not** cover the reveal utility. `motion.css` therefore
  carries an explicit reset:

  ```css
  @media (prefers-reduced-motion: reduce) {
    .reveal {
      animation: none;
      animation-timeline: none;
      opacity: 1;
      transform: none;
    }
    /* diagram emphasis changes instantly rather than transitioning */
  }
  ```

  Under reduced motion the module still tracks the reader's position — the
  emphasis simply changes instantly instead of transitioning. A discrete state
  change is not vestibular motion, and removing it would strip the module of
  its purpose for no accessibility gain.

- **The reveal utility must fail visible.** The `opacity: 0` start state lives
  *inside* `@supports (animation-timeline: view())`. Placing it outside would
  leave the entire landing page blank in any browser lacking support. This is
  the single highest-consequence detail in the change.

## 9. Responsive

One breakpoint, at 60rem, kept as a literal — custom properties are not valid
inside `@media` conditions, a constraint already documented at three other
sites in this codebase.

- **>= 60rem:** two columns. Diagram sticky in the left column, steps scroll
  past in the right.
- **< 60rem:** the pin is dropped entirely. The diagram renders once above the
  steps with all nodes at `active` weight, and the steps read as a plain list.
  The observer is skipped below the breakpoint via `matchMedia`.

A sticky half-screen on a phone is cramped and the scroll story does not
survive the reduced height. The mobile version is a good static read, which is
the correct trade.

## 10. Testing

Consistent with the existing gates. This repo does **not** enforce the global
80% coverage standard (recorded in the original spec, section 9); that
deviation is unchanged.

**New unit test** — `tests/process.test.ts`, following the existing
`tests/schemas.test.ts` pattern:

- step `id`s are unique
- every `nodes` entry is a known `PipelineNodeId`
- every `PipelineNodeId` is claimed by exactly one step — an unclaimed node can
  never light up, and a doubly-claimed one flickers between tiers

That last assertion is the actual failure mode of this design, and it is
catchable without a browser.

**Existing gates that must still pass unchanged:** `npm test`, `astro check`,
lychee link integrity, Lighthouse performance and accessibility >= 95 on all
four URLs.

**CLS is the specific Lighthouse risk.** Two mitigations are requirements, not
suggestions: reveals animate `opacity` and `transform` only and never a
layout-affecting property; and the sticky pane has a reserved block-size so the
diagram's presence cannot shift the steps column.

**Not automated:** that the pin visually tracks correctly, and that emphasis
lands on the right node. Verified by hand in the browser before merge, at both
breakpoints, in both colour schemes, and with JavaScript disabled. Adding
Playwright to a four-page static site to assert this is not a trade worth
making.

## 11. Risks

| Risk | Mitigation |
|---|---|
| Reveal utility hides the whole page on unsupported browsers | `opacity: 0` confined inside `@supports`; verified with the feature disabled |
| Fast scroll leaves no step inside the observer band | Observer only ever *sets* the active step, never clears it; markup ships `data-active="1"` |
| Sticky + reveal regress CLS below the Lighthouse 95 gate | Transform/opacity only; reserved block-size on the sticky pane |
| Heading migration silently restyles two shipped pages | `ProseLayout`'s zero `margin-block-end` preserved explicitly; output must be unchanged |
| Module reads as decoration rather than argument | The diagram's fork is the claim being made; if it does not survive review at that bar, fall back to the typographic treatment |
