# Wulff Land & Property Services — Website

A redesign of the business site for **Wulff Land & Property Services** (Logan Wulff, Selma, Indiana),
replacing the original Google Sites page.

**Live:** https://616fun.github.io/wulff-land-property-services/

---

## What this is

A five-page static site. No frameworks, no build step, no dependencies — just HTML, one CSS file,
and one JS file. It can be hosted anywhere (GitHub Pages, Netlify, or a normal web host) for free.

| File | Page |
|---|---|
| `index.html` | Home — hero, services, Google reviews, owner intro, work preview, service area |
| `services.html` | The five services in detail + how the process works |
| `work.html` | Filterable photo gallery (41 photos) with a keyboard-accessible lightbox |
| `about.html` | Logan's story, approach, and the four values |
| `contact.html` | Quote form + every way to reach the business |

## Design

The palette and type are taken directly from the existing badge logo — ink black, steel blue,
brick red, bone white — so the site and the truck decals/business cards read as one brand.

- **Display type:** Barlow Condensed (condensed italic, echoing the logo wordmark)
- **Body type:** Inter
- All tokens live at the top of `assets/css/site.css` under `:root`

## What was improved over the Google Sites version

**Conversion**
- Phone number is visible in the header on desktop and in a fixed call bar on mobile — one tap to call
- A real quote form instead of "Click Here <---" links
- "Free Quote" call-to-action on every screen, at every scroll position
- Google reviews (5.0 ★) surfaced on all five pages

**Content & clarity**
- Service-area rules stated plainly: lawn care is Delaware + Randolph counties; landscaping and
  cleanups extend across East Central Indiana
- Every service gets a photo, a plain-English description, and a scannable list of what's included

**Findability (SEO)**
- Unique title + meta description per page, Open Graph tags for link previews
- `LocalBusiness`/`LandscapingBusiness` structured data including the real 5.0 rating and all three
  review texts — this is what produces star ratings in Google search results
- `sitemap.xml` and `robots.txt`

**Craft**
- Fully responsive, tested at 375px through 1440px
- Keyboard accessible: focus rings, `aria-current`, `aria-pressed`, Escape/arrow keys in the lightbox
- Respects `prefers-reduced-motion`
- Images resized and compressed; below-the-fold images lazy-load
- Degrades gracefully with JavaScript disabled

## The quote form

Out of the box the form opens the visitor's email app with everything pre-filled — so it works
immediately with no server.

To collect submissions properly instead (recommended), create a free form endpoint at
[formspree.io](https://formspree.io) and paste the URL into `contact.html`:

```html
<form class="form" id="quoteForm" method="post" data-endpoint="https://formspree.io/f/YOUR_ID">
```

Submissions will then land in the inbox, and the page shows a confirmation without navigating away.

## Editing

Everything is plain HTML — open a file, change the words, save.

- **Phone / email / links:** search for `393-5386` or `Wulfflandservices` and replace everywhere
- **Reviews:** the review cards are plain HTML in each page; copy an existing `<figure class="review">`
  block and edit it. When the count changes, update the `aggregateRating` block in `index.html`
- **Adding photos:** drop a resized copy in `assets/img/full/` and a ~700px copy in `assets/img/thumb/`,
  then copy an existing `<figure class="shot">` in `work.html` and change the filenames and `data-cat`
  (`lawn`, `landscaping`, or `cleanup`)
- **Nav links:** the header and footer are repeated in each of the five files — change all five

## Recommended next steps

1. **Buy a domain** (~$12/yr) — `wulfflandservices.com` reads far better than a `github.io` URL on a
   truck door or a business card. Add it under Settings → Pages → Custom domain.
2. **Add a daytime photo of Logan working.** The About page currently uses the only available photo of
   him (taken at night). A clear daytime shot — on a mower, or standing by a finished bed — is the
   single highest-impact image change on the site.
3. **Keep asking for Google reviews.** Three is a good start; ten makes the map listing competitive.
   The "Read & leave a review on Google" button is on every page.
4. **Add real before/after pairs.** The gallery photos came from the old site with no pairing
   information. Shooting matched before/after sets is the most persuasive content this business can make.
5. **Post prices or starting rates** if Logan is comfortable — it filters out bad-fit leads.

## Photo credit

All photography is the business's own, pulled from the original Google Sites pages and Facebook page.
