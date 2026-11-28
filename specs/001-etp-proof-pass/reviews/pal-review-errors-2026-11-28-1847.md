# review-errors: 001-etp-proof-pass (round 2, commit 2049505)

Verdict: minor (0 critical, 0 major, 2 minor). All 5 round-1 findings are fixed.

Round-1 fixes checked:
- Stale vitest.json: fixed. `readVitest` returns null when the file's mtime is before the run's start (scripts/reports.mjs:79). A retry into the same folder after the unit command crashed therefore shows "No Vitest result", and `runReports` returns 1 whenever the summary is null (report-lib.mjs:157).
- Load failure and skips: fixed. A file with status `failed` and no failed assertions counts as 1 failed, and skipped, pending and todo are counted in their own column (report-lib.mjs:30-39). The fixture has a `tests/c.test.js` load-failure case.
- Corrupt JSON: fixed. The parse sits in a try/catch, logs the error and returns null (reports.mjs:80-86). Pages are still written and the exit code is 1.
- Stale dist after a failed build: fixed. profiling.html lists no pages unless Build exited 0 (report-lib.mjs:143-155).
- Timeout and lost spawn error: fixed. `timeout` is 600000 ms, and `r.error` is logged and written into an Error column of regression.html. A timeout gives status null, shown as "killed".
- Direct node invocation: the script paths match `package.json` (`astro check`, `astro build`, `node scripts/verify-built-css.mjs`) and the vitest and astro entry files exist. Removing the shell also removes the out-dir injection risk.

New findings:

1. [minor] After a failed build, the "Built CSS check" still runs against the stale `dist/` from an earlier build, and it may exit 0. regression.html then shows a passing CSS check for output this run never produced. The overall exit is still 1 because of the build, so no failure is hidden. - scripts/report-lib.mjs:12 (the command list), run unconditionally at :113-116 - Fix: skip `verify:css` when Build did not exit 0, and record it as skipped.

2. [minor] The freshness check compares the file's mtime with `Date.now()` taken at script start (reports.mjs:58, :79). On a filesystem with coarse timestamps (FAT, 2 s) a fresh result could be judged stale. This is unlikely on NTFS or ext4, and the failure is loud (exit 1, "No Vitest result"), not silent. The timeout also kills only the direct node child, so vitest workers may outlive it on Windows. - scripts/reports.mjs:58,79 - Fix: delete `vitest.json` before the run instead of comparing times; optional.
