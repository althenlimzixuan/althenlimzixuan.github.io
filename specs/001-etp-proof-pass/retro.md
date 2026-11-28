---
expected:
  - {line: "A prospect who reads /work/etp/, the About section or /resume/ sees only facts that match ETP's code; the address /work/etp/ does not change", source: "summary 3", result: met, evidence: "tests/facts.test.ts (93 passed after the rename fix); F-009 passed at the staging test in doc/features.yaml; live smoke check in phase-log.md 20:02"}
  - {line: "On /, the featured ETP card reads Surfaces shipped 'API, web, mobile, admin' and Delivery phases '90+'", source: "F-009 step 1", result: met, evidence: "owner passed in the session (phase-log.md 19:53); facts.test.ts"}
  - {line: "The stack list lists MySQL, Cloud SQL, Terraform and Django, not PostgreSQL", source: "F-009 step 2", result: met, evidence: "owner passed (phase-log.md 19:53); facts.test.ts"}
  - {line: "What I built names four surfaces and the shipped features; no sentence says auto-plan or bookings do not exist", source: "F-009 step 3", result: met, evidence: "owner passed (phase-log.md 19:53); facts.test.ts"}
  - {line: "The API step says GORM over MySQL; step 3 says Three clients consume one definition and lights web, mobile and admin", source: "F-009 step 4", result: met, evidence: "tests/scrolly.test.ts; reviews/screens/etp-architecture-step3-1280.png; owner passed"}
  - {line: "Honest limitations keep travel time and no public demo; bookings are recorded but not booked; no assisted-scheduling line", source: "F-009 step 5", result: met, evidence: "facts.test.ts; owner passed"}
  - {line: "About says four surfaces; the resume says 90+ delivery phases and four surfaces", source: "F-009 step 6", result: met, evidence: "facts.test.ts; owner passed"}
  - {line: "The address is still /work/etp/ and the featured project still opens it", source: "F-009 step 7", result: met, evidence: "facts.test.ts address checks; live smoke check /work/etp/ 200"}
  - {line: "Skills list and Backend APIs in Go service list PostgreSQL and MySQL side by side", source: "F-009 step 8", result: met, evidence: "owner passed (phase-log.md 19:53); decisions 4 and 5"}
  - {line: "The project reads ETP — Ellovia Trip Planner on /, /work/etp/, the tab and /resume/; Essential Traveller Planner appears nowhere", source: "F-009 step 9", result: met, evidence: "facts test red then green (93 passed); live smoke check title"}
---
# Phase 001 — ETP case study proof pass: retro

Short. Each idea under Ideas is filed as a harness capture; the good points stay here.

## Expected vs got

(10 met, 0 partly met, 0 missed.)

No staging step has its own result in Pal Center: the owner passed steps 2 to 9 together, so the evidence for those is the passing test files plus that one sign-off. Step 1 was checked in the session.

## Went well

1. Every claim was re-checked against ETP's code, which found one more stale fact (bookings now exist) that the August audit missed [spec.md Summary 4].
2. Plan review caught 2 majors before any code; both fixed with no owner stop [phase-log 18:23].
3. Bug-fix tests ran red first, in review rounds and the rename fix [phase-log 18:46, 19:27].
4. The rename was a small fix-now that went from the owner's request to staging and dev in about 11 minutes, with CI and the merge guard [phase-log 19:16 to 19:27].
5. The reports command was built with its own tests, and the dev code PR merged with CI green on the first run [phase-log 18:34, 19:01].

## Went badly

1. Codex returned HTTP 403 for every review after the first (uiux, code round 2, code on the rename fix; two tries each). Three of five review kinds were skipped and recorded; six calls were spent on a known outage.
2. Test steps 1 and 2 pointed at /work/etp/, but the content is on the landing card. Only the staging pre-flight caught it, after the spec was approved; it cost a spec edit and a republish.
3. F-009 was set to retest before any step had a result, which hid the Test button in Pal Center. The owner could not see the steps for about 25 minutes (19:16 to 19:41) until it was reset to not-tested.
4. The project had no report command or screenshot script, so the phase spent a task building `npm run reports` and used manual screenshots; the screens spec was a recorded skip.
5. The owner raised three new items during the staging test (rename, hero width, WhatsApp and LinkedIn). One was fixed now; two became cards (F-011, F-012). The rename was foreseeable, since the spec already mentions the later Ellovia rename.

## Owner stops

| Stop | Kind | Waited | Could have been a decision under Company mode? |
|---|---|---|---|
| Spec, 2 questions | spec-review | 0.2 h | no: both set what the public site claims |
| Sign-off PR 38 | signoff | 0.1 h | no: the owner's gate |
| Staging test | staging-test | 0.7 h | no: the owner's test |
| Promotion PR 41 to main | signoff | 0.1 h | no: production gate on main |

(4 stops, 0 could have been decisions, about 1.1 h waiting.)

## Ideas

1. Codex outage: add a cheap preflight and a one-retry-then-record-skip rule (filed 01M8H0KN7RB6TYTW4YNY937N2M).
2. Check each spec test step against the built pages before the spec stop (filed 01M8H0KN9NAQ5M416G0JSQ407F).
3. Never set `retest` before a step has a result, or have Pal Center show the steps in retest (filed 01M8H0KNBD2CTDAAY8AYXDKQVZ).
4. Scaffold the report command and screenshot script for Node-only static sites at kickstart or in the first phase (filed 01M8H0KND3T03FSPZK89VZGQCN).
