# review-code: 001-etp-proof-pass (fix/001-ellovia-name, commit 042edb2)

Verdict: none

none: checked the diff against origin/staging, the whole site for the old name, the fixture test mechanism and the test run.

- Diff: the title in `src/content/projects/etp.mdx:2` and the heading in `src/pages/resume.astro:37` both read "ETP — Ellovia Trip Planner". They match each other and the owner's decision 6.
- Old name: a search of `src`, `public`, `scripts`, `tests`, the README and the config finds "Essential Traveller Planner" nowhere on the site. It remains only in the two new `absent` fixture rows, in `.pal-harness/practices/django_admin.md:111` (a pinned harness example that must not be edited by hand), and in `docs/superpowers/` (history files that the project says new work does not touch).
- Other places: `src/pages/work/[...slug].astro:21` takes the title from `data.title`, so the page title and heading follow the rename. No other file in `src` spells out the ETP name. The `About`, `404`, `SurfaceDiagram`, `Scrolly` and `etp.ts` files only say "ETP".
- Tests: the new fixture rows follow the existing `present` and `absent` format that `tests/facts.test.ts:23-27` reads. The `present` rows cover both files and the `absent` rows guard both against the old name coming back. The suite runs green: 4 files, 93 tests passed.
- The `/work/etp/` address and the etp file names stay unchanged, as intended.
