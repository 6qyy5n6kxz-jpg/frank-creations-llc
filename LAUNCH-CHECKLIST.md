# Frank Creations LLC Launch Checklist

## GitHub Pages

- Push the final site files to the publishing branch.
- In GitHub `Settings -> Pages`, choose `Deploy from a branch`.
- Select the correct branch and the `/ (root)` folder.
- Wait for the deployment to finish and open the published Pages URL.

## Domain setup

- Decide whether the site will launch first on the GitHub Pages URL, the custom domain, or both.
- Confirm the final primary domain and whether `www` will redirect or be the main host.
- Add a root-level `CNAME` file if you want the production domain tracked in the repository.

## Custom domain DNS

- For an apex domain, add the GitHub Pages `A` records or use `ALIAS`/`ANAME` if your DNS provider supports it.
- For `www`, add a `CNAME` pointing to `<your-github-username>.github.io`.
- Wait for DNS propagation before enabling HTTPS in GitHub Pages.
- After DNS is live, verify the site on both the GitHub Pages URL and the final custom domain.

## Content and business details

- Confirm the displayed payment handles in [a-change-of-plans/index.html](/Volumes/Backup Plus/frank-creations-llc/a-change-of-plans/index.html).
- Review event data in [data/events.json](/Volumes/Backup Plus/frank-creations-llc/data/events.json).
- Review song data in [data/songs.json](/Volumes/Backup Plus/frank-creations-llc/data/songs.json).
- Review shop inventory in [data/shop.json](/Volumes/Backup Plus/frank-creations-llc/data/shop.json).
- Confirm service area, booking language, and any contact details on the page copy.
- Replace [images/social-preview.svg](/Volumes/Backup Plus/frank-creations-llc/images/social-preview.svg) if you want a branded social-sharing image.

## Form delivery

- Verify the configured Formspree workflows for the event inquiry, song request, and local-pickup reservation forms.
- Verify each success flow and message delivery using a real test submission.
- Confirm the destination inbox, spam filtering, and reply workflow.

## Final review

- Test all top-level navigation links on desktop and mobile.
- Test the mobile menu open/close behavior.
- Test the shared footer links.
- Test JSON-driven sections on the published site:
  - music events
  - song search
  - shop filter
- Test the live contact, song-request, and local-pickup submission flows.
- Test [404.html](/Volumes/Backup Plus/frank-creations-llc/404.html) directly after publishing.
- Review titles, descriptions, favicon, canonical URL, and social preview metadata on the live domain.
- Review spacing, image rendering, and typography on a phone and a desktop browser.
