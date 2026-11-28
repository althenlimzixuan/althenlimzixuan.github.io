# review-tests: 001-etp-proof-pass

Verdict: minor

Scope: reports not made yet, so checks 3-7 and 11 are skipped. The 80% coverage gate does not apply (project exception). Checks 9 (no `ci-test-summary` override) and 10 (no run, session or job outcomes in this feature) do not apply.

1. [minor] Test step 5 is only half asserted. The facts fixture checks that the assisted-scheduling line is gone, that "does not book anything" is present, and that "auto-plan uses the same estimate" is present. It does not check that the "Travel time is a heuristic" and "No public demo" limitations are still there, though the spec's step 5 expects both. Neither can be lost without a failing test today. - tests/unit_test/etp_facts.json (no entry for these) vs spec.md:101-103; text exists at src/content/projects/etp.mdx:158,162 - Fix: add two `present` rows (`Travel time is a heuristic`, `No public demo`) for `etp.mdx`.

2. [minor] Several `present` phrases are weak. `auto-plan`, `Tripie` and `receipt scanning` would pass on any occurrence in the whole file (`auto-plan` also appears in the limitations text). `- MySQL` and `not a fifth surface` are the same. The new "what else shipped" paragraph is therefore not pinned as a unit. Step 3 of the spec is thinly covered. - tests/unit_test/etp_facts.json:`present` rows 9-13 - Fix: add one row with a longer phrase from the paragraph, for example `The product has grown well past its first release`.

3. [minor] The `scripts/reports.mjs` wiring has no test. This covers the preflight (Node version and `node_modules`), the real `spawnSync` call, reading `vitest.json`, and the `dist/` page listing. Inside `runReports`, the `readVitest() === null` branch (the "No Vitest result" note) and the `status: null` branch ("killed") are not driven by the fixture either. The plan scopes the wiring as thin and Task 3 Step 4 runs it by hand, so this is not blocking. - tests/reports.test.ts:44-55; scripts/report-lib.mjs:100-111,89 - Fix: add a fixture run with `status: null` and `readVitest: () => null`, and assert the rendered "killed" and "No Vitest result" text.

4. [minor] The visual checks of spec test step 4 (three boxes fit in a row and do not overlap "gaps"; "gaps" stays dashed) have no automated test. Only the data side is tested: the clients step lights `web`, `mobile` and `admin`, the existing claim-once test passes, and the three old boxes keep their coordinates. The plan names this as a manual render check, with screenshots at 390 px and 1280 px under `reviews/screens/`, and records the missing Playwright set-up as a skip. Accepted. - tests/scrolly.test.ts:59-96; specs/001-etp-proof-pass/reviews/screens/ - Fix: none now. The retro should record the gap, as the plan says.

Checked, no problem:
- Every file the plan names exists in the diff: `tests/helpers/loadFixture.ts`, `tests/facts.test.ts`, `tests/unit_test/etp_facts.json`, `tests/unit_test/etp_architecture.json`, `tests/unit_test/vitest_summary.json`, `tests/reports.test.ts`, and the new `describe` in `tests/scrolly.test.ts`.
- Each one reads its JSON fixture through `loadFixture`, which finds the repo root from its own location and not from `process.cwd()`.
- Assertions are real. Whitespace is collapsed before matching, as the plan's review focus 1 requires.
- The plan's review focus 4 (a failing command still writes the pages and returns 1) is covered by `still writes reports and returns 1 when a command fails`, with a fixture status of `[0,0,1,0]`.
- Focus 5 (`_test_reports/../x` refused after resolving, and the bare `_test_reports` refused) is covered, tests/reports.test.ts:53-57.
- Focus 2 (stale claims in several places) is covered: the `absent` list names the stale phrases in `etp.mdx`, `About.astro`, `resume.astro`, `services.yaml`, `etp.ts`, `SurfaceDiagram.astro` and `CLAUDE.md`.
- Spec test steps 1, 2, 3 (the stale-claim half), 6, 7 and 8 map to rows in `etp_facts.json`. Step 4's data half maps to the `etp architecture copy` tests.
- Fixtures: no error-path bodies are involved, so the real-response rule does not apply. The Vitest fixture is described as a trimmed real run. Fixtures are shared through one helper, with no per-test copies.
- The 80% gate is not applicable. The plan records coverage as n/a with the project exception as the reason, and the Lighthouse speed check as a recorded skip (CI's scores are read instead).
