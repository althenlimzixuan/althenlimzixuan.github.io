# review-tests: 001-etp-proof-pass (round 2, commit 2049505)

Verdict: none

none: checked the round 1 minors against commit 2049505. Reports are not made yet, so checks 3-7 and 11 are skipped.

- Minor 1 is resolved. `tests/unit_test/etp_facts.json` now has `present` rows for `Travel time is a heuristic` and `No public demo.` in `etp.mdx`. Spec test step 5 is covered again.
- Minor 2 is resolved. A new `present` row pins the whole "what else shipped" paragraph as one string. The facts test collapses whitespace first, so the line wrapping in the file does not matter.
- Minor 3 is partly resolved, and the part left open is accepted.
  - Tests in `tests/reports.test.ts` now cover these branches:
    - `returns 1 when no Vitest result was written`
    - `lists no pages after a failed build`
    - `counts a test file that failed to load as a failure`
    - skipped counts in `summarises passed, failed and skipped tests per file`
    - `passes the out dir as one argument, with no shell`
  - The failed-build note is read from the fixture (`expected.buildFailedNote`), and the tests still use the shared `loadFixture` fixture.
  - The `null` status ("killed") text is not asserted. It is a one-line `statusText` branch, so this is too small to raise.
  - The preflight, the real `spawnSync`, the stale and corrupt `vitest.json` handling and the `dist/` listing stay untested in `scripts/reports.mjs`. They are parked in `doc/later.md` with the reason that a real `npm run reports` run proves them each phase. This matches the plan's "thin wiring" scope.
- Minor 4 was accepted in round 1.
- The `resume.astro` change in this commit only re-wraps one paragraph's line breaks. The facts test collapses whitespace, so its `present` and `absent` rows are unaffected.
