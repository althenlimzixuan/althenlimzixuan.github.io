# 001 — ETP case study proof pass

- **Status:** Approved (2026-11-28)
- **Roadmap card:** F-009 — ETP case study proof pass (closes althenlimzixuan/althenlimzixuan.github.io#35)
- **Vehicle:** phase

> Reads in about 8 minutes. Written in plain English for you; detail sits in the Appendix.

## Summary

1. This phase makes every fact the site states about ETP true again: the database, the phase
   count, the number of surfaces, and what ETP can and cannot do today.
2. It covers one feature: **F-009 — ETP case study proof pass**, from your note #35.
3. At the end, a prospect who reads `/work/etp/`, the landing page's About section or `/resume/`
   sees only facts that match ETP's own code as of 25 Nov 2026. The address `/work/etp/` does not
   change, so the later Ellovia rename touches words only.
4. The biggest call: I re-checked every claim against ETP's code today instead of trusting the
   August audit, and it found one more stale claim: **bookings now exist** (shipped 30 Sep, phase
   084), and the case study still says they do not. The phase count has also moved on, from 47 in
   August to 90 today.
5. Questions for you: **2**, answered 28 Nov: 1: A, 2: B (`doc/decisions.md` 4 and 5).

## Questions for the owner

Answered 28 Nov 2026: **1: A** (one short paragraph), **2: B** (Postgres and MySQL side by
side; Ellovia Vault's API runs on Postgres, checked in its `api/go.mod`).

1. **How much of ETP's newer work should the case study mention?** It describes a much smaller
   product than exists: the in-app assistant (Tripie), auto-plan, receipt scanning, daily exchange
   rates, packing lists, budget vs actual with export, booking records and the admin surface are
   all shipped and unmentioned. Options: A) fix the wrong facts, and add **one short paragraph**
   naming what else shipped, keeping the "four decisions" as the spine; B) fix the wrong facts
   only. **Recommended: A** — the case study's job is to show depth; one paragraph does that
   without turning it into a feature list.
2. **The skills list and the services section say "PostgreSQL" / "Postgres".** Nothing on the site
   shows Postgres work, and the claim most likely came from the same wrong ETP fact. Options:
   A) replace with MySQL in both places; B) keep Postgres and add MySQL beside it (choose this only
   if you have real Postgres work to stand behind). **Recommended: A** — the site never states a
   skill it cannot point to.

## Calls I made

1. **Phase count shown as "90+".** ETP has shipped phases 008 to 097, which is 90 (the same way the
   August audit counted 47). A floor stays true as ETP keeps shipping; an exact number goes stale
   again, which is how this happened.
2. **Surfaces: four** — API, web, mobile and admin. The generated TypeScript client is still
   described as shared plumbing, not a fifth surface, as the case study already says.
3. **The admin dashboard joins the architecture diagram** on `/work/etp/` as a third client box,
   beside web and mobile, so the picture matches the words "three clients". The step heading
   becomes "Three clients consume one definition".
4. **Stack list:** PostgreSQL becomes MySQL, and I add Cloud SQL, Terraform and Django (the admin
   portal), all checked in ETP's code. AI vendors are not added: the paragraph names features,
   not suppliers.
5. **"Assisted scheduling is not shipped" leaves the limitations list.** Auto-plan (shipped 18 Jul)
   is described where the case study lists what was built. Travel time stays a stated limitation:
   it is still an estimate from coordinates, and auto-plan uses the same estimate.
6. **The bookings limitation is rewritten**, not removed: ETP now records bookings made elsewhere
   (where it was booked, a masked confirmation code), but it does not book anything itself.
7. **About and Resume are fixed too**, because they repeat ETP facts: "three surfaces" becomes
   four, and the resume's "23 delivery phases" becomes "90+".
8. **Left alone on purpose:** "three surfaces" on the How I build page, the hero line and the
   process diagram. They describe your method (one contract, API, web and mobile built in
   parallel), not ETP's surface count.
9. **No new diagram ships.** `docs/diagrams/` (the ETP infrastructure diagram) stays uncommitted in
   your checkout; it is milestone M2. The one diagram this phase touches gets box labels only
   (API, web, mobile, admin), so the scrubbing rule (no project ids, hostnames or client ids) holds.
10. **The audit file `docs/etp-case-study-corrections.md` is not committed** to the site repo: the
    repo's own rules keep people-written docs under `doc/`, and this spec now holds its findings,
    re-checked. Its facts are quoted in the Appendix.
11. **The `/work/etp/` address, the `etp` file names and the `components/etp` folder stay**, per
    your note, so the Ellovia rename later changes words only.
12. **Codex spec review: one finding, fixed, rated minor rather than major** (F1: the test script
    did not check the skills list and the services section for the Postgres change). Its fix is
    one more test step (step 8) and a check of the API step's text in step 4; it changes no
    journey, contract or data. Precondition: the build edits the case study but misses
    `SkillsMatrix` or `services.yaml`; likelihood: low, and now caught by step 8.

## Features

### F-009 — ETP case study proof pass

**Why:** The ETP case study is the site's main proof of work. Three months of drift left it naming
the wrong database, undercounting phases by half, and telling prospects that ETP's core
differentiator was never built.

**Use case:** A prospect reads `/work/etp/` (and the About and Resume summaries) and every fact
matches what ETP runs today.

**Test script** (on the local preview: `npm run build && npm run preview` from `staging`):

1. Do: open `/work/etp/` and read the facts strip under the title → Expect: Surfaces shipped reads
   "API, web, mobile, admin" and Delivery phases reads "90+".
2. Do: read the stack list on the same page → Expect: MySQL, Cloud SQL, Terraform and Django are
   listed; PostgreSQL is not.
3. Do: read "What I built" → Expect: four surfaces, the admin one included; a short paragraph
   names auto-plan, the assistant, receipt scanning and the other shipped features; no sentence
   says auto-plan or bookings do not exist.
4. Do: scroll through the architecture walkthrough → Expect: the API step says "GORM over
   MySQL"; step 3 reads "Three clients consume one definition", and its diagram lights up three
   boxes: web, mobile and admin.
5. Do: read "Honest limitations" → Expect: travel time and "no public demo" are still there;
   bookings say ETP records them but does not book; there is no "assisted scheduling is not
   shipped" line.
6. Do: on `/`, read the About section; then open `/resume/` and read Selected work → Expect: About
   says four surfaces; the resume says "90+ delivery phases" and four surfaces.
7. Do: the case study's address → Expect: it is still `/work/etp/`, and the landing page's
   featured project still opens it.
8. Do: on `/resume/`, read the Skills list; then on `/`, open the "Backend APIs in Go" service →
   Expect: both list PostgreSQL and MySQL side by side (by design: answer 2: B, since Ellovia
   Vault runs on Postgres and ETP on MySQL).

## UX outline

1. `/work/etp/`: same layout; new words in the facts strip, stack list, two paragraphs and the
   limitations list.
2. The architecture diagram on `/work/etp/`: one more box (admin) beside web and mobile, under the
   generated client.
3. `/` About section and `/resume/` Selected work: one sentence each.

**QA seeds:** none (static content).

## Infrastructure

[Infrastructure](../../doc/infra.mmd)

No change. (`doc/infra.mmd` is drafted in this phase, since the project had none.)

## Out of scope

- The Ellovia rename of ETP: it happens in ETP's own launch phase, maybe months away.
- Ellovia Vault or Ellovia Accounts on the site: a later call, when there is something public.
- Links to the Ellovia Trip and Ellovia Vault websites or Play Store pages: asked for at spec
  review, now its own card, F-010.

### Settled by the owner

Decided by the owner (`doc/decisions.md`): not findings unless the code breaks one.

- Decision 4: How much of ETP's newer work should the case study mention? → One short paragraph naming what else shipped; the four decisions stay the spine.
- Decision 5: Replace Postgres with MySQL in the skills list and services section? → Keep Postgres and add MySQL beside it (Ellovia Vault runs on Postgres).
- The ETP infrastructure diagram (milestone M2) and the screenshots in your checkout.
- A walkthrough video or screenshots on the case study.

## Appendix

<details>
<summary>Each fact, and where it was checked (25 Nov 2026)</summary>

| Claim on the site today | True today | Checked in ETP |
|---|---|---|
| Database PostgreSQL | MySQL 8.0 on Cloud SQL | `api/infra/sql.tf` (`MYSQL_8_0`); `api/go.mod` (`gorm.io/driver/mysql`) |
| 23 delivery phases | 90 (008 to 097, all shipped) | `CompleteRoadmap.md` progress ledger (008–096 shipped); `specs/097-mobile-trust-foundations/phase-state.yaml` (`stage: done`) |
| Surfaces: API, web, mobile | plus admin (Django portal and Next.js dashboard) | `project.yaml` (`admin` component); `admin/dashboard/package.json` |
| Two clients use the generated client | three: web, mobile, admin dashboard | `admin/dashboard/package.json` (`@etp/api-client` 0.53.0) |
| Assisted scheduling not shipped | auto-plan shipped 18 Jul (phase 019) | `api/internal/usecase/auto_plan.go`; `POST …/itinerary/auto-plan` and `…/accept` |
| Bookings do not exist | booking records shipped 30 Sep (phase 084); no booking agent | `api/internal/domain/booking.go`; roadmap PL1 (booking agent) not started |
| Travel time is a heuristic | still true | `api/internal/usecase/validator.go` `estimateTravelMinutes`; no use of the distance-matrix code outside its own package |
| One blocking rule of five | still true | `validator.go` `ruleSeverity` (out of range blocks; four warn) |
| No public demo | true in August; not re-checked today | the site keeps hiding the live link either way (`livePubliclyBrowsable: false`) |

Unchanged, and verified in August: money as integer minor units, the generated contract chain,
derive-on-read balances, Redis for rate limits and spend caps.

</details>
