# Decisions

The owner's answers to phase questions, so nothing is asked twice. Add to the end; never renumber.
Costly architecture choices go to an ADR instead.

1. 2026-11-19 (move to the phase flow): Which stack practice fits an Astro site? → None yet; the component stack is `tbd`.
2. 2026-11-19 (move to the phase flow): Where does the owner's staging test run, with no staging site on GitHub Pages? → On a local preview build (`npm run build && npm run preview`) from `staging`.
3. 2026-11-19 (move to the phase flow): What happens to `docs/superpowers/` and the old `feat/*` branches? → They stay as history; new work uses `specs/`.
4. 2026-11-28 (phase 001 spec): How much of ETP's newer work should the case study mention? → A. Fix the wrong facts and add one short paragraph naming what else shipped; the four decisions stay the spine.
5. 2026-11-28 (phase 001 spec): The skills list and the services section say Postgres; replace it with MySQL? → B. Keep Postgres and add MySQL beside it. Owner: "go both, Vault is in Postgre" (checked: Ellovia Vault's API uses GORM's Postgres driver, `api/go.mod`).
6. 2026-11-28 (phase 001 staging test): Rename ETP on the site? → Yes, now: "Ellovia Trip Planner", still abbreviated ETP. Owner: "let's rename the ETP to Ellovia Trip Planner from now on since it's ETP also". Fixed now in phase 001 (titles read "ETP — Ellovia Trip Planner"; the /work/etp/ address stays).
7. 2026-11-28 (phase 001 staging test): The hero and page width caps (46rem and 68rem): change them now or as their own card? How far should "maximize" go? → Own card F-011, scheduled for the next phase. Use side margins instead of width caps, with the margin recommended by the ui-ux-pro-max skill; paragraphs keep a readable line length. Owner: "1A, and schedule it to next phase 2. Set the margin instead, can ask the ui ux skill for recommended margin while utilize the screen width".
