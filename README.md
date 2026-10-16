# EJ Quigley personal site

Plain HTML, CSS and a little vanilla JS. No build step, no npm, no frameworks.
Served as the root of https://ejq17.github.io via GitHub Pages (deploys from the `main` branch, root folder).

## Structure

- `index.html` - home page (hero, About, Experience, Projects, Skills, Currently, Outside the work, footer)
- `links/index.html` - link-in-bio page at `/links/`
- `404.html` - not-found page
- `assets/css/site.css` - shared styles and design tokens (light and dark via CSS custom properties at the top)
- `assets/css/links.css` - styles for `/links/` and `404.html`
- `assets/js/site.js` - scroll reveal and mobile menu
- `assets/images/` - favicon, OG image, icon sprite (`icons.svg`)
- `.nojekyll` - tells GitHub Pages to serve files as-is

## Replace the headshot placeholder

The "EQ" monogram is a placeholder.

1. Save your photo as `assets/images/headshot.jpg` (portrait, about 4:5, roughly 800 x 1000 px; it is cropped to fill).
2. In `index.html`, find the `HEADSHOT` comment in the hero and un-comment the `<img>` line below it.
3. Do the same in `links/index.html` (the `AVATAR` comment; the image is cropped to a circle).

The photo is layered on top of the monogram, so nothing else changes.

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
