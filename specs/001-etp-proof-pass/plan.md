# 001 — ETP case study proof pass: plan

- **Status:** Auto-approved (2026-11-28) — no plan stop
- **Spec:** `spec.md` (approved on 2026-11-28)

> Reads in about 8 minutes. There is no plan stop: building starts once Claude's plan review passes.
> Written in plain English for you. Written with the superpowers writing-plans skill, in the
> harness's plan format.

## Summary

1. Three tasks:
   - **Task 1:** correct every ETP fact in the case study's text, the About section and the
     resume, and put Postgres and MySQL side by side in the skills list and the services section.
   - **Task 2:** add the admin box to the case study's architecture diagram and rewrite its steps
     ("Three clients consume one definition", "GORM over MySQL").
   - **Task 3:** add the one report command (`npm run reports`) that the harness asks every phase
     to run. This project does not have one yet.
2. One repo: `althenlimzixuan.github.io` (single-repo project; everything on `docs/001-etp-proof-pass`).
3. Risks and choices for you:
   - The new "what else shipped" paragraph is written out in Task 1 below, word for word. It names
     features and leaves the AI suppliers out (spec, Calls I made 4).
   - The generated client was "not a fourth surface". With admin it becomes "not a fifth surface",
     in the case study, the diagram's step 2 and this repo's `CLAUDE.md`.
   - The case study's role line gains "admin": "Solo — product, API, web, mobile, admin,
     infrastructure".
   - Coverage has no report: the project's recorded exception to the 80% gate (`project.yaml`
     `harness.overrides`) covers it.
4. What you can test at the end: the 8 steps of F-009's test script, on the local preview from `staging`.
5. Build approach: **inline**.
6. Reports: unit tests, regression and profiling, plus a numbered summary. Details below.

## Build approach

**inline**: 3 tasks, one repo, no API change.

## Reports

- Every phase: unit tests (`unit_test.html`), regression (`regression.html`: tests, `astro check`,
  build and the built-CSS check, each with its exit code), profiling (`profiling.html`: build time
  and the size of each built page) and `summary.md`. Task 3 makes the command that writes the first
  three.
- Coverage: n/a. The project's recorded exception to the 80% gate (`project.yaml`
  `harness.overrides`, design spec section 9) means no coverage tooling is installed.
- Lighthouse speed check: read from CI's Lighthouse step (three runs per page on a clean runner).
  `CLAUDE.md` records that local Lighthouse timing on this PC is not trustworthy, so the paired
  local speed check is a recorded skip, and CI's scores are compared with the last `dev` run.
- Load test: no (not asked for in the spec reply).

## Gate dry-runs

| Gate (task) | On the current tree | On a planted bad sample |
|---|---|---|
| `tests/facts.test.ts`, the `absent` phrases (Task 1, Task 2) | Checked with Grep before the review: every `absent` phrase is in today's files, all real hits (the stale facts); none is in the new sentences this plan writes, so no false hit | Today's tree is the bad sample: Step 2's failing run, before the edit, is the dry-run, and every `present` phrase fails there too |

## Deletes and locks

| Delete helper (task) | What it deletes | The read-only check first (proves the target is its own) | Link and junction test cases |
|---|---|---|---|
| Manual cleanup in Task 3 Step 4 (no helper) | The one folder `_test_reports/site/scratch` that Step 4's own run wrote | `git status --porcelain --untracked-files=all _test_reports/site/scratch` lists only untracked `unit_test.html`, `regression.html`, `profiling.html` and `vitest.json`, and nothing tracked; then `rm -r` on that exact path, no glob | n/a: no helper, and the folder is the run's own output |

No callback runs under a lock.

## Owner-run commands

none. Ship is the `staging` → `main` PR you merge, which deploys as today.

## Global constraints

- Never fabricate: every new sentence states a fact from the spec's Appendix or its question 1
  (the shipped features you approved naming), and nothing more.
- No live-demo link for ETP (`livePubliclyBrowsable: false` stays).
- The `/work/etp/` address, the `etp` file names and `src/components/etp/` stay (spec, Calls I made 11).
- Diagram labels are words only (API, web, mobile, admin): no project ids, hostnames or client ids.
- Scrolly rules from `CLAUDE.md`: at most 5 steps, and every figure node claimed by exactly one step.
- Left alone: "three surfaces" on How I build, the hero line and the process diagram (spec, Calls I made 8).

## Review focus

1. **Prose wraps across lines.** The `.mdx` and `.astro` text breaks lines mid-sentence, so a phrase
   check must collapse whitespace first, or a correct sentence fails and a wrong one slips by. The
   facts test in Task 1 normalises whitespace, and its fixture has one phrase that spans a line break.
2. **A stale claim left in a second place.** Each wrong fact appears in several files (the database
   in the case study's front matter, its text and the diagram's step 1). The `absent` list names
   every file each stale phrase is in today (found with Grep), not only the first one.
3. **The diagram on a phone.** A third box must fit the 240-wide drawing without overlapping the
   dashed "gaps" box. Task 2 has a render check at phone width.
4. **The reports command on a failed step.** A failing test or build must still write its report
   and end with a non-zero exit code, not stop before writing. Task 3's test
   `still writes reports and returns 1 when a command fails` covers it.
5. **A report folder outside `_test_reports/`.** A path like `_test_reports/../x` must be refused
   after it is resolved, not by a prefix match on the text. Task 3's test
   `refuses an out dir outside _test_reports` covers it.

---

### Task 1: Correct the ETP facts in the text

**Repo:** `althenlimzixuan.github.io`

**Files:**
- Create: `tests/helpers/loadFixture.ts`, `tests/unit_test/etp_facts.json`, `tests/facts.test.ts`
- Modify: `src/content/projects/etp.mdx`, `src/components/About.astro:19-21`,
  `src/pages/resume.astro:27-44`, `src/components/SkillsMatrix.astro:5`, `src/data/services.yaml:9`
- Read only (by the facts test): `src/pages/work/[...slug].astro`, `src/components/FeaturedProject.astro`

**Interfaces:**
- Produces: `loadFixture<T>(relativePath: string): T` in `tests/helpers/loadFixture.ts`, reading a
  JSON file relative to the repo root, which it finds from its own location
  (`new URL('../../', import.meta.url)`), never from `process.cwd()`. Also `readRepoFile(relativePath: string): string`
  beside it, the same way, for the facts test. Task 2 and Task 3 use them.
- Produces: the fixture shape `{description, input: {}, expected: {present: [{file, text}], absent: [{file, text}]}}`.

- [ ] **Step 1: Write the fixture and the failing test.** `tests/unit_test/etp_facts.json`:
  - `present` (each in the file named): `etp.mdx`: `value: API, web, mobile, admin`,
    `value: "90+"`, `- MySQL`, `- Cloud SQL`, `- Terraform`, `- Django`, `GORM over MySQL`,
    `A production system across four surfaces`, `auto-plan`, `Tripie`, `receipt scanning`,
    `Three clients consume the same API`, `not a fifth surface`,
    `Ninety delivery phases shipped`, `does not book anything`,
    `auto-plan uses the same estimate`;
    `About.astro`: `one person, four surfaces`; `resume.astro`: `90+ delivery phases shipped`,
    `four surfaces`, `a React Native client and an admin dashboard`, `href="/work/etp/"`;
    `SkillsMatrix.astro`:
    `'PostgreSQL', 'MySQL'`; `services.yaml`: `PostgreSQL or MySQL schema and migrations`.
  - `absent` (every file each phrase is in today): `PostgreSQL` in `etp.mdx`; `Twenty-three`
    and `value: "23"` in `etp.mdx`; `Assisted scheduling is not shipped` and
    `Bookings do not exist` in `etp.mdx`; `fourth surface` in `etp.mdx`;
    `Three surfaces consume` and `All three consume` in `etp.mdx`; `three surfaces` in
    `About.astro` and `resume.astro`; `23 delivery phases` in `resume.astro`; `Postgres schema` in
    `services.yaml`. (`src/data/etp.ts` and `CLAUDE.md` phrases are Task 2's.)
  - Test step 7 (the address): the fixture's `present` list also holds
    `entry.id === 'etp'` in `src/pages/work/[...slug].astro` and ``href={`/work/${id}/`}`` in
    `src/components/FeaturedProject.astro`. The step itself is also run by hand on the preview.
  - `tests/facts.test.ts`: `describe('ETP facts')` with one `it.each` over `present`
    (`'states "$text" in $file'`) and one over `absent` (`'no longer states "$text" in $file'`).
    Each reads the file and collapses every run of whitespace to one space before
    `toContain` / `not.toContain`.
- [ ] **Step 2: Run it and see it fail.** `npx vitest run tests/facts.test.ts`. Expected: FAIL, with
  the failing test names in the output (for example `states "value: \"90+\"" in src/content/projects/etp.mdx`).
  Paste the failing names into the log.
- [ ] **Step 3: Make it pass.** Edit the five files:
  - `etp.mdx` front matter: role `Solo — product, API, web, mobile, admin, infrastructure`; stack
    `Go, Gin, Wire, GORM, MySQL, Cloud SQL, Redis, Next.js, React Native, Expo, TypeScript, Django,
    Terraform, Cloud Run, Vercel`; metrics `API, web, mobile, admin` and `"90+"`.
  - "What I built": "A production system across four surfaces, built solo"; the API bullet says
    "GORM over MySQL on Cloud SQL"; add **Admin**: "a Django portal for running the service, and a
    Next.js dashboard"; "Web, mobile and the admin dashboard consume a shared API client …";
    "… not a fifth surface in its own right."; "Ninety delivery phases shipped." (exactly 90
    shipped on 25 Nov: 008 to 097; "more than ninety" would not be true)
  - The new paragraph after it, word for word (each item is a row or a named feature in the
    spec's Appendix and question 1, nothing more): "The product has grown well past its first
    release: auto-plan, which proposes an itinerary for the organiser to accept; Tripie, an in-app
    assistant; receipt scanning; daily exchange rates; packing lists; budget against actual spend,
    with export; and records of bookings made elsewhere."
  - Decision 3: "Three clients consume the same API."
  - Honest limitations: remove the assisted-scheduling item; the travel-time item ends "…, and
    auto-plan uses the same estimate."; the bookings item becomes "**ETP does not book anything.**
    It records bookings made elsewhere (where each was booked, with a masked confirmation code),
    but flights, hotels and restaurants are still booked outside it."
  - `About.astro`: "one person, four surfaces, shipped and running in production."
  - `resume.astro`: "Sole engineer across four surfaces (API, web, mobile and admin) and the
    infrastructure. … a generated OpenAPI contract shared by three clients. 90+ delivery phases
    shipped; live in production." The Profile paragraph (lines 27-31) becomes "a Go API on Cloud
    Run, a Next.js web app, a React Native client and an admin dashboard, all consuming one
    generated API contract", so it agrees with the four-surface sentence below it.
  - `SkillsMatrix.astro`: `'PostgreSQL', 'MySQL'`. `services.yaml`: "PostgreSQL or MySQL schema and
    migrations, Redis where it earns its place".
- [ ] **Step 4: Prove it.** `npx vitest run tests/facts.test.ts` → PASS. `npm test` → all pass.
  `npm run check` → 0 errors. (This repo has no lint script; `astro check` is its type and content check.)
- [ ] **Step 5: Commit.** `Correct ETP facts on the case study, About and resume`.

### Task 2: Add admin to the architecture diagram

**Repo:** `althenlimzixuan.github.io`

**Files:**
- Create: `tests/unit_test/etp_architecture.json`
- Modify: `tests/scrolly.test.ts`, `tests/unit_test/etp_facts.json` (Task 2's `absent` rows),
  `src/data/etp.ts`, `src/components/etp/SurfaceDiagram.astro`,
  `CLAUDE.md` (the "not as a third surface" line and the "not a fourth surface" quote, under Visual design)

**Existing behaviour** (the figure is re-laid-out; each item keeps working, with what covers it):

| Today | Covered by |
|---|---|
| 4 steps, under the cap of 5 | `stays within the tier CSS step cap` (existing) |
| Every node lights with exactly one step | `claims every figure node exactly once` (existing) |
| `api`, `contract` and `gaps` boxes keep their place (x 40/30/178, y 20/86/86) | new test `keeps the api, contract and gaps boxes where they were`, reading the node list from the fixture against an exported `SURFACE_LAYOUT` (see Step 3) |
| The `gaps` box and its edge stay dashed in every tier | render check, line 2 |
| The figure stays hidden from screen readers (`role="presentation"`, `aria-hidden="true"`) | facts fixture `present`: `aria-hidden="true"` in `SurfaceDiagram.astro` |
| The reduced-motion rule (no transition) stays | facts fixture `present`: `prefers-reduced-motion: reduce` in `SurfaceDiagram.astro` |
| Web and mobile still light at step 3 | render check, line 3 |

**Interfaces:**
- Consumes: `loadFixture` from Task 1.
- Produces: `SURFACE_NODE_IDS` gains `'admin'` (order: `api, contract, web, mobile, admin, gaps`).

- [ ] **Step 1: Write the fixture and the failing test.** `etp_architecture.json` `expected`:
  `{clients: {heading: "Three clients consume one definition", nodes: ["web", "mobile", "admin"]},
  api: {bodyContains: "GORM over MySQL"}, contract: {bodyContains: "not a fifth surface"}}`. In
  `tests/scrolly.test.ts` add `describe('etp architecture copy')` with three tests:
  `lights web, mobile and admin in the clients step`, `names MySQL in the API step` and
  `calls the client shared infrastructure, not a fifth surface`, each reading the fixture, plus
  `keeps the api, contract and gaps boxes where they were` (fixture `expected.layout`:
  `{api: {x: 40, y: 20}, contract: {x: 30, y: 86}, gaps: {x: 178, y: 86}}`). Add to
  `etp_facts.json` `absent`: `PostgreSQL`, `fourth surface` and `Two clients consume` in
  `src/data/etp.ts`; `fourth surface` and `third surface` in `CLAUDE.md` and
  `SurfaceDiagram.astro`; and to `present`: `aria-hidden="true"` and
  `prefers-reduced-motion: reduce` in `SurfaceDiagram.astro` (the Existing behaviour rows).
- [ ] **Step 2: Run it and see it fail.** `npx vitest run tests/scrolly.test.ts tests/facts.test.ts`.
  Expected: FAIL on the four new scrolly tests and Task 2's new `absent` rows (names in the log).
  The existing per-module tests and Task 1's rows still pass.
- [ ] **Step 3: Make it pass.**
  - `src/data/etp.ts`: add `'admin'` to `SURFACE_NODE_IDS`. Step 1 body: "GORM over MySQL on
    Cloud SQL". Step 2 body ends "not a fifth surface". Step 3 heading "Three clients consume one
    definition", nodes `['web', 'mobile', 'admin']`, body: "Next.js on Vercel, React Native on Expo,
    and the admin dashboard. None hand-writes a fetch layer, so none can be wrong about the shape of
    a response; they did not write it down independently." Update the header comment ("fifth surface").
  - Move the node list out of `SurfaceDiagram.astro` into `src/data/etp.ts` as
    `export const SURFACE_LAYOUT: readonly {id: SurfaceNodeId; x: number; y: number; w: number; label: string}[]`
    (one home, and testable); the component imports it. Nodes: `api`, `contract`, `gaps` as
    today; `web` x 10, `mobile` x 90, `admin` x 170, each w 60, y 170, label `admin`.
  - `SurfaceDiagram.astro` edges, full strings: web `M95 120 V150 M40 150 H200 M40 150 V170`;
    mobile `M120 150 V170`; admin `M200 150 V170` with `data-step={stepOf.admin}`. The header
    comment says "three consuming clients" and "not an extra surface alongside them".
  - `CLAUDE.md`: "not as a third surface" becomes "not as an extra surface", and the quote becomes
    "not a fifth surface in its own right".
- [ ] **Step 4: Prove it.** `npm test` → all pass, including `claims every figure node exactly once`
  for `etp`. `npm run check` → 0 errors. `npm run build` → exit 0; `npm run verify:css` → exit 0.
- [ ] **Render check:** `npm run preview`, open `/work/etp/` at 390 px and 1280 px wide, scroll to
  step 3. One screenshot each, saved to `specs/001-etp-proof-pass/reviews/screens/`. Look for:
  (1) three boxes in a row, none overlapping "gaps"; (2) "gaps" and its edge still dashed;
  (3) web, mobile and admin lit together. `screens.spec.ts` (`testing.md`, Screenshots): recorded
  skip, since the repo has no Playwright; this manual check stands in, and the gap goes in the retro.
- [ ] **Step 5: Commit.** `Add admin to the ETP architecture diagram`.

### Task 3: Add the report command

**Repo:** `althenlimzixuan.github.io`

**Files:**
- Create: `scripts/reports.mjs`, `scripts/report-lib.mjs`, `tests/reports.test.ts`,
  `tests/unit_test/vitest_summary.json`
- Modify: `package.json` (script `"reports": "node scripts/reports.mjs"`)

**Interfaces:**
- Consumes: `loadFixture` from Task 1.
- Produces, in `scripts/report-lib.mjs`:
  - `summariseVitest(json: object): {passed: number, failed: number, files: {name: string, passed: number, failed: number}[]}`;
  - `renderTable(title: string, headers: string[], rows: string[][]): string` (a whole HTML page,
    every cell HTML-escaped);
  - `resolveOutDir(outDir: string, repoRoot: string): string`: resolves the path, throws unless
    the result is inside `<repoRoot>/_test_reports/`;
  - `runReports({outDir, repoRoot, run, writeFile, listPages}): number`: runs the four commands
    through the injected `run(command: string): {status: number | null, ms: number}`, writes the
    three pages through `writeFile`, and returns 1 if any status is not 0, else 0.

**Values from data:** command string (the script's own constant, string); exit code
(`spawnSync().status`, number, or `null` when killed, shown as "killed"); duration
(`performance.now()` difference, number, shown in seconds); page path (each `dist/**/*.html` path,
string); page size (`fs.statSync().size`, number, shown in KB); Vitest fields
(`testResults[].name`, string; `testResults[].assertionResults[].status`, string `passed` or `failed`).

- [ ] **Step 1: Write the fixture and the failing test.** `vitest_summary.json`: `input.vitest` is
  a trimmed real `vitest --reporter=json` output (captured from this repo's own run) with one file
  passing 2 tests and one failing 1 of 2; `input.runs` maps the four commands to statuses
  `[0, 0, 1, 0]`; `expected` is `{passed: 3, failed: 1}`, the two file rows, and `exitCode: 1`.
  `tests/reports.test.ts`: `summarises passed and failed tests per file`,
  `escapes HTML in table cells` (`renderTable` with a cell `<b>&</b>` contains
  `&lt;b&gt;&amp;&lt;/b&gt;`), `still writes reports and returns 1 when a command fails`
  (`runReports` with a fake `run` from `input.runs`: three pages written, returns 1), and
  `refuses an out dir outside _test_reports` (`resolveOutDir('_test_reports/../x', root)` throws).
- [ ] **Step 2: Run it and see it fail.** `npx vitest run tests/reports.test.ts` → FAIL (module not
  found); test names in the log.
- [ ] **Step 3: Make it pass.** `report-lib.mjs` implements the four functions. `reports.mjs <out dir>`:
  1. Preflight, failing in seconds with a one-line fix: Node at least 22.12.0 ("install Node
     22.12 or later"), `node_modules` present ("run npm ci").
  2. Runs, one after another, each through `child_process.spawnSync` with `shell: true` (Windows
     refuses `.cmd` files without it; the command strings are the script's own constants, no user
     input) and its exit code kept:
     `npx vitest run --reporter=json --outputFile=<out>/vitest.json`, `npm run check`,
     `npm run build` (timed), `npm run verify:css`.
  3. Writes `unit_test.html` (from `summariseVitest`), `regression.html` (each command, its exit
     code and its duration) and `profiling.html` (build seconds, and each `dist/**/*.html` page's
     size in KB with the CSS it links or inlines), then exits 1 if any command failed, else 0.
  The out dir goes through `resolveOutDir` first; `reports.mjs` is only the thin wiring of
  `runReports` to the real `spawnSync`, `fs` and `dist/` listing.
- [ ] **Step 4: Prove it.** `npm test` → all pass. `npm run check` → 0 errors.
  `npm run reports -- _test_reports/site/scratch` → exit 0 and three HTML files. Then the
  read-only check in **Deletes and locks**, and only then delete that exact folder.
- [ ] **Step 5: Commit.** `Add the npm run reports command`.

## Coverage of the spec

| Spec item | Task |
|---|---|
| Test step 1 (facts strip) | 1 |
| Test step 2 (stack list) | 1 |
| Test step 3 (What I built, the new paragraph, no "not built" claims) | 1 |
| Test step 4 (architecture walkthrough) | 2 |
| Test step 5 (Honest limitations) | 1 |
| Test step 6 (About and Resume) | 1 |
| Test step 7 (address unchanged) | 1 (fixture checks the route and the featured card's link; also run by hand on the preview) |
| Test step 8 (Skills and services, Postgres and MySQL) | 1 |
| Calls I made 1–7, 11 | 1 and 2 |
| Calls I made 8 (left alone) | Global constraints |
| Calls I made 9 (diagram labels only) | 2 |
| Appendix: every fact row | 1 and 2 |
| Reports the harness asks for | 3 |
