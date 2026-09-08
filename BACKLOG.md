# Backlog

Open items for the Wulff Land & Property Services site. Ordered roughly by impact.
Tick items off as they're done; add new ones at the bottom of their section.

---

## Blocking — leads are going to the wrong inbox

- [ ] **Add Logan's email as the Formspree recipient.**
      The estimate form posts to `https://formspree.io/f/mdeowjpj`, and that form currently delivers
      to **Brian's** address — confirmed by the two test submissions on 2026-09-07, which both landed
      there. Until this changes, every real estimate request reaches Brian and not Logan.

      **Steps:** log in to [formspree.io](https://formspree.io) → open form `mdeowjpj` → *Settings* →
      add `Wulfflandservices@gmail.com` as a recipient (the free plan allows a second address; if it
      doesn't, replace Brian's address rather than removing notifications entirely). Logan then has
      to click the confirmation email Formspree sends before delivery starts.

      **Verify:** submit the form at
      [/contact.html](https://616fun.github.io/wulff-land-property-services/contact.html) and confirm
      it arrives in Logan's inbox. Delete the test message afterwards.

      *Nothing in this repo controls the destination — the recipient lives in the Formspree account,
      not in the code. No code change is needed for this item.*

- [ ] **Delete the two test submissions** (`SITE TEST - please ignore`, `SITE TEST 2 - please ignore`,
      both from `noreply@example.com`) from the Formspree inbox once the recipient change is verified.

---

## High impact

- [ ] **Buy a domain** (~$12/yr). `wulfflandservices.com` reads far better than a `github.io` URL on a
      truck door or a business card. Add it under repo *Settings → Pages → Custom domain*, then update
      the `SITE` constant used for `canonical`/`og:url` in each page's `<head>` and in `sitemap.xml`
      and `robots.txt`.

- [ ] **Get a daytime photo of Logan working.** The About page uses the only photo of him that exists
      and it was taken at night. A clear daytime shot — on a mower, or standing beside a finished bed —
      is the single highest-impact image change available. People hire people.

- [ ] **Keep asking customers for Google reviews.** Three is a credible start; ten makes the map
      listing competitive for "lawn care near me" searches. The *Read & leave a review on Google*
      button is already on every page — the ask has to happen in person, at the end of a job.

---

## Content

- [ ] **Shoot real before/after pairs.** The 41 gallery photos came from the old Google Site with no
      pairing information, so the gallery shows finished work but can't show transformation. Matched
      before/after sets are the most persuasive content this business can produce. Once there are
      pairs, the gallery can gain a fourth filter for them.

- [ ] **Consider publishing starting rates**, if Logan is comfortable with it. Posting "mowing from
      $X" filters out bad-fit leads before they cost him a drive across the county.

- [ ] **Refresh the gallery seasonally.** Fall cleanup and leaf-removal photos would broaden it beyond
      the current summer-heavy set and support the seasonal services already listed.

---

## Nice to have

- [ ] **Add a favicon-sized logo variant.** The site reuses the full 600px badge; a simplified mark
      would read better at 16px in a browser tab.

- [ ] **Set up Google Search Console** and submit `sitemap.xml`, so indexing and search-term data are
      visible rather than guessed at.

---

## Notes for whoever picks these up

Adding photos, editing CSS/JS, or changing the hero image each have a required follow-up step
(metadata scrubbing, asset re-versioning, link-preview rebuild). Those are documented in
[README.md](README.md) — read the relevant section before committing.
