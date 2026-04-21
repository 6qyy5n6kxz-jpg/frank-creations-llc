# Frank Creations LLC Static Website

Production-ready umbrella website for Frank Creations LLC, built with semantic HTML, responsive CSS, and vanilla JavaScript for GitHub Pages. The current launch scope is the standalone umbrella site itself. Portfolio migration is reserved for a future phase and is not required for launch.

## Folder structure

```text
/
├── index.html
├── a-change-of-plans.html
├── wine-and-canvas-toledo.html
├── cookies-and-canvas.html
├── shop.html
├── contact.html
├── 404.html
├── README.md
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── main.js
│       ├── songs.js
│       ├── events.js
│       ├── shop.js
│       └── contact.js
├── data/
│   ├── songs.json
│   ├── events.json
│   └── shop.json
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
9. Confirm that JSON-driven sections load at the published URLs:
   - `a-change-of-plans.html`
   - `shop.html`
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

### Update events

Edit [`data/events.json`](/Volumes/Backup Plus/frank-creations-llc/data/events.json).

Fields:

- `category`
- `date`
- `time`
- `title`
- `venue`
- `location`
- `description`

The A Change Of Plans page filters on `category: "music"`.

### Update songs

Edit [`data/songs.json`](/Volumes/Backup Plus/frank-creations-llc/data/songs.json).

Fields:

- `title`
- `artist`
- `decade`
- `vibe`
- `tags`

### Update shop inventory

Edit [`data/shop.json`](/Volumes/Backup Plus/frank-creations-llc/data/shop.json).

Fields:

- `name`
- `category`
- `description`
- `price`
- `pickup`

## Current launch scope

- Home page for the umbrella brand
- A Change Of Plans schedule and searchable song list
- Wine & Canvas Toledo service page with native featured-work content
- Cookies & Canvas overview page
- Static shop catalog for local pickup
- Contact form UI ready for backend connection

## Forms and static hosting

- The song request and contact form currently provide frontend-only confirmation text.
- Before public launch, connect the contact flow to Formspree, Basin, a serverless function, or another preferred form backend.
- The JSON-driven sections work on GitHub Pages because they are loaded with relative `fetch()` calls from `/data/`.

## Portfolio as a future phase

- The `portfolio/` folder remains reserved for a later Wine & Canvas Toledo portfolio migration.
- The live umbrella site does not depend on `/portfolio/` for navigation or core booking flow.
- When you are ready to migrate the historical portfolio, treat it as a separate integration phase and preserve its internal structure as much as possible.

## Manual updates before launch

- Replace placeholder payment handles on [`a-change-of-plans.html`](/Volumes/Backup Plus/frank-creations-llc/a-change-of-plans.html).
- Replace placeholder YouTube embeds on [`a-change-of-plans.html`](/Volumes/Backup Plus/frank-creations-llc/a-change-of-plans.html).
- Connect the contact form in [`contact.html`](/Volumes/Backup Plus/frank-creations-llc/contact.html) to a real backend workflow.
- Replace the temporary social preview asset in [`images/social-preview.svg`](/Volumes/Backup Plus/frank-creations-llc/images/social-preview.svg) with a branded sharing image if you want richer link previews.
- Replace the future-phase content in [`portfolio/index.html`](/Volumes/Backup Plus/frank-creations-llc/portfolio/index.html) when portfolio migration begins.
