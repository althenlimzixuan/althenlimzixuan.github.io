## 2026-11-25 21:45 — Phase started

Started from Pal Center work session PF-work-HDJQBE (owner clicked Start work on note #35).
Bundle: F-009 (new feature, ETP case study proof pass) + althenlimzixuan.github.io#35. Vehicle: phase.
/pm reconcile: the Roadmap board had no feature cards; F-001 to F-006 added as Shipped, F-007 and F-008 as Planned.
mode: Company mode off for Pal Center (PF on); owner stops wait for the owner.

## 2026-11-28 17:54 — Resumed by pickup

Pickup session PF-pickup-2026-11-28 resumed phase 001 at stage spec (spec drafted, Codex review not yet run).
mode: Company mode on for Pal Center and PF; veto window 1 hour; owner stops run wait-decision.
reader check: Pal Center 0.35.0 reads harness 1.9.0; check --reader passed.

## 2026-11-28 17:58 — Spec sent for owner review

Codex doc review: verdict major, one finding (F1, test script missed the Postgres check on the resume skills list and the services section). Fixed with test step 8 and a check in step 4; rated minor with the reason in reviews/codex-doc-2026-11-28-1756.md and in Calls I made item 12.
Spec rendered and published: https://claude.ai/artifact/8cCa5CDPa6YYUDb7g1BuhG
Owner stop: spec-review, 2 questions. Both questions set what the public site claims, so the decision is held (never by default); waiting for the owner's own answer.

## 2026-11-28 18:10 — Spec approved by the owner

Owner answered in the session: 1: A, 2: B ("go both, Vault is in Postgre"; checked in Ellovia Vault's api/go.mod, which uses GORM's Postgres driver). Recorded as decisions 4 and 5.
Spec approved; test script copied to F-009 in doc/features.yaml. Step 8 now expects Postgres and MySQL side by side.
The owner also asked for links to the Ellovia Trip and Ellovia Vault websites or Play Store pages. New feature, so it is its own card: F-010 (todo), one line in the spec's Out of scope. Neither product has a public listing yet (Vault's store listing is its F-008, todo; ETP sits behind a sign-in wall).
Stage: planning.

## 2026-11-28 18:18 — Plan drafted

Plan drafted: 3 tasks, inline. Sent to pal-review-plan.

## 2026-11-28 18:23 — Plan review round 1 fixed

pal-review-plan round 1: 2 major, 12 minor, 0 critical. Neither major changes what gets built (Existing behaviour list for the diagram; the read-only check before the scratch delete). All 14 fixed in plan.md; round 2 dispatched.

## 2026-11-28 18:24 — Plan approved, building starts

pal-review-plan round 2: 0 critical, 0 major, 4 minor. Minors applied, no re-review. Plan auto-approved (no plan stop). Stage: building.

## 2026-11-28 18:27 — Task 1 done

RED: npx vitest run tests/facts.test.ts, exit 1, 34 failed; for example:
     × states "'value: API, web, mobile, admin'" in 'src/content/projects/etp.mdx' 10ms
     × states "'value: "90+"'" in 'src/content/projects/etp.mdx' 7ms
     × states "'- MySQL'" in 'src/content/projects/etp.mdx' 2ms
     × states "'- Cloud SQL'" in 'src/content/projects/etp.mdx' 2ms
     × states "'- Terraform'" in 'src/content/projects/etp.mdx' 1ms
     × states "'- Django'" in 'src/content/projects/etp.mdx' 1ms
(the 3 address checks passed, as expected: nothing is renamed)
GREEN: npx vitest run tests/facts.test.ts, 37 passed; npm test exit 0 (64 passed); npm run check exit 0 (0 errors). No lint script in this repo.

## 2026-11-28 18:30 — Task 2 done

RED: npx vitest run tests/scrolly.test.ts tests/facts.test.ts, exit 1, 10 failed:
     × no longer states "'PostgreSQL'" in 'src/data/etp.ts' 10ms
     × no longer states "'fourth surface'" in 'src/data/etp.ts' 4ms
     × no longer states "'Two clients consume'" in 'src/data/etp.ts' 2ms
     × no longer states "'fourth surface'" in 'CLAUDE.md' 3ms
     × no longer states "'third surface'" in 'CLAUDE.md' 4ms
     × no longer states "'third surface'" in 'src/components/etp/SurfaceDiagram.ast…' 3ms
     × lights web, mobile and admin in the clients step 10ms
     × names MySQL in the API step 4ms
     × calls the client shared infrastructure, not a fifth surface 2ms
     × keeps the api, contract and gaps boxes where they were 1ms
GREEN: npm test exit 0 (77 passed); npm run check exit 0; npm run build exit 0; npm run verify:css exit 0.
Render check: reviews/screens/etp-architecture-step3-1280.png (three boxes lit together, gaps dashed, no overlap) and etp-architecture-diagram-390.png (fits, 279 px of 390, no sideways scroll; below 60rem the figure is static by design). screens.spec.ts: recorded skip, the repo has no Playwright.

## 2026-11-28 18:34 — Task 3 done

RED: npx vitest run tests/reports.test.ts, exit 1: "Cannot find module '../scripts/report-lib.mjs'" (no tests ran).
GREEN: npx vitest run tests/reports.test.ts, 4 passed; npm test exit 0 (81 passed); npm run check exit 0.
npm run reports -- _test_reports/site/scratch: exit 0, wrote unit_test.html, regression.html, profiling.html (repo-relative paths only). npm run reports -- _test_reports/../x: exit 1, refused.
Scratch folder deleted after the read-only check (git status showed only the four untracked files the run wrote; nothing tracked).
Calls: runReports takes readVitest (reads the JSON the test command wrote) instead of repoRoot; paths shown in the pages are repo-relative so no machine folder lands in the public repo; the output path is quoted, since the worktree path has a space.

## 2026-11-28 18:35 — Code PR opened

Full check green locally. merge-check clean. Code PR #36 opened (docs/001-etp-proof-pass -> dev). ci: running. Session-0 run: not applicable (no Windows security).

## 2026-11-28 18:38 — CI green, code review starts

CI green on PR 36 (quality 2m38s, ssot check). Stage: code-review.

## 2026-11-28 18:46 — Review round 1 fixed

Review round 1. Codex code: major (F1, shell in the report command) rated minor with precondition and likelihood, fixed (reviews/codex-code-2026-11-28-1840.md). Codex uiux: failed twice (HTTP 403 from the Codex service), recorded in codex.skipped.
Claude: code 4 minor, tests 4 minor, errors 5 minor, ui 2 minor; no major or critical.
Fixed: report command runs node scripts directly (no shell) with a 10-minute timeout and the spawn error shown; counts a test file that failed to load and skipped tests; ignores a stale or corrupt vitest.json (exit 1 with no result); no pages listed after a failed build; facts fixture pins the two kept limitations and the new paragraph; resume line re-wrapped.
Bug-fix tests ran red first: 5 failed in tests/reports.test.ts before the fix, 8 passed after.
Dismissed: ui 2 (four surfaces = API plus three clients, consistent); code 4 (F-009 status moves at staging test by the flow); tests 4 (accepted manual render check).
Parked in doc/later.md: ui 1 (faint future-tier contrast, existing design); tests 3 (reports.mjs wiring proved by a real run).
low memory: 853 MiB free before the full check. Full check: npm test exit 0 (88 passed); npm run reports (check, build, verify:css) exit 0.

## 2026-11-28 18:50 — Review round 2 fixed

Review round 2. code: none. tests: none. errors: 2 new minor.
Fixed: errors 1 (built CSS check skipped after a failed build; test "skips the built CSS check after a failed build" ran red first, then 89 passed).
Dismissed: errors 2 (vitest.json freshness by mtime: NTFS stamps are far finer than a run, and a misjudged file fails loudly with exit 1; the timeout reaching only the direct node child is acceptable for a hand-run local tool).
Codex code re-check: failed (HTTP 403 from the Codex service, an outage); one retry follows.
npm test exit 0 (89 passed); npm run check exit 0.

## 2026-11-28 18:55 — Test reports made

Reports made on the final code commit c429ee3 (npm run reports, exit 0): 89 of 89 tests passed; regression passed; CI Lighthouse unchanged from dev (97 to 98 performance, 100 accessibility). Coverage n/a (project override). Raw vitest.json not committed (machine paths).
Review round 3: errors none. Codex code re-check failed twice (HTTP 403 outage), recorded in codex.skipped; its round-1 finding is fixed and tested.
low memory: 1.9 GiB free before the reports.

## 2026-11-28 18:57 — Report citations fixed

Tests reviewer on the reports: 3 minor citation findings in summary.md, applied (lighthouse.md added, line range fixed, final CI commit explained); minors applied, no re-review.

## 2026-11-28 19:01 — Code PR merged, sign-off next

Code PR 36 merged into dev (merge commit 51e0521) after CI green and the merge guard. Stage: signoff.

## 2026-11-28 19:02 — Sign-off PR opened

Sign-off PR 38 opened (dev -> staging, [HUMAN GATE]). Waiting for the owner to merge it.

## 2026-11-28 19:09 — Sign-off merged, staging test next

Owner merged sign-off PR 38 (merge 2ed1afb). Single-repo: no component promotions. No qa_command: no QA pass. Stage: staging-test (local preview of origin/staging; GitHub Pages has no staging site).
