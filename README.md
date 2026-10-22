# Alkan Business Consult

Responsive website rebuilt from alkanbiz.com and the two supplied PDFs. Vanilla JavaScript, CSS and Vite. Fonts, book covers and an original-logo fallback are local; the original website gallery and videos load from alkanbiz.com. No runtime API or backend is required.

## Run

```sh
npm install
npm run dev
npm run build
npm test
# With the dev server running:
npm run test:e2e
```

The production site is generated in `dist/`. Deploy that directory to any static host. Main navigation uses hash routes, so no server-side rewrites are required.

## Sources and editorial decisions

- https://alkanbiz.com/ — company positioning, contacts, client names.
- https://alkanbiz.com/about-us/ — company approach and institution training history.
- Supplied **PROPOSAL pdf.pdf**, *Corporate Profile and Training Programs*, July 2026, 21 pages — background, slogan, services, resource people, methodology, full nine-programme catalogue and source fees.
- Supplied **The_Modern_Branch_Managers_Companion_compressed.pdf**, 436 PDF pages — title, author, ISBN, themes, foreword, endorsements, author portrait, cover and two earlier books (printed pages 401–402).

The newer supplied proposal takes precedence over older website biographies. Institution names are accompanied by the source's distinction: trained by Alkan **or by the CEO on behalf of other institutions**. Endorser titles are identified as titles credited in the book, not claimed as current appointments.

The book does not explicitly identify a publisher. The site says this, and identifies TYPE Company Limited only as typesetter/printer. No book prices were supplied; all editions show **Price on request**, and order totals show **To be confirmed**, not a fabricated zero or amount. Programme outline fees are source proposal fees, not asserted as guaranteed current prices.

Original book covers and the author's portrait were extracted from the supplied PDF. The complete book PDF is **not** published or offered as a free download.

## Ordering

The cart stores book ID, format and quantity in browser localStorage, with validation on reload. Digital and physical editions are separate lines. Physical orders require a delivery address; all orders require buyer name, phone and email. Pricing, availability, digital fulfilment, delivery fees and payment arrangements must be confirmed by Alkan.

Checkout prepares an encoded WhatsApp message to **+233 244 333 051** or a `mailto:` email to **alberta@alkanbiz.com**, including every item, format, quantity and buyer detail. The buyer must review and send in the selected app. This is not an automatic email service, online payment gateway or digital delivery system. A real email client is required for `mailto:`. No test messages were sent to the business.

## Verification

Unit tests verify catalogue data, totals and round-trip encoding of WhatsApp/email payloads. Browser tests exercise all routes at desktop and 375px mobile widths; cart addition, removal, quantities, persistence, physical/digital selection; physical address validation; WhatsApp handoff; email URI; programme expansion; and mobile navigation. They also check JavaScript errors and horizontal overflow. Browser testing uses the npm-distributed serverless Chromium binary because browser CDN access may be restricted in the development environment.

## Original logo, introduction and full media gallery

- The header and footer request the original website logo at `https://alkanbiz.com/wp-content/uploads/2021/11/logo-2.png`. A faithful raster extraction of the actual logo from the supplied proposal is embedded locally as a fallback; no recreated lettering or substitute mark is used.
- The Home and Gallery pages embed `https://alkanbiz.com/wp-content/uploads/2026/07/Alkan-promo-final.mp4` unchanged, with native controls, inline mobile playback, no autoplay and no initial video download. The original website poster is used on the introduction player.
- `data/media.json` inventories **176** unique files returned by both pages of the public WordPress media API, plus **two** legacy images explicitly linked on the current About page: **178** items, comprising **23 videos and 155 images/artwork**. This includes alternate uploads, logos, graphics and stock assets, not 155 claimed event photographs.
- Inventory sources: `https://alkanbiz.com/wp-json/wp/v2/media?per_page=100&_fields=source_url` and the same URL with `page=2`; About-page image references are documented above. `scripts/create-media-inventory.py` reproduces the verified filename inventory.
- The gallery offers All media, Photos, Videos, Stock imagery and Website artwork filters, progressive loading, a keyboard-accessible lightbox with next/previous, original-file links, failure notices and video pause/cleanup on close or navigation. Filenames are retained; dates, events and identities are not inferred.
- Pexels-named source images are explicitly categorised as stock imagery, never presented as Alkan events. Existing website stock assets suffice; no fabricated event imagery was generated. Interface icons are lightweight local SVGs.
- **Source media remains hosted on alkanbiz.com.** This workspace cannot directly download/play files from that domain due to outbound network restrictions. Gallery UI and failure states are tested with deliberately blocked requests, but this does not certify availability or playback of every original remote file. Do not describe the gallery as an offline archive.
- Run `npm run build && python scripts/export-standalone.py` after website changes to refresh the downloadable HTML/ZIP and download page. Local fonts, covers and the logo fallback are embedded; remote intro/gallery media require internet and source-host availability. No video copies are committed to Git.
