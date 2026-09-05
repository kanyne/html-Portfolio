# Colosseum Berlin — Event App (React + TypeScript MVP)

Mobile-first event booking, guest check-in and wayfinding app for Colosseum Event Berlin.

## Run

```bash
cd app
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm test         # renders every route + runs the booking/check-in/routing logic suite
```

## Deploy

Both configs are committed — connect the repo and point the project root at `app/`.

- **Vercel** — `vercel.json` (Vite preset, SPA rewrite, immutable asset caching).
- **Netlify** — `netlify.toml` (Node 22, `dist` publish, SPA redirect).

Manual: `npm run build`, then upload `dist/`. Any static host works as long as unknown
paths fall back to `/index.html` (the app uses history routing).

## Design system

| Token | Value | Use |
| --- | --- | --- |
| Primary red | `#E31C1C` | CTAs, active tab, highlights |
| Red dark | `#C41E1E` | Button hover |
| Black | `#1A1A1A` | Surfaces, dark background |
| White | `#FFFFFF` | Text on dark, light cards |
| Dark teal | `#2D5F6F` | Secondary accents |
| Amber | `#F5A623` | Featured / limited badges |
| Light gray | `#F5F5F5` | Light-mode surfaces |

Type: **Montserrat** (headings 28/20/16) + **Open Sans** (body 14, small 12).
Cards 12px radius, buttons 8px, 16px padding, `0 2px 8px rgba(0,0,0,.12)` shadow.
Dark mode is default; a light theme ships via `data-theme="light"` (Profile → Preferences).

## Features (MVP)

1. **Events** — feed, featured carousel, search, filters (type, venue, date window, max price), detail view with description, rules, speakers, capacity bar, related events, share, wishlist. The 18 events are the **real September–October 2026 programme** sampled from [colosseumberlin.com/event](https://www.colosseumberlin.com/event) — Gysis Begegnungen, Irvine Welsh, Cornelia Funke, Christoph Kramer, ÜBERDOSIS CRIME, babywho CONNECT and more — each linking out to its official box-office page.
2. **Venues** — grid/list toggle for Wagenhalle, Galerie, Kinosäle (halls 2–10 table) and Saal 1; specs, photo gallery, layout diagram, formats, amenities, accessibility, gastronomy, combinability, "Check availability" → filtered calendar.
3. **Booking** — tier picker, quantity 1–10, numbered seat selection for cinema events, cart with promo codes (`COLOSSEUM10`, `BERLIN25`, `STAFF`), 4.5% service fee, guest details + demo Stripe-style payment, confirmation with a unique QR per ticket.
4. **Check-in** — *My bookings* (status, QR sheet, resend) and *Staff dashboard* (PIN `1895`): scan/enter code, valid / already-used / not-found states, attendance & capacity stats, live scan log.
5. **Navigate** — three floor plans (ground, Galerie, cinema level), colour-coded spaces, tappable pins (restrooms, gastronomy, exits, parking, info, elevators), BFS turn-by-turn routing with an accessible-route toggle, info cards, Google Maps + BVG link.
6. **Profile** — email sign-up/sign-in, Google/Apple, guest checkout, booking history, wishlist, notification & reminder preferences, favourite event types, dark-mode toggle, support/contact, reset demo data.

## Tech

React 19 + TypeScript, Vite, React Router, Zustand (persisted to `localStorage`), dayjs, `qrcode.react`.
Installable PWA (`public/manifest.webmanifest`, standalone display, app shortcuts).
No backend: data lives in `src/data/*`; orders, tickets and scans live in local storage — swap the
store actions in `src/store.ts` for API calls when a backend exists.

Bundle: ~105 KB gzipped JS + ~3 KB gzipped CSS (budget was 500 KB).

## Tests

`npm test` runs two suites, no test framework required:

- `tests/render.mjs` — bundles the app and mounts all 11 routes in jsdom, asserting each paints content and the 5-tab nav.
- `tests/logic.mjs` — 32 assertions over the cart maths, promo codes, service fee, checkout, QR ticket issuance, scan states (valid / reused / invalid), scan log, wishlist, preferences, persistence, demo reset, and the wayfinding graph (elevator routing, reachability, step narration).

## Halls & floor plan

`src/data/halls.ts` holds the ten halls with the areas and seat counts published on
colosseumberlin.com — Saal 1 (535 m² / 525) plus Kinosäle 2–10, **2,677 seats over 2,975 m²** in
total, matching the "2,600 seats" the venue advertises. These numbers drive the Navigate floor
plan, the capacity table and the portfolio stats; `tests/halls.mjs` asserts every published figure
and checks each hall has a map pin reachable from the street.

The cinema level draws all nine kino halls individually, sized roughly in proportion to their real
floor area, arranged around the central Kinosäle foyer that every hall opens off.

## Portable preview

    npm run build:portable

Produces `dist-portable/` — **double-click `index.html` and it runs**, no server, no install.
Two differences from the hosted build make that possible: `base: './'` for relative asset URLs,
and a `HashRouter` instead of `BrowserRouter` (history routing cannot work over `file://`).
`scripts/portable.mjs` then rewrites the root-absolute `/img/` paths to be document-relative and
strips the service-worker registration. Ship the folder, or zip it — `colosseum-portable-preview.zip`
in the repo root is exactly that, ~1.9 MB.

`tests/portable.mjs` boots the built output through a genuine `file://` document URL and asserts
it renders, that the nav is hash-based and that hash navigation and every bundled image resolve.

## 360° virtual tour

The Navigate tab embeds the venue's official nexpics/mediaglobe panorama tour
(`src/data/tour.ts`). The player takes a deep-link hash — `#media-name=<scene>&yaw&pitch&fov` —
so all eight scenes are addressable, and each is mapped to its floor-plan node: tapping a pin for
the Wagenhalle, Galerie, Saal 1, Saal 4, Saal 10 or the Kinosäle foyer offers **"Look inside in
360°"**, which scrolls to the viewer and loads that panorama. Venue pages link to their own scene.

Because the player is third-party and may refuse framing, `TourViewer` falls back to a
"launch in a new tab" card if the iframe hasn't loaded within six seconds. `tests/tour.mjs`
validates every deep link, including percent-encoding of the `Außen` scenes.

## Portfolio

`/portfolio` is a reference showcase of productions that have run in the house (`src/data/portfolio.ts`),
filterable by format, each with the spaces used, realised guest numbers, layout and production notes.
Photos live in `public/img/portfolio/`.

## Imagery

**Event artwork** is the official poster/thumbnail for each listing, loaded straight from the
Colosseum website's CDN (see `POSTER` + `wix()` in `src/data/events.ts`). Posters arrive in very
different aspect ratios — tall tour posters, wide film stills, small logos — so `EventImage`
renders them *contained* over a blurred venue photo rather than cropping titles and faces out of
frame. If the CDN is unreachable the component silently falls back to the local venue photograph
(covered by `tests/posters.mjs`).

**Venue photography:** `public/img/` holds real Colosseum Berlin venue photography (Wagenhalle, the "Zu den Kinos 6–10"
staircase, the neon bar, Saal 1, cinema halls, Galerie and foyer levels). Replace files in place
to swap in the official press kit — filenames are referenced from `src/data/venues.ts` and
`src/data/events.ts`.

## Contact data used

db@colosseumberlin.com · +49 30 921095624 · Auguststraße 20, 10117 Berlin
