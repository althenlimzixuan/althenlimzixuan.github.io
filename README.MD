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

## Deploy

Push to `main`. The `Deploy to GitHub Pages` workflow builds and publishes.
Pull requests run the `Quality` workflow (tests, `astro check`, link check,
Lighthouse) but do not deploy.

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
