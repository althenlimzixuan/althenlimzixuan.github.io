# Decisions

The owner's answers to phase questions, so nothing is asked twice. Add to the end; never renumber.
Costly architecture choices go to an ADR instead.

1. 2026-11-19 (move to the phase flow): Which stack practice fits an Astro site? → None yet; the component stack is `tbd`.
2. 2026-11-19 (move to the phase flow): Where does the owner's staging test run, with no staging site on GitHub Pages? → On a local preview build (`npm run build && npm run preview`) from `staging`.
3. 2026-11-19 (move to the phase flow): What happens to `docs/superpowers/` and the old `feat/*` branches? → They stay as history; new work uses `specs/`.
