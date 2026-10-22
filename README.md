# Alkan Business Consult

Responsive website rebuilt from alkanbiz.com and the two supplied PDFs. Vanilla JavaScript, CSS and Vite; fonts and imagery are served locally. No external API or backend is required.

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
