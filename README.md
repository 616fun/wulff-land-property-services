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
| `work.html` | Filterable gallery of 41 job photos with a keyboard-accessible lightbox |
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
- Copy rewritten in a consistent professional register (see *Voice and tone* below)
- Service area explained rather than restricted: mowing runs on a weekly route through Delaware and
  Randolph counties (which is *why* the schedule holds), while landscaping, cleanups and project work
  travel across East Central Indiana
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

## The estimate form

**Read this before Logan starts advertising the site.**

Right now the form has no backend, so submitting it does **not** email anyone. Instead it hands the
visitor their finished message and three ways to send it: as a text, as an email, or by calling. That
is deliberate — the previous behaviour tried to open the visitor's mail app silently, which does
nothing at all on a device with no mail handler configured. The visitor would think they had sent a
request and Logan would never know it existed.

The current flow always gives the visitor a working path, but it still depends on them taking a
second action. **Wiring a real endpoint is the single highest-value improvement left on this site.**

To do it, create a free form endpoint at [formspree.io](https://formspree.io) and paste the URL into
`contact.html`:

```html
<form class="form" id="quoteForm" method="post" data-endpoint="https://formspree.io/f/YOUR_ID"
```

The moment that attribute is non-empty the JavaScript posts the request, submissions land in the
inbox, and the visitor sees "Request received." without leaving the page. No other change is needed.

With JavaScript disabled the form falls back to its `action="mailto:..."` target.

## Editing

Everything is plain HTML — open a file, change the words, save.

- **Phone / email / links:** search for `393-5386` or `Wulfflandservices` and replace everywhere
- **Reviews:** the review cards are plain HTML in each page; copy an existing `<figure class="review">`
  block and edit it. When the count changes, update the `aggregateRating` block in `index.html`
- **Adding photos:** drop a resized copy in `assets/img/full/` and a ~700px copy in `assets/img/thumb/`,
  then copy an existing `<figure class="shot">` in `work.html` and change the filenames and `data-cat`
  (`lawn`, `landscaping`, or `cleanup`)
- **Nav links:** the header and footer are repeated in each of the five files — change all five

## Voice and tone

The copy is written to read as a professional trade business. If you edit or add to it, keep to
these rules so the site stays consistent:

- **Professional register throughout.** Complete sentences, specific nouns, no slang, no filler
  intensifiers ("really", "super"), no exclamation points, no rhetorical questions in body copy.
- **"We" is the business; "I" is Logan.** Business capability, process, and standards are stated as
  *we*. First person singular is used only on the About page, where it is clearly Logan speaking.
- **Consistent terminology.** The offer is an *estimate*, everywhere — not a mix of quote, estimate,
  and free look. Services are named the same way in the nav, the cards, and the footer.
- **State capability, not enthusiasm.** "We assess every property in person before quoting" reads as
  a commitment; "we'll give you a straight number" reads as a boast. Prefer the former.
- **Don't overstate the size of the business.** The gallery is described as *41 photos*, not 41
  properties or 41 customers; the review section says *three* Google reviews on its face. Obvious
  honesty is an asset for a new local business — inflated numbers are the fastest way to lose it.

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

## Link previews

`assets/img/og.jpg` is the 1200x630 card shown when the URL is pasted into a text, a Facebook post,
or a Slack message. It is the hero photograph with the badge logo composited over it, so a shared
link reads as the business rather than as an anonymous lawn. Every page points at it via `og:image`
and `twitter:image`.

Rebuild it after changing the hero photo — edit `PHOTO` at the top of the script, and `CROP_Y` if
you want the crop biased above or below centre (the script cover-scales any aspect ratio, so a
square source works fine):

```bash
python3 tools/make-og-image.py
```

Facebook and LinkedIn cache these aggressively — after replacing it, run the URL through
[Facebook's Sharing Debugger](https://developers.facebook.com/tools/debug/) and hit *Scrape Again*.

## Photo selection

The Home and Services pages use residential photographs only. Commercial and large-lot work stays in
the gallery, where it belongs — the pages a prospective homeowner lands on should show properties
that look like theirs.

## After editing CSS or JS

GitHub Pages caches assets for about ten minutes, so a returning visitor can run stale JavaScript
against fresh HTML. The `<link>` and `<script>` tags carry a content hash for that reason. Re-stamp
it whenever you change `assets/css/site.css` or `assets/js/site.js`:

```bash
python3 tools/version-assets.py
```

The hash changes only when the file does, so unchanged assets stay cached.

## Customer privacy — image metadata

Phone photos embed GPS coordinates in EXIF. Publishing those would expose the exact
addresses of the customers whose properties are shown. **Every image in `assets/img/` has had all
EXIF, GPS, XMP and IPTC metadata stripped** (only the JFIF header and the ICC colour profile are kept,
so colours are unaffected and the pixel data is untouched).

After adding any new photo, run:

```bash
python3 tools/strip-metadata.py
```

It scrubs everything under `assets/img/` and then verifies that no `Exif`, `GPS`, XMP or IPTC markers
remain — it exits non-zero if any do. Captions in the gallery are deliberately generic
(service type only, no street names or addresses) for the same reason.

## Photo credit

All photography is the business's own, pulled from the original Google Sites pages and Facebook page.
