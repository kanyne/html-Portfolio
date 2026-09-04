# Colosseum Berlin — Event App (React + TypeScript MVP)

Mobile-first event booking, check-in and wayfinding app for Colosseum Event Berlin.

## Run

```bash
cd app
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
```

Deploy `dist/` to Vercel or Netlify (SPA rewrite to `/index.html`).

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

Type: **Montserrat** (headings, 28/20/16) + **Open Sans** (body 14, small 12).
Cards 12px radius, buttons 8px, 16px padding, `0 2px 8px rgba(0,0,0,.12)` shadow.
Dark mode is default; a light theme ships via `data-theme="light"` (Profile → Preferences).

## Features (MVP)

1. **Events** — feed, featured carousel, search, filters (type, venue, date window, max price), event detail with description, rules, speakers, capacity bar, related events, share, wishlist.
2. **Venues** — grid/list toggle for Wagenhalle, Galerie, Kinosäle (halls 2–10 table), Saal 1; specs, gallery, layout diagram, formats, amenities, accessibility, gastronomy, combinability, "Check availability" → filtered calendar.
3. **Booking** — tier picker, quantity 1–10, numbered seat selection for cinema events, cart with promo codes (`COLOSSEUM10`, `BERLIN25`, `STAFF`), 4.5% service fee, guest details + demo Stripe-style payment, order confirmation with a unique QR per ticket.
4. **Check-in** — *My bookings* (status, QR sheet, resend) and *Staff dashboard* (PIN `1895`): scan/enter code, valid / already-used / not-found states, attendance & capacity stats, live scan log.
5. **Navigate** — three floor plans (ground, Galerie, cinema level), colour-coded spaces, tappable pins (restrooms, gastronomy, exits, parking, info, elevators), BFS turn-by-turn routing with accessible-route toggle, info cards, Google Maps + BVG link.
6. **Profile** — email sign-up/sign-in, Google/Apple, guest checkout, booking history, wishlist, notification & reminder preferences, favourite event types, dark-mode toggle, support/contact, reset demo data.

## Tech

React 19 + TypeScript, Vite, React Router, Zustand (persisted to `localStorage`), dayjs, `qrcode.react`.
No backend: data lives in `src/data/*`, orders/tickets/scans in local storage — swap the store actions for API calls when a backend exists.

## Accessibility

Semantic landmarks, labelled controls, `role="switch"`/`aria-pressed` toggles, visible focus rings, 14px minimum type, reduced-motion support, keyboard-navigable flows.

## Contact data used

db@colosseumberlin.com · +49 30 921095624 · Auguststraße 20, 10117 Berlin
