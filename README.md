# Colosseum Berlin — Guest App

A modern, mobile-first web app concept for [Colosseum Eventlocation Berlin](https://www.colosseumberlin.com/) — the historic cinema and event house at Schönhauser Allee.

## Features

| Core feature | How it works in the app |
|---|---|
| Event calendar | Browse 18 upcoming cinema, premiere, concert, corporate & community events with category filters, live search and date groups |
| Venue info | Six spaces (Atrium, Wagenhalle, Galerie, Saal 1, Kinosäle 2–10, Foyer) with real hard facts, capacities, amenities and event formats |
| Online ticketing | Ticket category selection, quantity stepper, demo checkout, persistent tickets with per-ticket scannable QR codes |
| Mobile check-in | Staff check-in screen: camera QR scanning (progressive `BarcodeDetector`), manual code entry, demo scan, validation/duplicate/invalid states, scan log |
| Push notifications | Browser Notification API + in-app notification center with demo reminders and premiere announcements |
| Venue navigation | Interactive floor plan (3 floors), pins for spaces/entrances/parking/restrooms/garderobe/lift/bar, Dijkstra route planning with animated path |

Extras: English/Deutsch language toggle, offline support (service worker), installable PWA manifest, demo data reset, bottom-tab app shell, onboarding screen.

## Notes

- **Demo concept** — all events, seating and transactions are simulated locally (localStorage). No production backend, payment or push infrastructure is connected.
- QR codes are generated in-browser by `assets/js/qrcode.js`, a self-contained ISO/IEC 18004 encoder (byte mode, EC level M, versions 1–10). Its output was verified cell-for-cell against the reference Arase implementation and round-trip decoded independently from a rendered PNG.
- The visual marquee / interior imagery is AI-generated concept art for the demo.

## Run

Serve the folder over HTTP (or any static host):

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

No build step required.
