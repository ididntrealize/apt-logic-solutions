# Apt Logic Solutions

Source for [aptlogicsolutions.com](https://aptlogicsolutions.com/), a plain static site hosted on GitHub Pages. There is no build step: push to the publishing branch and the files are served as-is.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `services.html` | Services |
| `case-studies.html` | Case studies |
| `diy-guide.html` | DIY website guide |
| `anko-retail-case-study.html`, `bg-foods-case-study.html`, `food-for-heart-case-study.html` | Case study write-ups |
| `404.html` | Not-found page (GitHub Pages serves it for any missing URL, so it uses root-absolute `/…` paths) |

## Shared styles and scripts

- Every page uses the same `css/site.css` and `scripts/site.js`. There are no frameworks or third-party libraries (Statsig analytics loads once the page is idle).
- Fonts (Lexend, Merienda) are self-hosted in `assets/fonts/` under the SIL Open Font License.
- Images live in `assets/images/<section>/`, each with a `.webp` version and a JPG/PNG fallback.

## Editing notes

- The header, mobile menu, contact form and footer are repeated in each page. When you change one, update every new page: `index.html`, `services.html`, `case-studies.html`, the three `*-case-study.html` pages, `diy-guide.html` and `404.html`.
- Service cards appear on both the homepage carousel and the services page; case studies appear on both the homepage and `case-studies.html`.
- Old `?page=…` links from the previous site still work (handled by a small script at the top of `index.html`): `process.html` goes to the DIY guide, `pricing.html` to the contact form, `anko.html`, `bgfoods.html` and `foodforheart.html` to their case study pages, and anything else to the case studies page.
- Add new pages to `sitemap.xml`.

## Domain

`CNAME` tells GitHub Pages to serve the site at `aptlogicsolutions.com`. At the DNS provider for the domain:

| Type | Host | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA (optional) | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME | `www` | `ididntrealize.github.io` |

See GitHub's [custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
