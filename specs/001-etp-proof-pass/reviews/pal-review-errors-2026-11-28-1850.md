# review-errors: 001-etp-proof-pass (round 3, commit c429ee3)

Verdict: none

none: checked the round-2 fix in scripts/report-lib.mjs. The Built CSS check carries `needsBuild` and is not run when the Build result is not 0, so it cannot pass against an old `dist/` (report-lib.mjs:113-126). The skipped row's status stays null, so it cannot count as a pass, and the overall exit is 1 (report-lib.mjs, the final `results.every(status === 0)`). regression.html shows "skipped: the build failed" in the Exit code column instead of "killed". The test "skips the built CSS check after a failed build" pins both the command count and the note. The test "still writes reports and returns 1 when a command fails" now uses explicit statuses [1, 0, 0, 0], so the fixture change does not weaken it. Round-2 minor 2 is dismissed with a sound reason.
