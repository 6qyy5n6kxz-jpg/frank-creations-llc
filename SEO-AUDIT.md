# Frank Creations LLC SEO, AI Discoverability, and Technical Audit

Audit date: July 20, 2026

Status update, July 21, 2026: A Change Of Plans launched at `https://achangeofplansmusic.com/`. The Frank Creations page is now a concise umbrella-service overview; the detailed schedule, song catalog, request form, pricing, and direct music-booking experience moved to the standalone site. Historical findings below describe the site as it existed on the original audit date.

## Scope and approach

This audit covers every public or directly reachable HTML page in the repository, along with shared CSS and JavaScript, `sitemap.xml`, forms, structured data, images, and launch documentation. Safe corrections were implemented only where the repository or an official business source established the correct value. The site's visual structure and overall design were preserved.

The canonical public pages are the homepage plus the directory URLs for A Change Of Plans, contact, Cookies & Canvas, event enhancements, graduation parties, packages, photo booth, shop, and Wine & Canvas Toledo. The portfolio placeholder, display utility, 404 page, and six legacy root-level `.html` copies were also reviewed.

Official source checks used for mutable business facts:

- [Wine & Canvas Toledo contact information and hours](https://wineandcanvas.com/toledo/contact-us/)
- [Wine & Canvas Toledo private-party terms](https://wineandcanvas.com/toledo/parties/)
- [Cookies & Canvas Toledo program details](https://wineandcanvas.com/toledo/cookies-canvas/)
- Current event examples at [2806 West Sylvania Avenue](https://wineandcanvas.com/toledo/event/toledo-paint-and-sip-party-aurora-point-lighthouse/) and [5248 Monroe Street](https://wineandcanvas.com/toledo/event/toledo-paint-and-sip-party-dreamy-wine/)

## High priority — business decisions or hosting work required

### 1. Replace legacy duplicate pages with server-side redirects

The repository contains six legacy root-level copies:

- `a-change-of-plans.html`
- `contact.html`
- `cookies-and-canvas.html`
- `photo-booth.html`
- `shop.html`
- `wine-and-canvas-toledo.html`

Their canonical URLs point to the corresponding directory pages, but the legacy copies still contain independently maintained and partly stale body content. They now have `noindex,follow`, and the shared metadata script now respects their declared canonical tags instead of replacing them with self-canonicals. This is an interim safeguard, not a substitute for redirects.

Recommendation: configure permanent HTTP 301 redirects from each root `.html` URL to its directory URL, verify them after deployment, then remove the duplicate files if the hosting platform permits it. The redirect mechanism depends on the production host and was intentionally not guessed.

### 2. Confirm package pricing and inclusions

The package totals do not consistently reconcile with the public component prices:

- Graduation Celebration lists a three-hour photo booth plus a 10-by-20 tent. Those components are shown elsewhere as $450 and $300, totaling $750, but the package page shows an individual starting total of $650, a package price of $600, and $50 savings. The $650 total matches the lowest two-hour booth price plus the tent, not the stated three-hour booth.
- Backyard Party lists a tent ($300), speaker ($75), and microphone ($25), totaling $400, but the package is $450. Confirm whether another included service explains the difference.
- Wedding Essentials lists a three-hour booth ($450), uplighting ($125), speaker ($75), and microphone ($25), totaling $675, but the package is $700. Confirm whether custom audio or another inclusion explains the difference.
- Live Event lists A Change Of Plans and a three-hour booth. The published duo prices and booth price do not produce the displayed $850 total without an unstated pricing rule.
- Complete Outdoor Celebration totals $975 from the listed standalone starting prices and is shown at $950, which is a clear $25 starting-price savings.

Recommendation: establish a single source of truth for each package's duration, inclusions, standalone comparison total, package price, and savings. Then update both the homepage and package page together. Existing figures were left unchanged because the intended commercial terms cannot be inferred safely.

### 3. Confirm the Wine & Canvas Toledo location model

The site consistently presents 5248 Monroe Street as the studio address, and that address appears on the official contact page. Current official event listings, however, use both 5248 Monroe Street and 2806 West Sylvania Avenue. This could represent multiple active venues, event-specific locations, or an incomplete relocation.

Recommendation: confirm whether Frank Creations should describe one studio, two venues, or an event-by-event location model. Keep the address in visible content, contact information, event data, and structured data synchronized after that decision. No address was changed automatically.

### 4. Confirm uncorroborated operational claims

The following visible claims may be correct, but they are not established consistently enough to auto-edit:

- Wine & Canvas private events have a maximum of 20 guests. The current official party page establishes a 10-guest starting point but does not state that maximum.
- Cookies & Canvas offers discounted school/nonprofit pricing and can supply W-9s and invoices. The current official page does not publish those terms.
- A Change Of Plans is the house band at The Mockingbird. Public material confirms the acoustic duo, but this specific relationship needs business confirmation.
- General Frank Creations inquiries route to `infotoledo@wineandcanvas.com`. This is internally consistent, but confirm that the cross-brand mailbox is the intended long-term contact address.

Recommendation: verify each statement with the business owner, then either retain and support it consistently or revise it throughout the site. These claims were intentionally left unchanged.

## Medium priority

### 1. Create a current social sharing image

The repository's 1200-by-630 SVG social preview is identified in project documentation as temporary and reflects older styling/offerings. Current pages use accurate logo or service photography instead.

Recommendation: create an accurate, branded 1200-by-630 raster image and use it consistently where a service-specific photo is not more useful. Keep visible text minimal and verify Facebook, LinkedIn, and X previews after deployment.

### 2. Optimize image delivery

Several source images exceed 500 KB, including the bridal photo booth, family celebration, school celebration, full logo, and monogram assets. The site does not provide responsive `srcset` variants or modern WebP/AVIF alternatives.

Recommendation: resize assets to their largest rendered dimensions, export well-compressed WebP/AVIF variants with JPEG/PNG fallbacks where needed, and add responsive sources. Preserve originals outside the production payload. Dimensions, lazy loading, and high-priority hero loading were added where safe, but lossy asset conversion was not performed automatically.

### 3. Reduce render-blocking and shared payloads

The shared stylesheet is approximately 96 KB, the display utility script is approximately 94 KB, and externally hosted Google Fonts are render-blocking. The display script is confined to its utility page, but the shared stylesheet likely contains page-specific rules.

Recommendation: measure the deployed site with Lighthouse or PageSpeed Insights, then subset or self-host fonts, preload only the fonts actually used above the fold, and split/minify CSS if measurements show a meaningful gain. Avoid speculative removal without coverage data.

### 4. Finish or retire the portfolio placeholder

The portfolio page is an unfinished “coming soon” destination. It is not in the sitemap or primary navigation and now has `noindex,follow`, but direct visitors can still reach it.

Recommendation: publish a real project/gallery page, permanently redirect it to a relevant service page, or remove it from deployment.

### 5. Verify forms end to end

The contact workflows are configured for Formspree and have useful labels and service choices. Repository inspection cannot prove successful production delivery, spam handling, confirmation behavior, or mailbox ownership.

Recommendation: submit each form in production with a controlled test, verify delivery and reply-to behavior, check validation and error states with keyboard and screen-reader workflows, and document the destination account. No live submissions were sent during this audit.

### 6. Add commercial schema only after pricing is confirmed

Service and business structured data now describes the major offerings without fabricated ratings, reviews, or availability. Package and shop Product/Offer markup would be premature while package arithmetic and live inventory remain uncertain.

Recommendation: after confirming package terms and shop inventory, add Offer or Product data only for publicly purchasable, current items with matching visible prices and URLs.

### 7. Perform measured accessibility and contrast testing

The reviewed pages have one H1, logical heading progression, descriptive image alternatives, labeled controls, keyboard-capable native elements, visible focus rules, and descriptive link text. Static inspection cannot conclusively certify rendered color contrast, zoom/reflow behavior, or third-party form states.

Recommendation: test representative pages at 200% and 400% zoom and run automated plus manual keyboard/screen-reader checks in production. Correct any contrast failures using the existing palette rather than redesigning components.

## Low priority

- After redirects are proven, delete the six legacy copies to eliminate future metadata and content drift.
- Add an automated check for unique titles/descriptions, one H1, valid JSON-LD, resolvable internal links, and sitemap-to-file consistency.
- Recheck mutable facts—studio addresses, business hours, contact routing, pricing, and policies—on a scheduled basis.
- Consider a lightweight content field or data file for shared business facts so visible copy and structured data draw from one maintained source.
- Reassess sitemap inclusion when the portfolio becomes substantive. Keep utility, 404, and duplicate pages out of the sitemap.

## Implemented safe improvements

### Search and AI understanding

- Rewrote every canonical title and meta description to be unique, readable, location-aware, and within the requested approximate lengths.
- Synchronized Open Graph and X/Twitter metadata where present and filled the missing social metadata on packages and event enhancements.
- Added concise factual homepage content explaining how Frank Creations relates to Wine & Canvas Toledo, Cookies & Canvas, A Change Of Plans, photo booth rentals, and event enhancements.
- Added natural Northwest Ohio and Southeast Michigan service-area language to primary discovery/contact content without repeating city lists across every page.
- Added valid JSON-LD for the website, Frank Creations, the main service catalog, photo booth rentals, event enhancements, A Change Of Plans, Wine & Canvas Toledo, Cookies & Canvas, and selected visible graduation FAQs.
- Used only visible or corroborated facts; no reviews, ratings, availability, or unsupported prices were invented.

### Indexing and canonicalization

- Added `robots.txt` with crawl permission and the production sitemap location.
- Preserved the sitemap's canonical directory URLs and verified that its listed pages map to repository pages.
- Added `noindex` directives to the legacy duplicate files, portfolio placeholder, 404 page, and display utility as appropriate.
- Corrected the shared metadata script so a declared canonical URL is not overwritten at runtime.

### Content quality, trust, and internal links

- Replaced placeholder homepage reviews and empty star ratings with factual service-relationship cards and descriptive internal links.
- Removed the unattributed package-page quotation.
- Standardized the homepage's “Complete Outdoor Celebration” package name with the package page.
- Confirmed that canonical pages have no broken local links or fragment targets and that the main service paths cross-link logically.
- Reviewed the 14-question graduation FAQ for duplication and consistency; no question was removed or substantively rewritten because operational answers require business ownership.

### Images, accessibility, and performance

- Confirmed that reviewed images have alternative text; decorative presentation remains handled by CSS where applicable.
- Corrected inaccurate intrinsic image dimensions and added missing dimensions to static content images.
- Added lazy loading to below-the-fold content images and high fetch priority to key hero images.
- Preserved native labeled form controls, accessible slideshow labels, keyboard behavior, and focus styles.
- Encoded ampersands correctly in HTML attributes and external font URLs.

### Maintainability

- Updated the README and launch checklist to use canonical directory URLs and accurately describe the configured forms and remaining launch verification.

## Page-by-page review summary

| Page | Result |
| --- | --- |
| Homepage | Metadata improved; organization/service relationships and service area clarified; placeholder reviews removed; schema and image delivery improved. |
| Photo Booth | Metadata, service schema, dimensions, lazy loading, and service-area wording verified/improved. Public starting price remains $350. |
| Graduation Parties | Metadata improved; existing service schema expanded with visible FAQs; heading hierarchy and internal links verified. Package-price conflict remains for confirmation. |
| Packages | Metadata/social tags improved; unattributed quote removed; naming standardized. Pricing conflicts remain unchanged and documented above. |
| Event Enhancements | Metadata/social tags and Service schema added; component prices preserved. |
| A Change Of Plans | Metadata, MusicGroup/Service schema, and image dimensions improved. “House band” claim remains for confirmation. |
| Wine & Canvas Toledo | Metadata and corroborated LocalBusiness/contact-hours schema improved. Venue/address model and 20-person maximum remain for confirmation. |
| Cookies & Canvas | Metadata and Service schema improved. Discount, W-9, and invoicing claims remain for confirmation. |
| Contact | Metadata and local service-area wording improved; form labels and choices reviewed. Form delivery and shared mailbox require operational verification. |
| Shop | Metadata improved. No speculative Product/Offer schema added because current inventory is not modeled in the repository. |
| Portfolio | Placeholder kept out of the index pending a publish/redirect/removal decision. |
| 404 and display utility | Kept out of the search index; no primary-navigation or sitemap exposure found. |
| Six legacy `.html` pages | Metadata synchronized, canonical behavior repaired, and `noindex` added pending real 301 redirects. |

## Robots, sitemap, and indexing findings

- `robots.txt` now permits normal crawling and identifies `https://frankcreationsllc.com/sitemap.xml`.
- `sitemap.xml` contains the homepage and all nine canonical public directory pages.
- No sitemap entry points to a legacy duplicate, 404 page, portfolio placeholder, or display utility.
- No important canonical page is blocked by robots metadata.
- “Obsolete pages removed” remains incomplete until the hosting redirect decision is implemented; the duplicate files were retained to avoid breaking unknown inbound links without a redirect.

## Validation performed

- Parsed every JSON-LD block as JSON successfully.
- Verified titles and descriptions across all 19 HTML files; titles are under 60 characters and descriptions are 145–160 characters after decoding HTML entities. Canonical-page titles and descriptions are unique.
- Verified exactly one H1 on every canonical page and checked heading order for avoidable level skips.
- Verified internal repository links and fragment targets on the reviewed HTML pages.
- Verified that static content images have alternative text; all but the intentionally source-less dynamic graduation lightbox image have intrinsic dimensions.
- Ran JavaScript syntax checks on all repository JavaScript files.
- Checked CSS delimiter balance on the two stylesheets. A modern standards-aware CSS validator is not installed in this repository.
- Checked common HTML structural constraints and corrected raw attribute ampersands. The available system validator predates HTML5, so its expected errors for semantic HTML5 elements are not treated as product defects.
- Served the site locally and received HTTP 200 responses for every canonical page, `robots.txt`, and `sitemap.xml`.
- Ran `git diff --check` successfully.

Visual browser behavior, production response headers, Core Web Vitals, third-party form delivery, DNS/redirect configuration, and rendered color contrast require deployed-environment testing.

## Files changed by this audit

- Root/support: `index.html`, `404.html`, `README.md`, `LAUNCH-CHECKLIST.md`, `robots.txt`, `SEO-AUDIT.md`
- Canonical pages: `a-change-of-plans/index.html`, `contact/index.html`, `cookies-and-canvas/index.html`, `event-enhancements/index.html`, `graduation-parties/index.html`, `packages/index.html`, `photo-booth/index.html`, `portfolio/index.html`, `shop/index.html`, `wine-and-canvas-toledo/index.html`
- Legacy duplicate safeguards: `a-change-of-plans.html`, `contact.html`, `cookies-and-canvas.html`, `photo-booth.html`, `shop.html`, `wine-and-canvas-toledo.html`
- Shared assets/utilities: `assets/css/styles.css`, `assets/js/main.js`, `studio-display.html`

`data/events.json` was already modified in the working tree before this audit and was intentionally not changed as part of this work.
