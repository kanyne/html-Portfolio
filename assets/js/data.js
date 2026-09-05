/* ============================================================
   Colosseum Berlin — App data (demo dataset)
   ============================================================ */
(function (global) {
  'use strict';

  var IMG = {
    atrium: 'assets/img/hero-atrium.jpg',
    wagenhalle: 'assets/img/wagenhalle.jpg',
    galerie: 'assets/img/galerie.jpg',
    saal1: 'assets/img/saal1.jpg',
    kino6: 'assets/img/kino6.jpg',
    foyer: 'assets/img/foyer.jpg'
  };

  /* ---------------- Spaces ---------------- */
  var KINOS = [
    { no: 2, area: 203, seats: 162 },
    { no: 3, area: 168, seats: 137 },
    { no: 4, area: 178, seats: 147 },
    { no: 5, area: 178, seats: 150 },
    { no: 6, area: 400, seats: 360 },
    { no: 7, area: 400, seats: 360 },
    { no: 8, area: 255, seats: 260 },
    { no: 9, area: 168, seats: 122 },
    { no: 10, area: 490, seats: 454 }
  ];

  var SPACES = [
    {
      id: 'atrium', num: '00', short: 'ATRIUM', name: 'The Atrium', floor: 'Ground',
      img: IMG.atrium,
      desc: 'The heart of the historic cinema complex: an 18-metre-high grand hall beneath glass roofs and three-tier interior balconies. Ten halls and 10,000 m² of event space connect through short passageways.',
      facts: [
        ['18 m', 'ceiling height'],
        ['10,000 m²', 'event area'],
        ['2,600', 'seats across halls'],
        ['130 years', 'of history']
      ],
      amenities: ['Oberlicht-glass roofs', 'Connecting passages', 'Gastronomy zones', 'Barrier-free access'],
      map: { x: 318, y: 174 }
    },
    {
      id: 'wagenhalle', num: '01', short: 'WAGENHALLE', name: 'Wagenhalle', floor: 'Ground',
      img: IMG.wagenhalle,
      desc: 'A historic carriage hall with honest brick and steel — the grandest open space of the house. Freely configurable seating for galas, product launches, markets, exhibitions and corporate gatherings.',
      facts: [
        ['1,600 m²', 'usable area'],
        ['18 m', 'room height'],
        ['700', 'gala guests (example)'],
        ['freely', 'configurable seating']
      ],
      amenities: ['Gastronomy zones', 'Sanitary facilities', 'Stage & truss ready', 'Direct loading access'],
      formats: ['Product launch', 'Gala dinner', 'MICE', 'Markets', 'Video shoot', 'Party', 'Weddings', 'Exhibitions', 'Corporate events', 'B2B'],
      map: { x: 96, y: 130 }
    },
    {
      id: 'galerie', num: '02', short: 'GALERIE', name: 'Galerie', floor: 'Upper',
      img: IMG.galerie,
      desc: 'An elegant upper-floor gallery with its own entrance, wheelchair-accessible lift and two large outdoor terraces — perfect for receptions, dinners with a view and break-out spaces.',
      facts: [
        ['800 m²', 'usable area'],
        ['2nd', 'floor'],
        ['2', 'large terraces'],
        ['own', 'entrance']
      ],
      amenities: ['Separate entrance', 'Two terraces', 'Lift access', 'Gastronomy zones', 'Sanitary facilities'],
      formats: ['Reception', 'Dinner', 'Break-out', 'Workshop', 'Exhibition'],
      map: { x: 130, y: 268, floorOnly: 'upper' }
    },
    {
      id: 'saal1', num: '03', short: 'SAAL 1', name: 'Saal 1', floor: 'Stage 1',
      img: IMG.saal1,
      desc: 'The flagship premiere cinema: 525 seats, a full stage, its own entrance and a ~500 m² foyer. Detached from the rest of the building, so you can run in parallel or alone.',
      facts: [
        ['535 m²', 'cinema'],
        ['525', 'seats'],
        ['~500 m²', 'foyer'],
        ['stage', 'included']
      ],
      amenities: ['Own entrance', 'Separated from building', 'Full stage', 'Gastronomy zones', 'Sanitary facilities'],
      formats: ['Premieres', 'Special screenings', 'Galas', 'Concerts', 'Festivals', 'Theatre', 'Talks'],
      map: { x: 560, y: 96, floorOnly: 'stage1' }
    },
    {
      id: 'kinosaele', num: '04', short: 'KINOSÄLE', name: 'Kinosäle 2–10', floor: 'Stage 1',
      img: IMG.kino6,
      desc: 'Nine additional screens from intimate 122-seat rooms to the 454-seat Saal 10 — all also bookable without seating, for screenings, concerts, comedy, gaming events and live streams.',
      facts: [
        ['9', 'cinemas'],
        ['2,075', 'seats total'],
        ['2,142 m²', 'cinema area'],
        ['unseated', 'option available']
      ],
      amenities: ['Dolby digital sound', 'Screen sizes 8–19 m', 'Reserved seating', 'Lounge areas'],
      formats: ['Films', 'Concerts', 'Comedy', 'Gaming', 'Live streaming', 'Presentations', 'Theatre'],
      map: { x: 560, y: 220, floorOnly: 'stage1' },
      cinemas: KINOS
    },
    {
      id: 'foyer', num: '05', short: 'FOYER', name: 'Foyer & Garderobe', floor: 'Ground',
      img: IMG.foyer,
      desc: 'The legendary foyer with its marquee glow, checkered floor and original ticket booths. Hosts the garderobe (coat check) that guest check-in flows through.',
      facts: [
        ['200 m²', 'foyer'],
        ['3', 'ticket counters'],
        ['1,200 p/h', 'check-in capacity'],
        ['coat check', 'garderobe']
      ],
      amenities: ['Check-in counters', 'QR gate', 'Garderobe', 'Concessions'],
      map: { x: 300, y: 322 }
    }
  ];

  /* ---------------- Events ---------------- */
  var EVENTS = [
    { id: 101, cat: 'premiere', title: 'Premiere: “Nachtfalter”', venue: 'Saal 1', date: '2026-09-10', time: '19:30', dur: '150 min', price: 18, seats: 525, sold: 461, img: IMG.saal1, desc: 'European premiere with red carpet, director Q&A and gala after-show in the Atrium.', tags: ['Premiere', 'Q&A', 'Red carpet'] },
    { id: 102, cat: 'concert', title: 'Berlin Philharmonic Chamber Night', venue: 'Wagenhalle', date: '2026-09-12', time: '20:00', dur: '120 min', price: 42, seats: 700, sold: 493, img: IMG.wagenhalle, desc: 'A chamber programme under the 18-metre roof — candle-light setting with dinner break.', tags: ['Classical', 'Dinner'] },
    { id: 103, cat: 'cinema', title: 'Open Air: „Metropolis“ (1927)', venue: 'Galerie Terrace', date: '2026-09-13', time: '21:15', dur: '145 min', price: 12, seats: 220, sold: 154, img: IMG.galerie, desc: 'Live-scored silent film classic on the upper terrace with views over the rooftops.', tags: ['Open air', 'Live score'] },
    { id: 104, cat: 'corporate', title: 'SECTOR Summit Berlin', venue: 'Wagenhalle', date: '2026-09-18', time: '09:00', dur: 'full day', price: 89, seats: 600, sold: 422, img: IMG.wagenhalle, desc: 'Europe’s independent founders meet for keynotes, stage interviews and a networking evening.', tags: ['B2B', 'Conference'] },
    { id: 105, cat: 'community', title: 'Colosseum Classic Ciné Club · Kafka', venue: 'Saal 6', date: '2026-09-20', time: '18:00', dur: '110 min', price: 9, seats: 360, sold: 176, img: IMG.kino6, desc: 'Monthly classic series: restored print, short intro talk and drink afterwards.', tags: ['Series', 'Restored print'] },
    { id: 106, cat: 'cinema', title: 'Family Morning: Pippi Langstrumpf', venue: 'Saal 8', date: '2026-09-27', time: '10:30', dur: '98 min', price: 7, seats: 260, sold: 91, img: IMG.kino6, desc: 'Sunday family screening with kids’ snack box and cinema tour for the little ones.', tags: ['Family', 'Kids'] },
    { id: 107, cat: 'premiere', title: 'Bootcamp Premiere & Horror Night', venue: 'Saal 10', date: '2026-10-02', time: '22:00', dur: '180 min', price: 15, seats: 454, sold: 389, img: IMG.saal1, desc: 'Midnight double-feature premiere with special guests and themed cocktails.', tags: ['Premiere', 'Midnight', 'Horror'] },
    { id: 108, cat: 'concert', title: 'Jazz in the Atrium: Lisa Wulff Trio', venue: 'Atrium', date: '2026-10-09', time: '20:30', dur: '90 min', price: 29, seats: 400, sold: 218, img: IMG.atrium, desc: 'Intimate jazz night beneath the glass roof — the balconies become the audience’s boxes.', tags: ['Jazz', 'Standing'] },
    { id: 109, cat: 'community', title: 'Comedy: Berlin Late Night Show', venue: 'Saal 3', date: '2026-10-16', time: '20:00', dur: '120 min', price: 19, seats: 137, sold: 121, img: IMG.kino6, desc: 'The capital’s sharpest stand-ups, filmed live for the late-night TV show.', tags: ['Stand-up', 'Filmed'] },
    { id: 110, cat: 'corporate', title: 'TechConnect Meetup & Dinner', venue: 'Galerie', date: '2026-10-22', time: '18:30', dur: '4 h', price: 35, seats: 300, sold: 144, img: IMG.galerie, desc: 'Network with 300 tech people on the gallery floor — two terraces, one big dinner table.', tags: ['Networking', 'Dinner'] },
    { id: 111, cat: 'cinema', title: 'CineRetro: „Blade Runner (1982)“', venue: 'Saal 7', date: '2026-10-30', time: '19:00', dur: '117 min', price: 11, seats: 360, sold: 240, img: IMG.kino6, desc: '35mm print, synth intro before the screening, synthwave DJ in the foyer after.', tags: ['35mm', 'Retro'] },
    { id: 112, cat: 'concert', title: 'Night of Electronic — 5 Stages', venue: 'Wagenhalle + Säle', date: '2026-11-06', time: '23:00', dur: '8 h', price: 48, seats: 2500, sold: 1733, img: IMG.atrium, desc: 'The house’s biggest night: five stages across Wagenhalle, Atrium and three cinemas.', tags: ['Festival', 'Multi-stage'] },
    { id: 113, cat: 'premiere', title: 'German Film Award Screening', venue: 'Saal 1', date: '2026-11-13', time: '19:00', dur: '160 min', price: 24, seats: 525, sold: 410, img: IMG.saal1, desc: 'Nominee screening followed by an industry reception in the premiere foyer.', tags: ['Awards', 'Industry'] },
    { id: 114, cat: 'community', title: 'Board Game Night in the Atrium', venue: 'Atrium', date: '2026-11-20', time: '17:00', dur: '6 h', price: 8, seats: 300, sold: 87, img: IMG.atrium, desc: 'Two hundred tables, free play, tournament rounds and a currywurst food counter.', tags: ['Family', 'Free play'] },
    { id: 115, cat: 'corporate', title: 'Innovation Festival — 2 Days', venue: 'Wagenhalle + Galerie', date: '2026-11-26', time: '09:00', dur: '2 days', price: 149, seats: 900, sold: 512, img: IMG.wagenhalle, desc: 'Two-day showcase with expo, parallel forums and an evening gala in the Wagenhalle.', tags: ['Expo', 'Forums'] },
    { id: 116, cat: 'cinema', title: 'Christmas Classic: „Drei Haselnüsse“', venue: 'Saal 2', date: '2026-12-06', time: '15:00', dur: '94 min', price: 8, seats: 162, sold: 96, img: IMG.kino6, desc: 'Advent Sunday screening with mulled punch in the foyer and a community sing-along.', tags: ['Family', 'Advent'] },
    { id: 117, cat: 'concert', title: 'Silent Christmas Gala', venue: 'Wagenhalle', date: '2026-12-18', time: '19:00', dur: '3 h', price: 55, seats: 700, sold: 344, img: IMG.wagenhalle, desc: 'Gala dinner, orchestra and mulled-wine bar in the candle-lit carriage hall.', tags: ['Gala', 'Dinner'] },
    { id: 118, cat: 'community', title: 'Silvester Film Marathon', venue: 'Saal 1 + 10', date: '2026-12-31', time: '21:00', dur: '6 h', price: 16, seats: 979, sold: 655, img: IMG.saal1, desc: 'Three midnight classics back-to-back with champagne at 00:00 in the Atrium.', tags: ['New Year', 'Marathon'] }
  ];

  /* ---------------- Map (SVG coordinate space 640×440) ---------------- */
  var MAP = {
    viewBox: '0 0 640 440',
    floors: [
      { id: 'ground', label: 'Ground floor' },
      { id: 'upper', label: 'Upper floor · Galerie' },
      { id: 'stage1', label: 'Stage 1 · Cinemas & Saal 1' }
    ],
    // amenities / waypoints
    nodes: [
      { id: 'north', label: 'North entrance', kind: 'exit', x: 300, y: 24 },
      { id: 'southeast', label: 'Side entrance', kind: 'exit', x: 596, y: 306 },
      { id: 'parking', label: 'Parking / P2', kind: 'parking', x: 42, y: 60 },
      { id: 'garderobe', label: 'Garderobe (coat check)', kind: 'amenity', x: 262, y: 322 },
      { id: 'wc', label: 'Restrooms', kind: 'amenity', x: 402, y: 322 },
      { id: 'elevator', label: 'Lift · Galerie', kind: 'amenity', x: 210, y: 262 },
      { id: 'bar', label: 'Moët Bar & Concessions', kind: 'amenity', x: 318, y: 108 }
    ],
    // corridor graph for routing (node ids)
    edges: [
      ['north', 'bar'], ['bar', 'wagen'], ['bar', 'atrium'], ['bar', 'saal1'],
      ['atrium', 'garderobe'], ['atrium', 'wc'], ['atrium', 'elevator'],
      ['garderobe', 'foyer'], ['wc', 'cinemas'], ['elevator', 'galerie'],
      ['cinemas', 'saal10'], ['saal1', 'cinemas'], ['foyer', 'southeast'], ['parking', 'north'],
      ['southeast', 'wc']
    ],
    routes: {
      north: { x: 300, y: 40, to: 300 },
      parking: { x: 60, y: 76, to: 300 },
      wagen: { x: 96, y: 170, to: 216 },
      atrium: { x: 318, y: 196, to: 304 },
      saal1: { x: 536, y: 120, to: 300 },
      cinemas: { x: 544, y: 228, to: 296 },
      saal10: { x: 560, y: 300, to: 0 },
      galerie: { x: 182, y: 300, to: 300 },
      garderobe: { x: 262, y: 322, to: 0 },
      elevator: { x: 210, y: 268, to: 0 },
      foyer: { x: 300, y: 348, to: 0 },
      wc: { x: 402, y: 322, to: 0 },
      bar: { x: 318, y: 118, to: 0 },
      southeast: { x: 596, y: 318, to: 0 }
    }
  };

  /* ---------------- i18n ---------------- */
  var I18N = {
    en: {
      appName: 'Colosseum', appSub: 'BERLIN · EVENTLOCATION',
      navHome: 'Home', navEvents: 'Events', navSpaces: 'Venue', navTickets: 'Tickets', navMore: 'More',
      homeKicker: 'SINCE 1895 · SCHÖNHAUSER ALLEE', homeTitle: 'Experience the Grand Cinema House', homeDesc: '10 cinema halls, a historic carriage hall, an 18-metre glass atrium — tickets, check-in and venue navigation in one app.',
      statEvents: 'events live', statSpaces: 'spaces', statSeats: 'seats',
      nextEvents: 'Upcoming highlights', nextEventsCta: 'All events', filterAll: 'All', filterCinema: 'Cinema', filterCorporate: 'Corporate', filterConcert: 'Concerts', filterCommunity: 'Special',
      searchEvents: 'Search events, venues…', buyTickets: 'Tickets', checkIn: 'Check-in', mapLink: 'Venue map', notificationsTitle: 'Stay in the loop', notificationsDesc: 'Reminders before events, new premieres and last-minute tickets.',
      enableNotifs: 'Enable notifications', buy: 'Buy tickets', free: 'Free', from: 'from', seatsLeft: 'left',
      eventDetails: 'Event details', ticketTypes: 'Ticket types', standard: 'Standard', premium: 'Premium (front rows)', vip: 'VIP · foyer lounge + drink', wheelchair: 'Wheelchair seat',
      qty: 'Quantity', continue: 'Continue', checkout: 'Checkout', name: 'Full name', email: 'Email address', card: 'Card number (demo)', pay: 'Pay', paying: 'Processing…',
      paySuccess: 'Payment successful', paySuccessDesc: 'Your tickets are ready — show the QR code at the gate.', order: 'Order', token: 'Token', viewTickets: 'View tickets', done: 'Done',
      myTickets: 'My tickets', noTickets: 'No tickets yet', noTicketsDesc: 'Browse the calendar and grab your seat.', browse: 'Browse events', addReminder: 'Add reminder', valid: 'VALID', used: 'USED', refunded: 'REFUNDED',
      checkInTitle: 'Check-in', checkInDesc: 'Scan tickets at the gate or enter the ticket code.', scan: 'Scan QR', manualLabel: 'Or enter ticket code', simulate: 'Demo scan', scanHint: 'Camera scanning uses your phone’s camera. You can also type the code.',
      okTitle: 'Ticket validated', okDesc: 'Guest checked in. Have a great event!', errTitle: 'Ticket not found', errDesc: 'Check the code — or validate in the security app.', reusedTitle: 'Already checked in', reusedDesc: 'This ticket was scanned earlier today.',
      todayStats: 'Today\'s check-ins', checked: 'checked in', recent: 'Recent scans', lastMin: 'min ago', scanHistory: 'Scan activity', clearLog: 'Clear log',
      notifications: 'Notifications', noNotifs: 'Nothing yet', noNotifsDesc: 'Event reminders and premiere announcements will appear here.', notifTitle1: 'Your event is almost here', notifDesc1: '{event} starts today at {time} — your QR code is in Tickets.', notifTitle2: 'New premiere announced', notifDesc2: '“{event}” just went on sale — only {n} seats left.', enableTxt: 'Turn on browser notifications to get these live.', disabledTxt: 'Notifications disabled — they still work inside the app.',
      venue: 'Venue', spaces: 'Spaces & capacities', spaceFacts: 'Hard facts', amenities: 'Amenities', formats: 'Event formats', floorPlans: 'Floor plans', viewMap: 'Map & navigation', capacity: 'capacity', area: 'space', height: 'height', seats: 'seats', guests: 'guests',
      mapTitle: 'Venue navigator', mapSub: 'Tap a pin for details, plan a route or find amenities.', routeFrom: 'From', routeTo: 'To', planRoute: 'Plan route', clearRoute: 'Clear route', legend: 'Legend', legendSpace: 'Event space', legendAmenity: 'Amenity', legendExit: 'Exit / entrance', legendParking: 'Parking', floorLabel: 'Floor',
      openMap: 'Open in Google Maps', address: 'Schönhauser Allee 123 · 10437 Berlin', reach: 'U2 Eberswalder Str. · M1/M10 · P2 garage', moreTitle: 'Guest hub', profile: 'Profile', settings: 'Settings', about: 'About the Colosseum', aboutDesc: 'The Colosseum Berlin Event GmbH combines a 130-year-old cinema complex with a state-of-the-art event location: 10 halls, 2,600 seats and 10,000 m² of space under the listed rooftops of Schönhauser Allee.', langLabel: 'Language', langEn: 'English', langDe: 'Deutsch', notifLabel: 'Notifications', resetDemo: 'Reset demo data', contact: 'Contact & rental enquiries', contactDesc: 'Plan your own event in the Wagenhalle, Galerie or one of the cinema halls.', requestOffer: 'Request an offer', thanks: 'Thank you!', thanksDesc: 'Our events team will get back to you within one business day.',
      deleteAll: 'Reset', keepOn: 'Keep', on: 'On', off: 'Off',
      footer: 'Demo build for concept evaluation — data is local and simulated.', loading: 'Loading…'
    },
    de: {
      appName: 'Colosseum', appSub: 'BERLIN · EVENTLOCATION',
      navHome: 'Start', navEvents: 'Events', navSpaces: 'Location', navTickets: 'Tickets', navMore: 'Mehr',
      homeKicker: 'SEIT 1895 · SCHÖNHAUSER ALLEE', homeTitle: 'Erlebe das große Kinohaus', homeDesc: '10 Kinosäle, eine historische Wagenhalle, ein 18 Meter hohes Atrium — Tickets, Check-in und Navigation in einer App.',
      statEvents: 'Events live', statSpaces: 'Flächen', statSeats: 'Sitzplätze',
      nextEvents: 'Highlights', nextEventsCta: 'Alle Events', filterAll: 'Alle', filterCinema: 'Kino', filterCorporate: 'Corporate', filterConcert: 'Konzerte', filterCommunity: 'Specials',
      searchEvents: 'Events, Flächen suchen…', buyTickets: 'Tickets', checkIn: 'Check-in', mapLink: 'Lageplan', notificationsTitle: 'Immer informiert', notificationsDesc: 'Erinnerungen vor Events, neue Premieren und Last-Minute-Tickets.',
      enableNotifs: 'Benachrichtigungen aktivieren', buy: 'Tickets', free: 'Frei', from: 'ab', seatsLeft: 'verfügbar',
      eventDetails: 'Event-Details', ticketTypes: 'Ticketkategorien', standard: 'Standard', premium: 'Premium (vordere Reihen)', vip: 'VIP · Foyer-Lounge + Getränk', wheelchair: 'Rollstuhlplatz',
      qty: 'Anzahl', continue: 'Weiter', checkout: 'Kasse', name: 'Vollständiger Name', email: 'E-Mail-Adresse', card: 'Kartennummer (Demo)', pay: 'Zahlen', paying: 'Wird verarbeitet…',
      paySuccess: 'Zahlung erfolgreich', paySuccessDesc: 'Deine Tickets sind bereit — zeige den QR-Code am Eingang.', order: 'Bestellung', token: 'Token', viewTickets: 'Tickets ansehen', done: 'Fertig',
      myTickets: 'Meine Tickets', noTickets: 'Noch keine Tickets', noTicketsDesc: 'Stöbere im Kalender und sichere dir deinen Platz.', browse: 'Events ansehen', addReminder: 'Erinnerung setzen', valid: 'GÜLTIG', used: 'EINGELÖST', refunded: 'ERSTATTET',
      checkInTitle: 'Check-in', checkInDesc: 'Ticket am Eingang scannen oder Code eingeben.', scan: 'QR scannen', manualLabel: 'Oder Ticketcode eingeben', simulate: 'Demo-Scan', scanHint: 'Die Kamera nutzt die Kamera deines Handys. Du kannst den Code auch eintippen.',
      okTitle: 'Ticket gültig', okDesc: 'Gast eingecheckt. Viel Spaß bei der Veranstaltung!', errTitle: 'Ticket nicht gefunden', errDesc: 'Code prüfen — oder im Sicherheits-App validieren.', reusedTitle: 'Bereits eingecheckt', reusedDesc: 'Dieses Ticket wurde heute schon gescannt.',
      todayStats: 'Check-ins heute', checked: 'eingecheckt', recent: 'Letzte Scans', lastMin: 'Min.', scanHistory: 'Scan-Aktivität', clearLog: 'Verlauf löschen',
      notifications: 'Benachrichtigungen', noNotifs: 'Noch nichts da', noNotifsDesc: 'Event-Erinnerungen und Premieren erscheinen hier.', notifTitle1: 'Dein Event startet gleich', notifDesc1: '{event} startet heute um {time} — dein QR-Code liegt unter Tickets.', notifTitle2: 'Neue Premiere angekündigt', notifDesc2: '„{event}“ ist neu im Verkauf — nur noch {n} Plätze!', enableTxt: 'Aktiviere Browser-Benachrichtigungen für Live-Töne.', disabledTxt: 'Benachrichtigungen sind aus — in der App funktioniert alles weiterhin.',
      venue: 'Location', spaces: 'Flächen & Kapazitäten', spaceFacts: 'Hard Facts', amenities: 'Ausstattung', formats: 'Eventformate', floorPlans: 'Grundrisse', viewMap: 'Karte & Navigation', capacity: 'Kapazität', area: 'Fläche', height: 'Höhe', seats: 'Plätze', guests: 'Gäste',
      mapTitle: 'Navigator', mapSub: 'Pin antippen, Route planen oder Ausstattung finden.', routeFrom: 'Von', routeTo: 'Nach', planRoute: 'Route planen', clearRoute: 'Route löschen', legend: 'Legende', legendSpace: 'Eventfläche', legendAmenity: 'Ausstattung', legendExit: 'Eingang / Ausgang', legendParking: 'Parken', floorLabel: 'Ebene',
      openMap: 'In Google Maps öffnen', address: 'Schönhauser Allee 123 · 10437 Berlin', reach: 'U2 Eberswalder Str. · M1/M10 · Parkhaus P2', moreTitle: 'Gäste-Hub', profile: 'Profil', settings: 'Einstellungen', about: 'Über das Colosseum', aboutDesc: 'Die Colosseum Berlin Event GmbH verbindet ein 130 Jahre altes Kino-Ensemble mit moderner Eventlocation: 10 Säle, 2.600 Plätze und 10.000 m² Fläche unter den denkmalgeschützten Dächern der Schönhauser Allee.', langLabel: 'Sprache', langEn: 'English', langDe: 'Deutsch', notifLabel: 'Benachrichtigungen', resetDemo: 'Demo-Daten zurücksetzen', contact: 'Kontakt & Mietanfragen', contactDesc: 'Plane dein eigenes Event in der Wagenhalle, Galerie oder einem der Kinosäle.', requestOffer: 'Angebot anfragen', thanks: 'Danke!', thanksDesc: 'Unser Event-Team meldet sich innerhalb eines Werktags.',
      deleteAll: 'Zurücksetzen', keepOn: 'Behalten', on: 'An', off: 'Aus',
      footer: 'Demo-Build zur Konzeptbewertung — Daten sind lokal und simuliert.', loading: 'Lädt…'
    }
  };

  global.COLO_DATA = {
    IMG: IMG,
    SPACES: SPACES,
    KINOS: KINOS,
    EVENTS: EVENTS,
    MAP: MAP,
    I18N: I18N,
    VENUE: {
      address: 'Schönhauser Allee 123, 10437 Berlin',
      mapsUrl: 'https://maps.google.com/?q=Colosseum+Eventlocation+Berlin',
      contact: 'events@colosseumberlin.com',
      phone: '+49 30 44 34 305 0'
    }
  };
})(typeof window !== 'undefined' ? window : this);
