# review-plan: 001-etp-proof-pass (round 2)

Verdict: **minor**. 0 critical, 0 major, 4 minor. Round 1's 14 findings are all fixed. Minors end the review: the session applies them ("minors applied, no re-review").

## Round 1 fixes checked

| # | Fix | Result |
|---|---|---|
| 1 | Existing behaviour table, Task 2 | Fixed. Seven items, each with a test or a render-check line; I checked that `aria-hidden="true"` and `prefers-reduced-motion: reduce` are in `SurfaceDiagram.astro` today |
| 2 | Deletes and locks row | Fixed. Read-only `git status --porcelain --untracked-files=all` check, exact path, no glob; Step 4 points to it |
| 3 | "Ninety delivery phases shipped" | Fixed in the fixture and Step 3 |
| 4 | Failed-run and out-dir tests | Fixed. `runReports` and `resolveOutDir` are in the interfaces with injected `run`, and both tests are in Step 1 |
| 5 | Absent list covers every file | Fixed. Task 2 adds the `etp.ts`, `CLAUDE.md` and `SurfaceDiagram.astro` phrases |
| 6 | `CLAUDE.md:262` and the diagram comment | Fixed in Step 3 and in the absent rows |
| 7 | Resume Profile paragraph | Fixed, with `present` `a React Native client and an admin dashboard` |
| 8 | `shell: true` | Fixed |
| 9 | Values from data | Fixed, with sources and types |
| 10 | `screens.spec.ts` | Recorded skip, with a screenshot path |
| 11 | Global constraint wording | Fixed |
| 12 | Full path strings, `loadFixture` root | Fixed (`new URL('../../', import.meta.url)`) |
| 13 | Test step 7 | Fixed. I checked that `entry.id === 'etp'` (`src/pages/work/[...slug].astro:29`) and ``href={`/work/${id}/`}`` (`src/components/FeaturedProject.astro:28,50`) exist |
| 14 | Gate dry-runs row | Fixed |

## Findings

1. [minor] Task 2 Step 1 adds `absent` rows to `etp_facts.json`, but Step 2 runs only `npx vitest run tests/scrolly.test.ts` and says "the three new tests". Task 2 now adds four tests in `scrolly.test.ts`, and the new absent rows fail in `tests/facts.test.ts`, which Step 2 never runs. - Task 2 Step 2 - Fix: run `npx vitest run tests/scrolly.test.ts tests/facts.test.ts` and say "the four new tests and the new `absent` rows".

2. [minor] The Existing behaviour table relies on two `present` rows in the facts fixture (`aria-hidden="true"` and `prefers-reduced-motion: reduce`, both in `SurfaceDiagram.astro`), but Task 2 Step 1 does not say to add them; it adds only the `absent` rows. - Task 2 Step 1 - Fix: list those two `present` rows in Step 1.

3. [minor] Task 3 Step 3 says "`report-lib.mjs` implements the two functions", but the interfaces now list four (`summariseVitest`, `renderTable`, `resolveOutDir`, `runReports`). - Task 3 Step 3 - Fix: say "the four functions".

4. [minor] Task 1's **Files** list names only the five modified files and the three created ones. The fixture also reads `src/pages/work/[...slug].astro` and `src/components/FeaturedProject.astro` (read only), and Task 2's facts rows read `CLAUDE.md`, `src/data/etp.ts` and `SurfaceDiagram.astro`. - Task 1 Files (check 17) - Fix: add a "Read by the tests (unchanged)" line naming the two files.

No other new finding on the changed text. The `SURFACE_LAYOUT` move keeps one home for the layout; the geometry still fits the 240-wide viewBox; `runReports` takes an injected runner, so it is testable without spawning.
