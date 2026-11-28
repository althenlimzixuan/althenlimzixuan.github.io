# review-errors: 001-etp-proof-pass

Verdict: minor (0 critical, 0 major, 5 minor)

Checked: scripts/reports.mjs, scripts/report-lib.mjs, the package.json script entry. The rest of the diff is content, data and tests with no new error handling. The core contract holds: every command's non-zero or null status gives exit 1 (report-lib.mjs:138), and a failed command does not stop the other commands or the pages (report-lib.mjs:99-102).

1. [minor] A stale `vitest.json` is read as this run's result. If the unit-test command crashes before writing, or the folder is reused, `readVitest` returns the old file. unit_test.html then shows old pass counts with no hint they are old. The exit code is still 1 because the command failed, so the harm is a misleading page. - scripts/reports.mjs:72-73 - Fix: delete `vitest.json` before the first command runs.

2. [minor] A test file that fails to load (import or syntax error) has an empty `assertionResults`. It is shown as 0 passed, 0 failed, and the note reads "N passed, 0 failed". The page contradicts regression.html, which shows the unit-test command's exit 1. Skipped and todo tests are not counted at all. - scripts/report-lib.mjs:20-24 - Fix: count a file whose `status` is `failed` with no assertions as 1 failed, and add a skipped column.

3. [minor] `JSON.parse` of a truncated or corrupt `vitest.json` (for example, a killed run) throws out of `readVitest`. This happens after the commands ran and before any page is written. The result is a stack trace and no reports at all, which breaks the promise at report-lib.mjs:88 that pages are always written. It is not silent, since the exit code is non-zero. - scripts/reports.mjs:74 - Fix: catch the parse error in `readVitest` and return null, so the page says "No Vitest result".

4. [minor] A failed build can leave a previous `dist/`. `listPages` reads it, so profiling.html lists the old pages and sizes beside the "exit code 1" note. `verify:css` then also checks stale output. - scripts/reports.mjs:42 - Fix: when the Build status is not 0, show no pages, or remove `dist` before the build.

5. [minor] `spawnSync` has no timeout, so a hung vitest or build blocks the report forever. `r.error` (spawn failure, ENOENT) is dropped and shows only as "killed", which loses the cause. - scripts/reports.mjs:69-70 - Fix: pass a `timeout`, and print `r.error?.message` and `r.signal` when status is null.
