# EJ Quigley personal site

Plain HTML, CSS and a little vanilla JS. No build step, no npm, no frameworks.
Served as the root of https://edwardquigley.com via GitHub Pages (deploys from the `main` branch, root folder).

## Structure

- `index.html` - home page (hero, About, Experience, How I got here, Projects, Skills, Right now, Outside the work, Get in touch, footer)
- `links/index.html` - link-in-bio page at `/links/`
- `resume/index.html` - the virtual résumé at `/resume/`. Content is plain HTML in résumé order. The Download button calls `window.print()`, and the `@media print` block in `resume.css` lays it out as a clean PDF. Keep it to what the printed version should say.
- `speaking/`, `conferences/`, `certifications/` - one card per entry (`<article class="card entry">`). Add a card, then add the matching one-liner to the résumé page and, if it is a highlight, update the "Off the keyboard" cards on the home page.
- `assets/css/resume.css` - styles for those four pages, including the print layout
- `404.html` - not-found page
- `assets/css/site.css` - shared styles and design tokens (light and dark via CSS custom properties at the top)
- `assets/css/links.css` - styles for `/links/` and `404.html`
- `assets/js/site.js` - scroll reveal, mobile menu, accent easter egg, portrait tilt, GitHub activity strip, command palette
- `assets/fonts/` - Inter, self-hosted as a Latin-subset woff2 in four weights (400, 500, 600, 700). No third-party font requests.
- `assets/images/` - favicon, OG images (one per page where it matters), icon sprite (`icons.svg`)
- `assets/data/contributions.json` - GitHub contribution calendar, written by the nightly Action (see Home page extras)
- `scripts/` and `.github/workflows/` - the contribution refresh
- `robots.txt` and `sitemap.xml` - add a `<url>` to the sitemap when you add a page
- `.nojekyll` - tells GitHub Pages to serve files as-is

## Photos

- `assets/images/headshot.jpg` is the home-page portrait (4:5, 800 x 1000, cropped to fill). `headshot.webp` is the same image, served first via `<picture>`.
- `assets/images/avatar.jpg` is the circular avatar on `/links/` (square, 416 x 416), with `avatar.webp` alongside.

To change the photo, replace those files with the same sizes and regenerate the WebP versions (`cwebp -q 82 in.jpg -o out.webp`). Keep originals that include other people out of this folder; everything here is published.

## Edit content

All copy lives directly in the HTML files. Search for the text and edit it.

- Projects: each is one `<article class="card project ...">` in the `#projects` section. Remove the `<a>` around the title and the `.go` span for a card with no link.
- Links page: each row is one `<li>` in `links/index.html`.
- Colors: change the variables in `:root` in `site.css` (the accent is `--accent`; the dark theme overrides sit in the `prefers-color-scheme: dark` block).
- OG images: `og-image.png` (home, links, 404), `og-now.png`, `og-tabscribe.png`, `og-casematch.png`, all 1200 x 630 PNG.
- Dates: the résumé PDF is the source of truth for role dates (Coropos December 2024, NextStep December 2025, Casematch August 2026). The Experience cards, timeline, and résumé page all use them.
- Contact: the email address appears in the Get in touch section and footer of `index.html`, and on `/links/`. Search for `mailto:` to change it.
- The Person JSON-LD block is in the `<head>` of `index.html`.

## Deploy

Push to `main`. In the repo settings, Pages is set to "Deploy from a branch", branch `main`, folder `/ (root)`, with the custom domain `edwardquigley.com` (the `CNAME` file in the repo root; do not delete it). DNS lives at Cloudflare: four `A` records on the apex pointing at GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153), the matching `AAAA` records, and a `CNAME` for `www` pointing at `ejq17.github.io`, all DNS-only. GitHub redirects `ejq17.github.io` and `www.edwardquigley.com` to the apex. Project sites such as the Tabscribe app also move under the domain (`edwardquigley.com/tabscribe/`). Absolute URLs in the HTML (canonical, OG, sitemap) use `https://edwardquigley.com`.

## Preview locally

    python3 -m http.server 8765

Then open http://localhost:8765/ (paths are root-relative, so open it through a server, not as a file).

## Home page extras

- **How I got here** (`#story`): a vertical timeline, one `<li class="timeline-item">` per beat in `index.html`. Add or edit beats there; keep them dated only when the date is confirmed.
- **Hero motion**: the background wash drifts a few px on scroll (pure CSS scroll-driven animation in `site.css`, `wash-drift`). The portrait tilts up to 3 degrees toward the pointer with a faint highlight (`site.js`, `.headshot-shell`). Both are off under `prefers-reduced-motion`, and the tilt is off on touch devices.
- **Easter egg**: in "Outside the work", the small papaya dot on the Formula 1 card is a button (`data-papaya`). It toggles `data-theme-accent="papaya"` on `<html>`, which swaps `--accent` and the derived accent tokens to McLaren papaya `#FF8000` (dark text on papaya fills; accent text uses darker/lighter papaya tones for AA contrast). The choice persists for the session in `sessionStorage` (`ejq-accent`) and applies on any page that loads `site.js`. The overrides are the `html[data-theme-accent="papaya"]` rules in `site.css`.
- **Contribution graph** (`.contrib`, inside "Right now"): the browser reads `assets/data/contributions.json` and draws the 53-week grid as inline SVG (`site.js`). Cells use the accent color at four opacities, so it follows dark mode and the papaya toggle. The JSON is refreshed nightly by `.github/workflows/contributions.yml`, which runs `scripts/fetch-contributions.sh` with the Action's own token and commits only when the data changed. To refresh by hand with the gh CLI signed in: `./scripts/fetch-contributions.sh`. If the file is missing or empty the card stays hidden.
- **Recent on GitHub** (`#activity`, inside "Right now"): the browser fetches `https://api.github.com/users/ejq17/events/public?per_page=30` (unauthenticated, 60 requests per hour per visitor IP), groups it into up to 6 rows, and caches the trimmed result in `sessionStorage` (`ejq-gh-events`) for 10 minutes. All text is set with `textContent`. If the fetch fails or returns nothing useful, the static line "Recent activity lives on GitHub." stays.
- **Command palette**: Cmd+K or Ctrl+K (no visible button; it is a shortcut for people who look for one). It is a `<dialog id="cmdk">` at the end of `index.html`. The entry list is the `ENTRIES` array in `assets/js/site.js` (label, URL, group); edit it to add or remove entries.
- **Project cards**: four cells. Tabscribe links to `/projects/tabscribe/` and Casematch to `/projects/casematch/`, each with a small secondary link to the external site or live app. Pulse has no link, so it uses `project-unlinked` and says so. Coropos and NextStep live under Experience, not Projects.
- **Glass**: only the header, ghost buttons, and cards with `card-feature` use `backdrop-filter`. Plain cards are translucent but not blurred, which keeps scrolling smooth.

## Pages added in round 2

- `now/index.html` - the Now page (`/now/`). Edit the five cards directly; optional extra cards (aircraft, tune, reading) are documented in an HTML comment inside the page. Update the "Last updated" line when you change it.
- `projects/tabscribe/index.html` - Tabscribe project page with a scripted "notes in, tab out" demo (`assets/js/tabscribe-demo.js`; the melody and tuning are constants at the top) and an embed of the live app.
- `projects/casematch/index.html` - Casematch preview page. The walkthrough in `assets/js/casematch-demo.js` uses only sample data (the sample role and the candidate defaults are constants at the top). Keep it labeled as a preview.
- Page CSS: `assets/css/now.css`, `assets/css/project.css` (Tabscribe), `assets/css/casematch.css`.
