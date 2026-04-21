# Portfolio Placement

This folder is the preservation zone for the existing Wine & Canvas Toledo portfolio.

Use a straight copy of the current portfolio contents into this directory:

- If the portfolio currently lives in its own repository root, copy all site files into `portfolio/`
- Keep the existing structure intact as much as possible
- Replace this placeholder `index.html` only after the copied portfolio is ready

Before publishing, verify:

- CSS, JS, image, and JSON paths still resolve from inside `portfolio/`
- `fetch()` calls use relative paths that still point to the moved files
- Any GitHub Actions or scripts that commit updates now target `portfolio/` paths
- Any hardcoded canonical URLs or sitemap references include `/portfolio/`

The main project `README.md` includes a full migration checklist with before/after examples.
