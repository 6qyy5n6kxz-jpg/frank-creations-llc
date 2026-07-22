# Frank Creations LLC Static Website

Production-ready umbrella website for Frank Creations LLC, built with semantic HTML, responsive CSS, and vanilla JavaScript for GitHub Pages. The current launch scope is the standalone umbrella site itself. Portfolio migration is reserved for a future phase and is not required for launch.

## Folder structure

```text
/
├── index.html
├── services/index.html
├── a-change-of-plans/index.html
├── wine-and-canvas-toledo/index.html
├── cookies-and-canvas/index.html
├── photo-booth/index.html
├── event-enhancements/index.html
├── graduation-parties/index.html
├── packages/index.html
├── shop/index.html
├── contact/index.html
├── 404.html
├── README.md
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── main.js
│       ├── analytics.js
│       ├── shop.js
│       └── contact.js
├── data/
│   ├── shop.json
│   └── studio-display-events.json
├── images/
│   └── brand-mark.svg
└── portfolio/
    ├── index.html
    └── README.md
```

## Local preview

Because the site uses `fetch()` for JSON-driven sections, do not open pages directly with a `file://` URL. Serve the folder from a local web server instead.

Example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Deploy to GitHub Pages

1. Create or use a GitHub repository for the site.
2. Put all files from this project at the repository root.
3. Commit and push to the branch you want to publish, usually `main`.
4. In GitHub, go to `Settings -> Pages`.
5. Under `Build and deployment`, choose `Deploy from a branch`.
6. Select the publishing branch and the `/ (root)` folder.
7. Save the settings and wait for the Pages deployment to finish.
8. Open the published GitHub Pages URL and test every primary page before pointing a custom domain at it.
9. Confirm that the JSON-driven shop loads at `/shop/`.
10. Confirm the 404 page, mobile navigation, footer links, and contact flow still behave as expected after publishing.

## Connect a custom domain

1. In GitHub Pages settings, enter the custom domain you want to use.
2. If you are using an apex domain such as `frankcreationsllc.com`, add the GitHub Pages `A` records your DNS provider requires.
3. If you are using `www`, add a `CNAME` record pointing to `<your-github-username>.github.io`.
4. If your DNS provider supports `ALIAS` or `ANAME`, you can use that for the apex domain instead of raw `A` records.
5. Add a `CNAME` file at the repository root containing the final production domain if you want the domain setting represented in the repo.
6. Wait for DNS propagation, then enable HTTPS in GitHub Pages settings.
7. Re-test the live site on the final domain and verify page metadata, icons, and navigation behavior.

## Content updates

### Update shop inventory

Edit [`data/shop.json`](/Volumes/Backup Plus/frank-creations-llc/data/shop.json).

Fields:

- `name`
- `category`
- `description`
- `price`
- `pickup`

### Studio display event sync

- When hosted off the Wine & Canvas domain, `studio-display.html` prefers the current event snapshot from the `studio-display-sync` branch. [`data/studio-display-events.json`](/Volumes/Backup Plus/frank-creations-llc/data/studio-display-events.json) on `main` is its last-known-good fallback.
- Refresh the snapshot locally with `python3 scripts/sync-studio-display-events.py`.
- The scheduled workflow at [`.github/workflows/sync-studio-display-events.yml`](/Volumes/Backup Plus/frank-creations-llc/.github/workflows/sync-studio-display-events.yml) publishes a refreshed JSON snapshot to the data-only `studio-display-sync` branch every six hours. It never commits generated snapshots to `main`.
- The display fetches the current snapshot from `studio-display-sync` and re-checks it every five minutes. The copy on `main` remains a last-known-good fallback if the remote snapshot is temporarily unavailable.
- If the display is ever hosted on the Wine & Canvas origin itself, the page still keeps its direct live WordPress event fetch as a fallback path.

## Current launch scope

- Home page for the umbrella brand
- Concise A Change Of Plans service overview linking to `https://achangeofplansmusic.com/`
- Wine & Canvas Toledo service page with native featured-work content
- Cookies & Canvas overview page
- Static shop catalog for local pickup
- Contact form UI ready for backend connection

## Forms and static hosting

- The event inquiry and local-pickup reservation forms submit to configured Formspree endpoints.
- Verify each endpoint, destination inbox, spam handling, and success flow after deployment.
- The JSON-driven shop works on GitHub Pages because it loads inventory with a relative `fetch()` call from `/data/`.

## Analytics

- The site does not include an advertising tracker or a hard-coded analytics token.
- Privacy-respecting conversion events are prepared for Cloudflare Zaraz in [`assets/js/analytics.js`](/Volumes/Backup Plus/frank-creations-llc/assets/js/analytics.js).
- Follow [`ANALYTICS-SETUP.md`](/Volumes/Backup Plus/frank-creations-llc/ANALYTICS-SETUP.md) to enable Cloudflare Web Analytics and configure the conversion events in the Cloudflare dashboard.

## Portfolio as a future phase

- The `portfolio/` folder remains reserved for a later Wine & Canvas Toledo portfolio migration.
- The live umbrella site does not depend on `/portfolio/` for navigation or core booking flow.
- When you are ready to migrate the historical portfolio, treat it as a separate integration phase and preserve its internal structure as much as possible.

## Manual updates before launch

- Verify the published Formspree workflows on [`contact/index.html`](/Volumes/Backup Plus/frank-creations-llc/contact/index.html) and [`shop/index.html`](/Volumes/Backup Plus/frank-creations-llc/shop/index.html).
- Confirm that the A Change Of Plans overview and related service links lead to `https://achangeofplansmusic.com/` where intended.
- Validate the branded 1200 × 630 social preview at [`images/social-preview.png`](/Volumes/Backup Plus/frank-creations-llc/images/social-preview.png) with the major platform preview tools after deployment.
- Replace the future-phase content in [`portfolio/index.html`](/Volumes/Backup Plus/frank-creations-llc/portfolio/index.html) when portfolio migration begins.
