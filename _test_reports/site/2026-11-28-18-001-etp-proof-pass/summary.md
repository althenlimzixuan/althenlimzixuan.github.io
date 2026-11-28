# Test summary — site, phase 001

Verdict: pass

Commit: c429ee3 (the last commit that changes code) · tree: 5dfecd757625a8a41676271f416659761c1554e5

Every line, and every claim in a note, ends with its source in brackets.

1. Tests: 89 of 89 passed, 0 failed, 0 skipped. [unit_test.html; npm run reports, exit 0]
2. Test coverage: n/a. This project's recorded exception to the 80% gate (`project.yaml`
   `harness.overrides`, design spec section 9) means no coverage tool is installed. [project.yaml:25-29]
3. Slowest steps: type and content check 78.5 s, build 19.8 s, unit tests 17.0 s (this site has no
   API calls). Largest built page: `work/etp/index.html` at 19.5 KB of HTML and 5.8 KB of linked
   CSS; `index.html` at 19.1 KB and 12.4 KB. [regression.html; profiling.html]
4. Speed against the previous code: base commit 81d4536 (`dev`). The paired local check is a
   recorded skip: `CLAUDE.md` records that local Lighthouse timing on this PC is not trustworthy.
   CI's Lighthouse (3 runs per page) is compared instead. Median performance, base → new: `/`
   97 → 97, `/work/etp/` 98 → 98, `/how-i-build/` 98 → 98, `/resume/` 98 → 98 (no change; 5
   points lower would block). Accessibility is 100 on every page in both. Coverage since the last
   report: n/a. The final run was at a461fb3, which holds the same code as c429ee3 (only `specs/`
   differs). [lighthouse.md; CI quality runs 45505132969 and 46137084489]
5. Regression: passed. Unit tests, `astro check`, build and the built-CSS check all exited 0.
   [regression.html]
6. Load test: not requested. [phase-state.yaml load_test: false]
7. Not applicable: test coverage (above); load test (not requested).

Notes

- The report command is new in this phase (`npm run reports`, Task 3). It writes `unit_test.html`,
  `regression.html` and `profiling.html`. The raw `vitest.json` it also writes is not committed,
  since it holds this PC's folder paths; the unit page carries its numbers. [scripts/reports.mjs; package.json:16]
- Memory was below the 2 GiB guide before the run (1.9 GiB free); the run went ahead and finished
  with every command at exit 0. [pal-harness mem, exit 1; regression.html]
