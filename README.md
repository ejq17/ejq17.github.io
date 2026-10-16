# EJ Quigley personal site

Plain HTML, CSS and a little vanilla JS. No build step, no npm, no frameworks.
Served as the root of https://ejq17.github.io via GitHub Pages (deploys from the `main` branch, root folder).

## Structure

- `index.html` - home page (hero, About, Experience, How I got here, Projects, Skills, Currently, Outside the work, footer)
- `links/index.html` - link-in-bio page at `/links/`
- `404.html` - not-found page
- `assets/css/site.css` - shared styles and design tokens (light and dark via CSS custom properties at the top)
- `assets/css/links.css` - styles for `/links/` and `404.html`
- `assets/js/site.js` - scroll reveal, mobile menu, accent easter egg, portrait tilt, GitHub activity strip, command palette
- `assets/images/` - favicon, OG image, icon sprite (`icons.svg`)
- `.nojekyll` - tells GitHub Pages to serve files as-is

## Photos

- `assets/images/headshot.jpg` is the home-page portrait (4:5, 800 x 1000, cropped to fill).
- `assets/images/avatar.jpg` is the circular avatar on `/links/` (square, 416 x 416).

To change the photo, replace those two files with the same sizes. Keep originals that include other people out of this folder; everything here is published.

## Edit content

All copy lives directly in the HTML files. Search for the text and edit it.

- Projects: each is one `<article class="card project ...">` in the `#projects` section. Remove the `<a>` around the title and the `.go` span for a card with no link.
- Links page: each row is one `<li>` in `links/index.html`.
- Colors: change the variables in `:root` in `site.css` (the accent is `--accent`; the dark theme overrides sit in the `prefers-color-scheme: dark` block).
- OG image: `assets/images/og-image.png` (1200 x 630). Social sites do not render SVG, so it is a PNG.
- The Person JSON-LD block is in the `<head>` of `index.html`.

## Deploy

Push to `main`. In the repo settings, Pages should be set to "Deploy from a branch", branch `main`, folder `/ (root)`. The repo must be named `ejq17.github.io` for the site to live at the root URL.

## Preview locally

    python3 -m http.server 8765

Then open http://localhost:8765/ (paths are root-relative, so open it through a server, not as a file).

## Home page extras

- **How I got here** (`#story`): a vertical timeline, one `<li class="timeline-item">` per beat in `index.html`. Add or edit beats there; keep them dated only when the date is confirmed.
- **Hero motion**: the background wash drifts a few px on scroll (pure CSS scroll-driven animation in `site.css`, `wash-drift`). The portrait tilts up to 3 degrees toward the pointer with a faint highlight (`site.js`, `.headshot-shell`). Both are off under `prefers-reduced-motion`, and the tilt is off on touch devices.
- **Easter egg**: in "Outside the work", the small papaya dot on the Formula 1 card is a button (`data-papaya`). It toggles `data-theme-accent="papaya"` on `<html>`, which swaps `--accent` and the derived accent tokens to McLaren papaya `#FF8000` (dark text on papaya fills; accent text uses darker/lighter papaya tones for AA contrast). The choice persists for the session in `sessionStorage` (`ejq-accent`) and applies on any page that loads `site.js`. The overrides are the `html[data-theme-accent="papaya"]` rules in `site.css`.
- **Recent on GitHub** (`#activity`, inside "Currently"): the browser fetches `https://api.github.com/users/ejq17/events/public?per_page=30` (unauthenticated, 60 requests per hour per visitor IP), groups it into up to 6 rows, and caches the trimmed result in `sessionStorage` (`ejq-gh-events`) for 10 minutes. All text is set with `textContent`. If the fetch fails or returns nothing useful, the static line "Recent activity lives on GitHub." stays.
- **Command palette**: Cmd+K or Ctrl+K, or the "K" hint button in the header (hidden without JS). It is a `<dialog id="cmdk">` at the end of `index.html`. The entry list is the `ENTRIES` array in `assets/js/site.js` (label, URL, group); edit it to add or remove entries.
- **Project cards**: Tabscribe links to `/projects/tabscribe/` and Casematch to `/projects/casematch/`, each with a small secondary link to the external site or live app.

## Pages added in round 2

- `now/index.html` - the Now page (`/now/`). Edit the four cards directly; optional extra cards (aircraft, tune, reading) are documented in an HTML comment inside the page. Update the "Last updated" line when you change it.
- `projects/tabscribe/index.html` - Tabscribe project page with a scripted "notes in, tab out" demo (`assets/js/tabscribe-demo.js`; the melody and tuning are constants at the top) and an embed of the live app.
- `projects/casematch/index.html` - Casematch preview page. The walkthrough in `assets/js/casematch-demo.js` uses only sample data (the sample role and the candidate defaults are constants at the top). Keep it labeled as a preview.
- Page CSS: `assets/css/now.css`, `assets/css/project.css` (Tabscribe), `assets/css/casematch.css`.
