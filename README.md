# Nana Koranteng — Media Editor Portfolio

A cinematic, dark-themed single-page portfolio for **Nana Koranteng — media editor**
(“No limit to perfection.”). Plain HTML/CSS/JS — no build step.

## Run it

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just open `index.html` in a browser.

## Structure

- `index.html` — single-page portfolio (hero, work, about, process, toolkit, testimonials, contact brief)
- `css/style.css` — all styles (cinematic dark theme, amber accent, grain overlay)
- `js/main.js` — scroll reveals, stat counters, project filters, scrollspy, mobile menu, form state
- `public/` — older archived HTML exercises (not linked from the new site)
- `assets/images/` — legacy screenshots from the archived pages

## Notes

- **Logo**: loaded from `nanakaddonyarko.com` (your own site). The artwork is
  white-on-black, so `mix-blend-mode: screen` removes the black and blends it
  seamlessly into the dark UI. To use a local copy, save it as
  `assets/images/nk-logo.png` and swap the three `<img>` sources.
- **Projects/thumbnails**: hotlinked from Vimeo CDN; each card links to the
  video on Vimeo.
- **Contact form** is front-end only — hook it to Formspree (or similar) to
  receive briefs by email.
