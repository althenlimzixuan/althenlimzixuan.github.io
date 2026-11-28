# review-plan: 001-etp-proof-pass

Verdict: **major** (round 1). 2 major, 12 minor, 0 critical. Re-run after the fixes.

## Earlier majors

No earlier plan reviews or owner reviews exist in this project, so there are no earlier majors. The harness list:

| Source | Risk | Applies? | Covered by |
|---|---|---|---|
| harness list 1 | Elevated or other-account code; trusted side touching untrusted places | No. Static site, no privileged code | n/a |
| harness list 2 | Child env copied from the owner's | No. Task 3 spawns npm and vitest only, and passes no secrets | n/a (but see finding 8 on the spawn call) |
| harness list 3 | Key, secret, token or invitation handoff | No | n/a |
| harness list 4 | Absolute security wording | No such wording in spec or plan | n/a |
| harness list 5 | Contract row or appendix behaviour with no task | Applies to the Appendix. All 9 fact rows and the "unchanged" note map to Task 1 or 2 | Tasks 1, 2 |
| harness list 6 | Delete helper with no read-only ownership check | Applies. Task 3 Step 4 deletes a scratch folder | Finding 2 |
| harness list 7 | Callback fired under a lock | No | n/a |
| harness list 8 | Delete helper with no link and junction cases | No helper. Only a manual delete | Finding 2 |
| harness list 9, 10 | Mobile app version bump, native dependency | No. The site is not a mobile app | n/a |
| harness list 11 | Text built from data with no source and type | Applies to Task 3's HTML tables | Finding 9 |

## Findings

1. [major] Task 2 re-lays-out an existing figure (it moves the `mobile` box from x 120 to x 90, widens the fork to `H200`, and adds a third drop) but has no **Existing behaviour** list, with a test or check per item. Items that need one: `api`, `contract` and `gaps` box positions are unchanged; the `gaps` edge and box stay dashed in every tier; the figure stays `aria-hidden` and `role="presentation"`; the walkthrough keeps 4 steps (cap 5); the `web` and `mobile` nodes still light with their steps; and the reduced-motion transition rule is untouched. - Task 2 (check 15; spec F-009 step 4) - Fix: add the list. Back the items with a fixture-driven test or with named lines in the render check. The existing `claims every figure node exactly once` and the step-cap tests cover two of them already.

2. [major] Task 3 Step 4 tells the session to "delete that scratch folder" (`_test_reports/site/scratch`), but the plan's **Deletes and locks** section says "none". The row must name the read-only check that runs first and proves the folder is one the step created, and the folder must not be deleted on its name alone. - Task 3 Step 4 and the Deletes and locks heading (check 16; harness list 6) - Fix: add a row. Before deleting, list the folder (`git status --porcelain _test_reports/site/scratch` shows it untracked and holding only `unit_test.html`, `regression.html` and `profiling.html`, plus the vitest JSON). Delete only that exact path, with no globbing.

3. [minor] The paragraph "More than ninety delivery phases shipped" is not true at the count the spec records: exactly 90 shipped (008 to 097). "More than ninety" means 91 or more. The facts strip and the resume say "90+", which is a floor and is true. The CLAUDE.md rule "never fabricate" applies, and the fixture's `present` list asserts this wrong phrase. - Task 1 Step 1 (`present`) and Step 3 ("What I built") - Fix: use "Ninety delivery phases shipped" or "Ninety or more delivery phases shipped", and change the fixture phrase to match.

4. [minor] Review focus 4 says "Task 3's test covers a failed run", but Task 3 has only two tests (`summarises passed and failed tests per file`, `escapes HTML in table cells`). Nothing tests that `reports.mjs` still writes its HTML files and exits 1 when a command fails, or that a path outside `_test_reports/` is refused. The guard should resolve the path first. A bare prefix check passes `_test_reports/../x`. - Task 3 Steps 1 and 3, Review focus 4 (check 2, TDD) - Fix: move the run logic into `report-lib.mjs` as a function that takes an injected command runner. Add a test `still writes reports and returns 1 when a command fails` and a test `refuses an out dir outside _test_reports`, each with a fixture. Alternatively, remove the claim from Review focus.

5. [minor] Review focus 2 says the fixture "lists every file for every forbidden phrase". It does not. `PostgreSQL` and `not a fourth surface` are asserted absent only in `etp.mdx`. They also sit in `src/data/etp.ts` (lines 36 and 43, and the header comment) and `CLAUDE.md:263`. `Three surfaces consume` (`etp.mdx:102`) and `All three consume` (`etp.mdx:55`) are not in `absent` either. `Two clients consume` (`etp.ts:49`) has no absent check. - Task 1 Step 1 and Task 2 Step 1 - Fix: add `PostgreSQL`, `fourth surface`, `Two clients consume` and `Three surfaces consume` to `absent` for `src/data/etp.ts` and `etp.mdx` as they apply. I ran the `absent` phrases with Grep on the current tree and all of them hit now, so the Step 2 "fails first" run is real.

6. [minor] Task 2 changes the quote in `CLAUDE.md` ("not a fourth surface in its own right"), but `CLAUDE.md:262` also says "not as a third surface", which is stale once admin is a surface. The `SurfaceDiagram.astro` header comment (line 11) says "not a third surface alongside them" too. - Task 2 Step 3 - Fix: list both lines, and reword to "not an additional surface" or "not a fifth surface".

7. [minor] `src/pages/resume.astro:27-31` (the Profile paragraph) describes ETP as "a Go API on Cloud Run, a Next.js web app, and a React Native client", with no admin. It is not false, but it sits beside the four-surface sentence the plan adds, and the spec's Calls 7 names only Selected work. The plan neither updates it nor records leaving it. - Task 1 (resume) - Fix: record it under Global constraints "Left alone", or add "an admin portal" to the sentence. The owner should see which.

8. [minor] Task 3 spawns `npx` and `npm` through `child_process.spawnSync`. On Windows (the owner's machine) Node 22 refuses `.cmd` files without `shell: true` (EINVAL), so the first Step 4 run fails. - Task 3 Step 3, item 2 - Fix: say `shell: true` for the npm and npx calls (no user input reaches them), or run `process.execPath` against the local `vitest` and `astro` bins.

9. [minor] Task 3 builds text from data (table cells holding command lines, exit codes, durations, page paths and sizes) with no **Values from data:** line. The vitest JSON fields are not named either, though the summariser depends on them. - Task 3 (check 21; harness list 11) - Fix: add the line: the command string (the script's own constant, string), the exit code (`spawnSync().status`, number or null), the duration (`performance.now()` difference, number), the page path (`dist/**/*.html` file path, string), the size (`fs.statSync().size`, number) and the vitest fields (`testResults[].name`, `testResults[].assertionResults[].status`, string `passed|failed`). Say what `status === null` (killed) shows.

10. [minor] `testing.md` (Screenshots) says a project with a web UI keeps a copy of `.pal-harness/templates/screens.spec.ts`, and the first UI phase without one adds a task. This phase changes a UI figure and the repo has no copy and no Playwright. Task 2 has a manual "render check" instead. - Task 2 Render check - Fix: either add the task, or record in the plan "screens.spec.ts: skipped, the repo has no Playwright; manual render check at 390 and 1280 px". Also say where the two screenshots are saved (the phase folder, for example `specs/001-etp-proof-pass/reviews/`).

11. [minor] Global constraints say "every new sentence states a fact the spec's Appendix checked in ETP's code". The new paragraph's items (Tripie, receipt scanning, daily exchange rates, packing lists, budget against actual with export) and "a Django portal for running the service, and a Next.js dashboard" come only from spec question 1's prose. The Appendix rows cover only auto-plan, bookings and the dashboard's `package.json`. - Task 1 Step 3 and Global constraints - Fix: reword the constraint to "the spec's Appendix or question 1", or add the checked files to the Appendix. Avoids a claim the build cannot show.

12. [minor] Task 2's diagram instructions are partial. (a) The `web` edge path is given only as "horizontal runs `M40 150 H200`". The full string should be `M95 120 V150 M40 150 H200 M40 150 V170`, so the contract drop is kept. (b) `loadFixture` reads "relative to the repo root", but the plan does not say how it finds the root. Resolving from `process.cwd()` breaks when vitest runs from another folder. - Task 2 Step 3, Task 1 Interfaces - Fix: give the full path strings, and resolve from `import.meta.url`. Geometry fits the viewBox (admin right edge 230 of 240; no overlap with `gaps` at y 86 to 120).

13. [minor] The coverage table maps test step 7 (address unchanged, featured project opens it) to "lychee checks the link in CI". lychee checks that a link resolves, not that the featured card points at `/work/etp/`. - Coverage of the spec, row "Test step 7" - Fix: either add one present-phrase check (`/work/etp/` in the card's or page's source) or say the step is run by hand on the preview.

14. [minor] **Gate dry-runs** says "none", but the facts test is a phrase gate that decides Task 1 is done, and `absent` has line-wrapped phrases (`23 delivery phases` is on one line today, but `Assisted scheduling is not shipped` and `Bookings do not exist` are bold-wrapped). I re-ran each `absent` phrase with Grep: all hit in the current tree, and none of the new sentences the plan writes contains one, so there is no false hit. - Gate dry-runs heading (check 14) - Fix: add a row saying the Step 2 failing run is the dry-run, since each `absent` phrase fails the test before the edit, and each `present` phrase fails too.

## Checks run, no finding

- **Coverage (1):** every test-script step 1 to 8, Calls 1 to 11, and each Appendix row has a task. Step 7 is the weak one (finding 13).
- **Code patterns (2):** TDD order is right in all three tasks (fixture and failing test, then run, then edit). One shared `loadFixture` helper (DRY). No layers to violate.
- **Contract (3):** no API change, no endpoint, no provider repo. The split rule does not apply.
- **Size (4):** three small tasks, one repo; fits one working day.
- **Test file and fixture (5):** every task names its test file, its fixture, its commands and its commit message. `tests/unit_test/` follows `tests/{test_type}/{use_case}.json`. `vitest.config.ts` includes `tests/**/*.test.ts`, so the helper is not picked up as a test. `@types/node` is installed, so the `node:fs` import type-checks under `astro check`.
- **Trust handoffs, trust boundaries, absolute wording, session-0, data sources, QA seeds, mobile, other OS (6, 10, 11, 12, 13, 18, 20):** not applicable. There are no secrets, no elevated code, no Windows security, no figures beyond text, and "QA seeds: none".
- **Lint (8):** the repo has no lint script (`package.json` scripts: dev, build, preview, check, test, verify:css). The plan says so and uses `npm run check`, which is what CI runs.
- **Summary (9):** tasks, repo, risks, owner test, build approach with reason, and reports are all there. Coverage is "n/a" with the recorded override (`project.yaml` `harness.overrides`). Lighthouse is read from CI. Load test: no.
- **Commands and paths (19):** all existing paths and scripts exist (`src/content/projects/etp.mdx`, `About.astro:19-21`, `resume.astro:37-44`, `SkillsMatrix.astro:5`, `services.yaml:9`, `etp.ts`, `SurfaceDiagram.astro`, `tests/scrolly.test.ts`, `verify:css`, `check`, `build`). The new `tests/helpers/` and `tests/unit_test/` folders and `scripts/reports.mjs` and `scripts/report-lib.mjs` (beside `verify-built-css.mjs`) are consistent with neighbours. `tsconfig.json` includes `**/*.ts`, so `astro check` will type-check the new helper and tests.
- **Scope:** Task 3 (the report command) is not extra scope. `testing.md` requires one report command per project, and the plan cites it.
