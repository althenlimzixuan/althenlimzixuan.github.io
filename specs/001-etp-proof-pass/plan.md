# 001 — ETP case study proof pass: plan

- **Status:** Draft
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

none. Every check in the tasks is a Vitest test or an existing npm script.

## Deletes and locks

none.

## Owner-run commands

none. Ship is the `staging` → `main` PR you merge, which deploys as today.

## Global constraints

- Never fabricate: every new sentence states a fact the spec's Appendix checked in ETP's code.
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
   in the case study's front matter, its text and the diagram's step 1). The fixture lists every
   file for every forbidden phrase, not only the first one found.
3. **The diagram on a phone.** A third box must fit the 240-wide drawing without overlapping the
   dashed "gaps" box. Task 2 has a render check at phone width.
4. **The reports command on a failed step.** A failing test or build must still write its report
   and end with a non-zero exit code, not stop before writing. Task 3's test covers a failed run.

---

### Task 1: Correct the ETP facts in the text

**Repo:** `althenlimzixuan.github.io`

**Files:**
- Create: `tests/helpers/loadFixture.ts`, `tests/unit_test/etp_facts.json`, `tests/facts.test.ts`
- Modify: `src/content/projects/etp.mdx`, `src/components/About.astro:19-21`,
  `src/pages/resume.astro:37-44`, `src/components/SkillsMatrix.astro:5`, `src/data/services.yaml:9`

**Interfaces:**
- Produces: `loadFixture<T>(relativePath: string): T` in `tests/helpers/loadFixture.ts`, reading a
  JSON file relative to the repo root. Task 2 and Task 3 use it.
- Produces: the fixture shape `{description, input: {}, expected: {present: [{file, text}], absent: [{file, text}]}}`.

- [ ] **Step 1: Write the fixture and the failing test.** `tests/unit_test/etp_facts.json`:
  - `present` (each in the file named): `etp.mdx`: `value: API, web, mobile, admin`,
    `value: "90+"`, `- MySQL`, `- Cloud SQL`, `- Terraform`, `- Django`, `GORM over MySQL`,
    `A production system across four surfaces`, `auto-plan`, `Tripie`, `receipt scanning`,
    `Three clients consume the same API`, `not a fifth surface`,
    `More than ninety delivery phases shipped`, `does not book anything`,
    `auto-plan uses the same estimate`; `About.astro`: `one person, four surfaces`;
    `resume.astro`: `90+ delivery phases shipped`, `four surfaces`; `SkillsMatrix.astro`:
    `'PostgreSQL', 'MySQL'`; `services.yaml`: `PostgreSQL or MySQL schema and migrations`.
  - `absent`: `PostgreSQL` in `etp.mdx`; `Twenty-three` and `value: "23"` in `etp.mdx`;
    `Assisted scheduling is not shipped` and `Bookings do not exist` in `etp.mdx`;
    `not a fourth surface` in `etp.mdx`; `three surfaces` in `About.astro` and `resume.astro`;
    `23 delivery phases` in `resume.astro`; `Postgres schema` in `services.yaml`.
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
    "… not a fifth surface in its own right."; "More than ninety delivery phases shipped."
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
    shipped; live in production."
  - `SkillsMatrix.astro`: `'PostgreSQL', 'MySQL'`. `services.yaml`: "PostgreSQL or MySQL schema and
    migrations, Redis where it earns its place".
- [ ] **Step 4: Prove it.** `npx vitest run tests/facts.test.ts` → PASS. `npm test` → all pass.
  `npm run check` → 0 errors. (This repo has no lint script; `astro check` is its type and content check.)
- [ ] **Step 5: Commit.** `Correct ETP facts on the case study, About and resume`.

### Task 2: Add admin to the architecture diagram

**Repo:** `althenlimzixuan.github.io`

**Files:**
- Create: `tests/unit_test/etp_architecture.json`
- Modify: `tests/scrolly.test.ts`, `src/data/etp.ts`, `src/components/etp/SurfaceDiagram.astro`,
  `CLAUDE.md` (the "not a fourth surface" quote, under Visual design)

**Interfaces:**
- Consumes: `loadFixture` from Task 1.
- Produces: `SURFACE_NODE_IDS` gains `'admin'` (order: `api, contract, web, mobile, admin, gaps`).

- [ ] **Step 1: Write the fixture and the failing test.** `etp_architecture.json` `expected`:
  `{clients: {heading: "Three clients consume one definition", nodes: ["web", "mobile", "admin"]},
  api: {bodyContains: "GORM over MySQL"}, contract: {bodyContains: "not a fifth surface"}}`. In
  `tests/scrolly.test.ts` add `describe('etp architecture copy')` with three tests:
  `lights web, mobile and admin in the clients step`, `names MySQL in the API step` and
  `calls the client shared infrastructure, not a fifth surface`, each reading the fixture.
- [ ] **Step 2: Run it and see it fail.** `npx vitest run tests/scrolly.test.ts`. Expected: FAIL on
  the three new tests (names in the log). The existing per-module tests still pass.
- [ ] **Step 3: Make it pass.**
  - `src/data/etp.ts`: add `'admin'` to `SURFACE_NODE_IDS`. Step 1 body: "GORM over MySQL on
    Cloud SQL". Step 2 body ends "not a fifth surface". Step 3 heading "Three clients consume one
    definition", nodes `['web', 'mobile', 'admin']`, body: "Next.js on Vercel, React Native on Expo,
    and the admin dashboard. None hand-writes a fetch layer, so none can be wrong about the shape of
    a response; they did not write it down independently." Update the header comment ("fifth surface").
  - `SurfaceDiagram.astro`: nodes `web` x 10, `mobile` x 90, `admin` x 170, each w 60, y 170; the
    fork's horizontal runs `M40 150 H200`; drops at x 40 (web, in the web path), `M120 150 V170`
    (mobile) and `M200 150 V170` (admin, `data-step={stepOf.admin}`). Update its header comment
    ("three consuming clients").
  - `CLAUDE.md`: the quote becomes "not a fifth surface in its own right".
- [ ] **Step 4: Prove it.** `npm test` → all pass, including `claims every figure node exactly once`
  for `etp`. `npm run check` → 0 errors. `npm run build` → exit 0; `npm run verify:css` → exit 0.
- [ ] **Render check:** `npm run preview`, open `/work/etp/` at 390 px and 1280 px wide, scroll to
  step 3. One screenshot each: three boxes, none overlapping "gaps", all three lit together.
- [ ] **Step 5: Commit.** `Add admin to the ETP architecture diagram`.

### Task 3: Add the report command

**Repo:** `althenlimzixuan.github.io`

**Files:**
- Create: `scripts/reports.mjs`, `scripts/report-lib.mjs`, `tests/reports.test.ts`,
  `tests/unit_test/vitest_summary.json`
- Modify: `package.json` (script `"reports": "node scripts/reports.mjs"`)

**Interfaces:**
- Consumes: `loadFixture` from Task 1.
- Produces: `summariseVitest(json: object): {passed: number, failed: number, files: {name: string, passed: number, failed: number}[]}`
  and `renderTable(title: string, headers: string[], rows: string[][]): string` (a whole HTML
  page, every cell HTML-escaped) in `scripts/report-lib.mjs`.

- [ ] **Step 1: Write the fixture and the failing test.** `vitest_summary.json`: `input` is a
  trimmed real `vitest --reporter=json` output with one file passing 2 tests and one failing 1 of 2;
  `expected` is `{passed: 3, failed: 1}` and the two file rows. `tests/reports.test.ts`:
  `summarises passed and failed tests per file` (from the fixture), and
  `escapes HTML in table cells` (`renderTable` with a cell `<b>&</b>` contains `&lt;b&gt;&amp;&lt;/b&gt;`).
- [ ] **Step 2: Run it and see it fail.** `npx vitest run tests/reports.test.ts` → FAIL (module not
  found); test names in the log.
- [ ] **Step 3: Make it pass.** `report-lib.mjs` implements the two functions. `reports.mjs <out dir>`:
  1. Preflight, failing in seconds with a one-line fix: Node at least 22.12.0 ("install Node
     22.12 or later"), `node_modules` present ("run npm ci").
  2. Runs, one after another, each through `child_process.spawnSync` with its exit code kept:
     `npx vitest run --reporter=json --outputFile=<out>/vitest.json`, `npm run check`,
     `npm run build` (timed), `npm run verify:css`.
  3. Writes `unit_test.html` (from `summariseVitest`), `regression.html` (each command, its exit
     code and its duration) and `profiling.html` (build seconds, and each `dist/**/*.html` page's
     size in KB with the CSS it links or inlines), then exits 1 if any command failed, else 0.
  The out dir must be under `_test_reports/`; any other path stops with an error.
- [ ] **Step 4: Prove it.** `npm test` → all pass. `npm run check` → 0 errors.
  `npm run reports -- _test_reports/site/scratch` → exit 0 and three HTML files; delete that
  scratch folder after looking.
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
| Test step 7 (address unchanged) | 1 and 2 (no file renamed; lychee checks the link in CI) |
| Test step 8 (Skills and services, Postgres and MySQL) | 1 |
| Calls I made 1–7, 11 | 1 and 2 |
| Calls I made 8 (left alone) | Global constraints |
| Calls I made 9 (diagram labels only) | 2 |
| Appendix: every fact row | 1 and 2 |
| Reports the harness asks for | 3 |
