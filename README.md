# althenlimzixuan.github.io

Personal portfolio site for Althen Lim Zi Xuan — product engineer.
Freelance-first: case studies, delivery process, and resume.

**Live:** https://althenlimzixuan.github.io

## Stack

Astro 7, MDX content collections, deployed to GitHub Pages via GitHub Actions.
No server, no database, no tracking.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # -> dist/
npm run preview  # serve the built site
npm test         # schema unit tests
npm run check    # astro check
```

Requires Node >= 22.12.0.

## Components

<!-- pal:begin components (generated from project.yaml; do not edit) -->
| Folder | Role | Rank | Stack | Repo | Status |
|---|---|---|---|---|---|
| `site/` | consumer | 2 | tbd | https://github.com/althenlimzixuan/althenlimzixuan.github.io | active |
<!-- pal:end components -->

The site is a single-repo project: its code lives at the root of this repo, not in a `site/`
folder.

## Deploy

Branches: work branches come from `dev` and return to `dev` by PR; `dev` → `staging` → `main`
promote with merge commits. Only a push to `main` deploys: the `Deploy to GitHub Pages` workflow
builds and publishes. The `Quality` workflow (tests, `astro check`, link check, Lighthouse) runs
on every push and PR to `dev`, `staging` and `main`, and never deploys.

## Editing content

| To change | Edit |
|---|---|
| Name, contact, booking link, socials | `src/data/site.ts` |
| Service areas | `src/data/services.yaml` |
| Employment history | `src/data/experience.yaml` |
| Case studies | `src/content/projects/*.mdx` |
| Colour/type/spacing values | `src/styles/tokens.css` |

Token *values* live in `tokens.css`, but some composite treatments (section
headings, buttons) are currently duplicated across individual components
rather than centralised there — a redesign touching those may need to edit
more than one file.

Adding a project is one new `.mdx` file — no code changes.

## Contact

althenlim@gmail.com
