# review-code: 001-etp-proof-pass

Verdict: minor

Checked: the whole diff against origin/dev, the spec's test script (steps 1 to 8) against `src/`, the diagram geometry, the report scripts and their tests. `npx vitest run`: 4 files, 81 tests passed. Settled decisions 4 and 5 were treated as settled.

1. [minor] `npm run reports` builds shell command lines by putting the out-dir argument into a string run with `shell: true`. `resolveOutDir` only checks the path is under `_test_reports/`, so a folder name holding `"`, `&` or `$(...)` (valid on POSIX) is run as shell. Local owner-run tool only, so impact is low. - scripts/report-lib.mjs:8 and scripts/reports.mjs:70 - Fix: reject out-dir names outside `[A-Za-z0-9._/-]` in `resolveOutDir`.
2. [minor] A stale `vitest.json` from an earlier run in the same folder is read when the unit-test command fails to write a new one, so `unit_test.html` could show old numbers. The regression page still shows the failing exit code. - scripts/reports.mjs:62,72 - Fix: delete `vitest.json` before running the commands.
3. [minor] The resume summary paragraph has one over-long wrapped line after the edit (formatting only). - src/pages/resume.astro:29-31 - Fix: re-wrap the paragraph.
4. [minor] `doc/features.yaml` carries F-009 status `code-review` and an empty `results: []`. This is expected until the staging test, but the status must be moved when the phase ships. - doc/features.yaml:92 - Fix: none now; update at the staging test.

Checked and fine:
- Spec facts (MySQL and Cloud SQL, 90+, four surfaces, three clients, auto-plan and bookings wording) are in `etp.mdx`, `etp.ts`, About and Resume. No stale "three surfaces", "PostgreSQL" or "23" claim for ETP is left in `src/`. The How I build page and the process diagram are left alone on purpose (spec call 8).
- Diagram: web, mobile and admin centres (40, 120, 200) match the fork path. The admin box (170 to 230) fits the 240 wide viewBox. The gaps box and edge are unchanged. Layout lives in one place, `SURFACE_LAYOUT` (DRY), and `scrolly.test.ts` enforces the one-claim-per-node rule for the new `admin` node.
- Fixture-based tests exist for the facts, the architecture copy and the reports. The reports logic is pure and tested with injected effects.
- Decision 5 (Postgres and MySQL side by side) matches `SkillsMatrix.astro` and `services.yaml`. Test script step 8 matches.
- Owner guide: this project has none, so there is no finding.
